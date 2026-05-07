export type ZakatAssetType =
    | 'CASH'
    | 'GOLD'
    | 'SILVER'
    | 'BUSINESS_INVENTORY'
    | 'INVESTMENT_STOCKS'
    | 'INVESTMENT_REAL_ESTATE'
    | 'INVESTMENT_MUTUAL_FUNDS'
    | 'SAVINGS_ACCOUNT'
    | 'CURRENT_ACCOUNT'
    | 'EXCHANGE_TRADED_FUNDS'
    | 'CRYPTO_CURRENCY'
    | 'RETIREMENT_FUNDS'
    | 'OTHER_ASSETS';

export interface ZakatAssetDto {
    id: string;
    assetType: ZakatAssetType;
    amount: string;
    value: string;
    currencyCode: string;
    description: string | null;
    acquisitionDate: string | null;
    lastUpdated: string | null;
    active: boolean | null;
    weight: string | null;
    purity: string | null;
    annualReturnRate: string | null;
}

export interface ZakatAssetWrite {
    assetType: ZakatAssetType;
    amount: number;
    value: number;
    currencyCode?: string;
    description?: string | null;
    acquisitionDate?: string | null;
    weight?: number | null;
    purity?: number | null;
    annualReturnRate?: number | null;
}

export interface HawlStatusDto {
    id: string;
    hawlStartDate: string;
    hawlEndDate: string;
    lastCalculationDate: string | null;
    hawlCompleted: boolean | null;
    daysRemaining: number | null;
}

export interface ZakatPortfolioCalculationDto {
    userId?: string;
    calculationDate?: string;
    hawlStartDate?: string;
    hawlEndDate?: string;
    totalAssets?: string;
    nisabThreshold?: string;
    nisabCurrency?: string;
    isAboveNisab?: boolean;
    zakatDueAmount?: string;
    zakatRate?: string;
    zakatStatus?: string;
    assetBreakdown?: Record<string, string>;
    message?: string;
}

export type TransactionDirection = 'INCOME' | 'EXPENSE';

export interface PersonalTransactionDto {
    id: string;
    userId: string;
    occurredOn: string;
    direction: TransactionDirection;
    categoryCode: string;
    amount: string;
    memo: string | null;
    createdAt: string;
}

export interface PersonalBudgetDto {
    id: string;
    userId: string;
    yearMonth: string;
    categoryCode: string;
    capAmount: string;
}

export interface MoneySummaryDto {
    totalIncome: string;
    totalExpense: string;
    netCashFlow: string;
    expenseByCategory: { categoryCode: string; spent: string; budgetCap: string | null }[];
}

export interface SavingsGoalDto {
    id: string;
    title: string;
    targetAmount: string;
    currentAmount: string;
    targetDate: string | null;
    createdAt: string;
}

export interface SavingsSimulationPointDto {
    monthIndex: number;
    balance: string;
}

export interface SavingsSimulationResponseDto {
    disclaimer: string;
    finalBalance: string;
    points: SavingsSimulationPointDto[];
}
