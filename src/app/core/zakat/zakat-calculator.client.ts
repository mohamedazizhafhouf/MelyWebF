import { ZakatBreakdownLine, ZakatCalculationRequest, ZakatCalculationResult, ZakatDefaults } from '../models/zakat.model';

/**
 * Disclaimer and built-in defaults must stay aligned with `ZakatCalculatorService.DISCLAIMER` and
 * `mely.zakat.*` in BankSystemAPI `application.properties`.
 */
export const ZAKAT_DISCLAIMER = `This tool provides a simplified Zakat estimate for educational purposes only. It is not a fatwa or formal religious ruling. Zakat rules vary by school of thought, asset type, debt timing, and personal circumstances. Always verify with a qualified scholar or trusted charity before paying Zakat. Mely uses a gold-based niṣāb threshold in this version (configured grams × your gold price per gram).`;

/** Built-in defaults when not loading from the API (kept in sync with `mely.zakat.*`). */
export const ZAKAT_BUILTIN_DEFAULTS: ZakatDefaults = {
    goldNisabGrams: 87.48,
    silverNisabGrams: 612.36,
    defaultGoldPricePerGram: 75,
    defaultSilverPricePerGram: 1,
    zakatRate: 0.025
};

function round2HalfUp(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}

function nz(n: number | null | undefined): number {
    return n == null || Number.isNaN(n) ? 0 : n;
}

/** Same rules as `ZakatCalculatorService.calculate` (Java) — runs synchronously in the browser. */
export function computeZakatClient(request: ZakatCalculationRequest, properties: ZakatDefaults): ZakatCalculationResult {
    const goldPrice = request.goldPricePerGram ?? properties.defaultGoldPricePerGram;
    const silverPrice = request.silverPricePerGram ?? properties.defaultSilverPricePerGram;

    if (goldPrice == null || goldPrice <= 0) {
        throw new Error(
            'Gold price per gram must be positive (enter a value or use “Use default prices”, or configure the API default).'
        );
    }
    if (silverPrice == null || silverPrice <= 0) {
        throw new Error(
            'Silver price per gram must be positive (enter a value or use “Use default prices”, or configure the API default).'
        );
    }

    const cash = nz(request.cash);
    const bankSavings = nz(request.bankSavings);
    const receivables = nz(request.receivables);
    const tradeGoods = nz(request.tradeGoods);
    const investments = nz(request.investmentsZakatable);
    const other = nz(request.otherAssets);
    const debts = nz(request.debts);
    const goldGrams = nz(request.goldGrams);
    const silverGrams = nz(request.silverGrams);

    const goldValue = goldGrams * goldPrice;
    const silverValue = silverGrams * silverPrice;

    const assetTotal = cash + bankSavings + receivables + tradeGoods + investments + other + goldValue + silverValue;

    const warnings: string[] = [];
    let netZakatable = assetTotal - debts;
    if (netZakatable < 0) {
        warnings.push('Debts exceed declared assets; net zakatable wealth is treated as zero for this estimate.');
        netZakatable = 0;
    }
    netZakatable = round2HalfUp(netZakatable);

    const nisabThreshold = round2HalfUp(properties.goldNisabGrams * goldPrice);

    const meetsNisab = netZakatable >= nisabThreshold;

    const rate = properties.zakatRate;
    let hypotheticalZakat = 0;
    if (netZakatable > 0) {
        hypotheticalZakat = round2HalfUp(netZakatable * rate);
    }

    let zakatDue = 0;
    if (request.hawlAcknowledged && meetsNisab) {
        zakatDue = hypotheticalZakat;
    }

    const breakdown: ZakatBreakdownLine[] = [];
    const addIfPositive = (label: string, amount: number) => {
        if (amount > 0) {
            breakdown.push({ label, amount: round2HalfUp(amount) });
        }
    };

    addIfPositive('Cash', cash);
    addIfPositive('Bank savings', bankSavings);
    addIfPositive('Receivables', receivables);
    addIfPositive('Trade / business goods', tradeGoods);
    addIfPositive('Investments (zakatable portion)', investments);
    addIfPositive('Other zakatable assets', other);
    if (goldGrams > 0) {
        breakdown.push({ label: 'Gold (value at your price per gram)', amount: round2HalfUp(goldValue) });
    }
    if (silverGrams > 0) {
        breakdown.push({ label: 'Silver (value at your price per gram)', amount: round2HalfUp(silverValue) });
    }
    breakdown.push({ label: 'Subtotal assets', amount: round2HalfUp(assetTotal) });
    if (debts > 0) {
        breakdown.push({ label: 'Deductible debts', amount: round2HalfUp(-debts) });
    }
    breakdown.push({ label: 'Net zakatable wealth', amount: netZakatable });
    const gPlain = formatGramsLabel(properties.goldNisabGrams);
    breakdown.push({
        label: `Niṣāb threshold (gold ${gPlain} g × gold price)`,
        amount: nisabThreshold
    });

    return {
        netZakatable,
        nisabThreshold,
        meetsNisab,
        zakatDue,
        hypotheticalZakat,
        rate,
        breakdown,
        disclaimer: ZAKAT_DISCLAIMER,
        warnings
    };
}

/** Plain string for niṣāb label; mirrors BigDecimal.stripTrailingZeros for common values. */
function formatGramsLabel(g: number): string {
    const s = g.toFixed(4).replace(/\.?0+$/, '');
    return s || '0';
}
