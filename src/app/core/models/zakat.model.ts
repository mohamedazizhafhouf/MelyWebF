export interface ZakatBreakdownLine {
    label: string;
    amount: number;
}

export interface ZakatDefaults {
    goldNisabGrams: number;
    silverNisabGrams: number;
    defaultGoldPricePerGram: number;
    defaultSilverPricePerGram: number;
    zakatRate: number;
}

export interface ZakatCalculationRequest {
    cash?: number;
    bankSavings?: number;
    receivables?: number;
    tradeGoods?: number;
    investmentsZakatable?: number;
    otherAssets?: number;
    debts?: number;
    goldGrams?: number;
    silverGrams?: number;
    goldPricePerGram?: number;
    silverPricePerGram?: number;
    hawlAcknowledged: boolean;
}

export interface ZakatCalculationResult {
    netZakatable: number;
    nisabThreshold: number;
    meetsNisab: boolean;
    zakatDue: number;
    hypotheticalZakat: number;
    rate: number;
    breakdown: ZakatBreakdownLine[];
    disclaimer: string;
    warnings: string[];
}
