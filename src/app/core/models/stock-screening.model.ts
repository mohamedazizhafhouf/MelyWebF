export type StockScreeningStatus = 'SUBMITTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type StockVerdict = 'HALAL' | 'NON_HALAL' | 'REVIEW_REQUIRED';
export type RequestedMode = 'SYNC' | 'ASYNC';
export type StockScreeningMode = 'MANUAL' | 'AUTOMATIC_LLM';

export interface MetricUsedResponse {
    value: string | number | boolean | null;
    source: string | null;
    sourceDocument: string | null;
    pageNumber: number | null;
    snippet: string | null;
}

export interface RuleResultResponse {
    ruleCode: string;
    label: string;
    status: string;
    /** Null when the rule is REVIEW_REQUIRED due to missing inputs (matches backend JSON). */
    passed: boolean | null;
    message: string;
    details?: Record<string, unknown> | null;
}

export interface StockDocumentResponse {
    id: string;
    originalFileName: string;
    contentType: string | null;
    size: number;
    extractionStatus: string;
}

export interface StockScreeningResponse {
    requestId: string;
    screeningMode: StockScreeningMode;
    status: StockScreeningStatus;
    companyName: string | null;
    ticker: string | null;
    verdict: StockVerdict | null;
    needsTatheer: boolean | null;
    tatheerAmount: number | null;
    purificationRatio: number | null;
    purificationPerShare: number | null;
    ruleResults: RuleResultResponse[] | null;
    metricsUsed: Record<string, MetricUsedResponse> | null;
    warnings: string[];
    userMessage: string | null;
    explanation: string | null;
    activitySummary: string | null;
    documents: StockDocumentResponse[];
    createdAt: string;
    completedAt: string | null;
}

export interface StockExplanationResponse {
    requestId: string;
    screeningMode: StockScreeningMode;
    status: StockScreeningStatus;
    verdict: StockVerdict | null;
    explanation: string | null;
    userMessage: string | null;
    warnings: string[];
    completedAt: string | null;
}

export interface StockScreeningHistoryItemResponse {
    requestId: string;
    companyName: string | null;
    ticker: string | null;
    status: StockScreeningStatus;
    verdict: StockVerdict | null;
    needsTatheer: boolean | null;
    tatheerAmount: number | null;
    purificationRatio: number | null;
    userMessage: string | null;
    createdAt: string;
    completedAt: string | null;
    requestedMode: RequestedMode;
    screeningMode: StockScreeningMode;
}

export interface StockScreeningHistoryResponse {
    content: StockScreeningHistoryItemResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
}

export interface StockHistoryFilters {
    page?: number;
    size?: number;
    status?: StockScreeningStatus | '';
    verdict?: StockVerdict | '';
    query?: string;
}

export interface StockScreeningFormValue {
    companyName: string;
    ticker: string;
    countryOrMarket: string;
    currency: string;
    businessDescription: string;
    sector: string;
    fiscalYear: string;
    reportingPeriod: string;
    interestBearingDebt: number | null;
    cashAndInterestBearingAssets: number | null;
    totalAssetsOrMarketCap: number | null;
    totalRevenue: number | null;
    nonCompliantIncome: number | null;
    sharesOwned: number | null;
    investedAmount: number | null;
    documents: File[];
}
