/**
 * Client-side mirror of manual halal stock screening in BankSystemAPI:
 * RuleProfileSeeder, KeywordBusinessActivityAnalyzer, DefaultScreeningRulesEngine,
 * DefaultTatheerCalculator, DefaultExplanationComposer.
 * Keep thresholds/keywords in sync with the backend seeder.
 */
import {
    MetricUsedResponse,
    RuleResultResponse,
    StockScreeningFormValue,
    StockScreeningResponse,
    StockVerdict
} from '../models/stock-screening.model';

export const LOCAL_STOCK_REQUEST_PREFIX = 'local-';

/** sessionStorage key for a completed local screening payload. */
export function stockScreeningLocalStorageKey(requestId: string): string {
    return `mely.stockScreening.local:${requestId}`;
}

export interface RuleProfileClient {
    thresholds: {
        debtRatioThreshold: number;
        cashRatioThreshold: number;
        nonCompliantIncomeThreshold: number;
    };
    prohibitedKeywords: string[];
}

/** Mirrors `RuleProfileSeeder` defaults in the API. */
export const DEFAULT_RULE_PROFILE: RuleProfileClient = {
    thresholds: {
        debtRatioThreshold: 0.33,
        cashRatioThreshold: 0.33,
        nonCompliantIncomeThreshold: 0.05
    },
    prohibitedKeywords: [
        'alcohol',
        'gambling',
        'casino',
        'pork',
        'interest',
        'riba',
        'conventional banking',
        'adult entertainment',
        'weapons'
    ]
};

const REQUIRED_SYNC_METRICS = [
    'interestBearingDebt',
    'cashAndInterestBearingAssets',
    'totalAssetsOrMarketCap',
    'totalRevenue',
    'nonCompliantIncome'
] as const;

type MetricKey = (typeof REQUIRED_SYNC_METRICS)[number] | 'sharesOwned' | 'investedAmount' | 'sharesOutstanding';

interface ResolvedMetricClient {
    value: number;
    source: string;
    sourceDocument: null;
    pageNumber: null;
    snippet: null;
}

interface ActivityAnalysis {
    compliant: boolean;
    matchedKeyword: string | null;
    rationale: string;
}

/** In-memory rule row before mapping to `RuleResultResponse` (matches backend JSON shape). */
interface RuleDraft {
    ruleCode: string;
    label: string;
    status?: string;
    passed?: boolean | null;
    message?: string;
    details?: Record<string, unknown>;
    purificationFlag?: boolean;
}

function divHalfUp6(numerator: number, denominator: number): number | null {
    if (denominator === 0 || numerator === undefined || denominator === undefined) {
        return null;
    }
    const v = numerator / denominator;
    return Math.round(v * 1e6) / 1e6;
}

function roundScale6(n: number): number {
    return Math.round(n * 1e6) / 1e6;
}

function buildManualMetrics(form: StockScreeningFormValue): Map<string, ResolvedMetricClient> {
    const metrics = new Map<string, ResolvedMetricClient>();
    const put = (key: MetricKey, v: number | null) => {
        if (v != null) {
            metrics.set(key, {
                value: v,
                source: 'manual',
                sourceDocument: null,
                pageNumber: null,
                snippet: null
            });
        }
    };
    put('interestBearingDebt', form.interestBearingDebt);
    put('cashAndInterestBearingAssets', form.cashAndInterestBearingAssets);
    put('totalAssetsOrMarketCap', form.totalAssetsOrMarketCap);
    put('totalRevenue', form.totalRevenue);
    put('nonCompliantIncome', form.nonCompliantIncome);
    put('sharesOwned', form.sharesOwned);
    put('investedAmount', form.investedAmount);
    return metrics;
}

function hasAllRequiredSyncMetrics(metrics: Map<string, ResolvedMetricClient>): boolean {
    return REQUIRED_SYNC_METRICS.every((k) => metrics.has(k));
}

function analyzeActivity(form: StockScreeningFormValue, profile: RuleProfileClient): ActivityAnalysis {
    const parts = [form.sector, form.businessDescription].filter((x) => x != null && String(x).trim() !== '');
    const searchableText = parts.join(' ').toLowerCase();

    for (const keyword of profile.prohibitedKeywords) {
        if (searchableText.includes(keyword.toLowerCase())) {
            return {
                compliant: false,
                matchedKeyword: keyword,
                rationale: `The company activity matched prohibited keyword '${keyword}'.`
            };
        }
    }
    return {
        compliant: true,
        matchedKeyword: null,
        rationale: 'No prohibited business activity keywords were detected in the submitted company profile.'
    };
}

function metricValue(metrics: Map<string, ResolvedMetricClient>, key: string): number | null {
    const m = metrics.get(key);
    return m != null ? m.value : null;
}

function computeRatio(
    metrics: Map<string, ResolvedMetricClient>,
    numeratorKey: string,
    denominatorKey: string
): { actual: number | null; missing: boolean } {
    const numerator = metricValue(metrics, numeratorKey);
    const denominator = metricValue(metrics, denominatorKey);
    if (numerator == null || denominator == null || denominator <= 0) {
        return { actual: null, missing: true };
    }
    return { actual: divHalfUp6(numerator, denominator), missing: false };
}

function baseRule(ruleCode: string, label: string): RuleDraft {
    return { ruleCode, label };
}

function passRule(rule: RuleDraft, message: string) {
    rule.status = 'PASS';
    rule.passed = true;
    rule.message = message;
}

function failRule(rule: RuleDraft, message: string) {
    rule.status = 'FAIL';
    rule.passed = false;
    rule.message = message;
}

function evaluateRules(
    profile: RuleProfileClient,
    metrics: Map<string, ResolvedMetricClient>,
    activity: ActivityAnalysis
): {
    verdict: StockVerdict;
    halalEligible: boolean;
    ruleResults: RuleDraft[];
    warnings: string[];
    metricsUsed: Record<string, MetricUsedResponse>;
} {
    const ruleResults: RuleDraft[] = [];
    const warnings: string[] = [];

    const { debtRatioThreshold, cashRatioThreshold, nonCompliantIncomeThreshold } = profile.thresholds;

    const metricsUsed: Record<string, MetricUsedResponse> = {};
    metrics.forEach((value, key) => {
        metricsUsed[key] = {
            value: value.value,
            source: value.source,
            sourceDocument: value.sourceDocument,
            pageNumber: value.pageNumber,
            snippet: value.snippet
        };
    });

    const activityRule = baseRule('activity-screen', 'Business activity screening');
    if (activity.compliant) {
        passRule(activityRule, activity.rationale);
    } else {
        failRule(activityRule, activity.rationale);
    }
    if (activity.matchedKeyword != null) {
        activityRule.details = { matchedKeyword: activity.matchedKeyword } as Record<string, unknown>;
    }
    ruleResults.push(activityRule);

    let missingRequiredMetrics = false;
    let anyFailedRatio = false;

    const debtRatio = computeRatio(metrics, 'interestBearingDebt', 'totalAssetsOrMarketCap');
    ruleResults.push(
        createRatioRule(
            'debt-ratio',
            'Interest-bearing debt ratio',
            debtRatio,
            debtRatioThreshold,
            'interestBearingDebt / totalAssetsOrMarketCap',
            warnings
        )
    );
    missingRequiredMetrics ||= debtRatio.missing;
    anyFailedRatio ||= !debtRatio.missing && debtRatio.actual != null && debtRatio.actual > debtRatioThreshold;

    const cashRatio = computeRatio(metrics, 'cashAndInterestBearingAssets', 'totalAssetsOrMarketCap');
    ruleResults.push(
        createRatioRule(
            'cash-ratio',
            'Interest-bearing cash/assets ratio',
            cashRatio,
            cashRatioThreshold,
            'cashAndInterestBearingAssets / totalAssetsOrMarketCap',
            warnings
        )
    );
    missingRequiredMetrics ||= cashRatio.missing;
    anyFailedRatio ||= !cashRatio.missing && cashRatio.actual != null && cashRatio.actual > cashRatioThreshold;

    const incomeRatio = computeRatio(metrics, 'nonCompliantIncome', 'totalRevenue');
    const incomeRule = createRatioRule(
        'non-compliant-income-ratio',
        'Non-compliant income ratio',
        incomeRatio,
        nonCompliantIncomeThreshold,
        'nonCompliantIncome / totalRevenue',
        warnings
    );
    if (!incomeRatio.missing && incomeRatio.actual != null && incomeRatio.actual > 0) {
        incomeRule.purificationFlag = true;
    }
    ruleResults.push(incomeRule);
    missingRequiredMetrics ||= incomeRatio.missing;
    anyFailedRatio ||= !incomeRatio.missing && incomeRatio.actual != null && incomeRatio.actual > nonCompliantIncomeThreshold;

    let verdict: StockVerdict;
    let halalEligible: boolean;
    if (!activity.compliant || anyFailedRatio) {
        verdict = 'NON_HALAL';
        halalEligible = false;
    } else if (missingRequiredMetrics) {
        verdict = 'REVIEW_REQUIRED';
        halalEligible = false;
        warnings.push('Some financial metrics are missing, so the system could not produce a fully confident Sharia verdict.');
    } else {
        verdict = 'HALAL';
        halalEligible = true;
    }

    return { verdict, halalEligible, ruleResults, warnings, metricsUsed };
}

function createRatioRule(
    ruleCode: string,
    label: string,
    ratioOutcome: { actual: number | null; missing: boolean },
    threshold: number,
    formula: string,
    warnings: string[]
): RuleDraft {
    const rule = baseRule(ruleCode, label);
    const details: Record<string, unknown> = { formula, threshold };

    if (ratioOutcome.missing) {
        rule.status = 'REVIEW_REQUIRED';
        rule.passed = null;
        rule.message = 'Required values are missing for this ratio.';
        details['actualValue'] = null;
        warnings.push(`Missing inputs for ${label}.`);
    } else if (ratioOutcome.actual != null && ratioOutcome.actual > threshold) {
        failRule(rule, `${label} exceeds the configured threshold.`);
        details['actualValue'] = ratioOutcome.actual;
    } else {
        passRule(rule, `${label} is within the configured threshold.`);
        details['actualValue'] = ratioOutcome.actual;
    }

    rule.details = details;
    return rule;
}

function calculateTatheer(
    metrics: Map<string, ResolvedMetricClient>,
    halalEligible: boolean
): {
    needsTatheer: boolean;
    tatheerAmount: number | null;
    purificationRatio: number | null;
    purificationPerShare: number | null;
} {
    const nonCompliantIncome = metricValue(metrics, 'nonCompliantIncome');
    const totalRevenue = metricValue(metrics, 'totalRevenue');
    const investedAmount = metricValue(metrics, 'investedAmount');
    const sharesOwned = metricValue(metrics, 'sharesOwned');
    const sharesOutstanding = metricValue(metrics, 'sharesOutstanding');

    let purificationRatio: number | null = null;
    if (nonCompliantIncome != null && totalRevenue != null && totalRevenue > 0) {
        purificationRatio = divHalfUp6(nonCompliantIncome, totalRevenue);
    }

    let purificationPerShare: number | null = null;
    if (nonCompliantIncome != null && sharesOutstanding != null && sharesOutstanding > 0) {
        purificationPerShare = divHalfUp6(nonCompliantIncome, sharesOutstanding);
    }

    let tatheerAmount: number | null = null;
    if (halalEligible) {
        if (investedAmount != null && purificationRatio != null) {
            tatheerAmount = roundScale6(investedAmount * purificationRatio);
        } else if (sharesOwned != null && purificationPerShare != null) {
            tatheerAmount = roundScale6(sharesOwned * purificationPerShare);
        }
    }

    const needsTatheer = Boolean(
        halalEligible && purificationRatio != null && purificationRatio > 0
    );

    return { needsTatheer, tatheerAmount, purificationRatio, purificationPerShare };
}

function composeUserMessage(companyName: string, verdict: StockVerdict, activity: ActivityAnalysis): string {
    const name = companyName || 'This company';
    const verdictLine =
        verdict === 'HALAL'
            ? `${name} passed the current Sharia screening profile.`
            : verdict === 'NON_HALAL'
              ? `${name} did not pass the current Sharia screening profile.`
              : `${name} needs a manual review because some required financial inputs are still missing.`;
    return `${verdictLine} ${activity.rationale}`;
}

function prettyVerdict(verdict: StockVerdict): string {
    switch (verdict) {
        case 'HALAL':
            return 'Halal';
        case 'NON_HALAL':
            return 'Non-halal';
        case 'REVIEW_REQUIRED':
            return 'Review required';
    }
}

function renderRule(rule: RuleDraft): string {
    const label = String(rule.label);
    const status = String(rule.status);
    const message = String(rule.message);
    const details = rule.details;
    let detailStr = '';
    if (details && typeof details === 'object' && !Array.isArray(details) && Object.keys(details).length > 0) {
        detailStr =
            ' (' +
            Object.entries(details as Record<string, unknown>)
                .map(([k, v]) => `${k}=${v}`)
                .join(', ') +
            ')';
    }
    return `- ${label} [${status}]: ${message}${detailStr}`;
}

function composeDetailedExplanation(
    companyName: string,
    verdict: StockVerdict,
    activity: ActivityAnalysis,
    ruleResults: RuleDraft[]
): string {
    const rules = ruleResults.map(renderRule).join('\n');
    return `Company: ${companyName}
Verdict: ${prettyVerdict(verdict)}
Activity analysis: ${activity.rationale}

Rule trace:
${rules}`.trim();
}

function mapRuleResults(ruleResults: RuleDraft[]): RuleResultResponse[] {
    return ruleResults.map((rule) => ({
        ruleCode: String(rule.ruleCode),
        label: String(rule.label),
        status: String(rule.status),
        passed: rule.passed === undefined || rule.passed === null ? null : Boolean(rule.passed),
        message: String(rule.message),
        details: rule.details ?? null
    }));
}

/** Runs the same pipeline as `StockScreeningProcessingService.processRequest` for manual metrics (no documents). */
export function computeLocalStockScreening(
    form: StockScreeningFormValue,
    profile: RuleProfileClient = DEFAULT_RULE_PROFILE
): StockScreeningResponse {
    const metrics = buildManualMetrics(form);
    if (!hasAllRequiredSyncMetrics(metrics)) {
        throw new Error('Manual screening requires all core financial metrics.');
    }

    const activity = analyzeActivity(form, profile);
    const computation = evaluateRules(profile, metrics, activity);
    const tatheer = calculateTatheer(metrics, computation.halalEligible);

    const now = new Date().toISOString();
    const requestId = LOCAL_STOCK_REQUEST_PREFIX + crypto.randomUUID();

    const userMessage = composeUserMessage(form.companyName, computation.verdict, activity);
    const explanation = composeDetailedExplanation(
        form.companyName,
        computation.verdict,
        activity,
        computation.ruleResults
    );

    return {
        requestId,
        screeningMode: 'MANUAL',
        status: 'COMPLETED',
        companyName: form.companyName,
        ticker: form.ticker?.trim() || null,
        verdict: computation.verdict,
        needsTatheer: tatheer.needsTatheer,
        tatheerAmount: tatheer.tatheerAmount,
        purificationRatio: tatheer.purificationRatio,
        purificationPerShare: tatheer.purificationPerShare,
        ruleResults: mapRuleResults(computation.ruleResults),
        metricsUsed: computation.metricsUsed,
        warnings: computation.warnings,
        userMessage,
        explanation,
        activitySummary: null,
        documents: [],
        createdAt: now,
        completedAt: now
    };
}

export function parseStoredStockScreening(json: string): StockScreeningResponse | null {
    try {
        return JSON.parse(json) as StockScreeningResponse;
    } catch {
        return null;
    }
}
