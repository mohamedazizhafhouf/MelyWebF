export interface CurrencyConvertResponseDto {
    from: string;
    to: string;
    amount: number;
    result: number;
    rate: number | null;
    providerTimestamp: number | null;
    disclaimer: string;
}
