export interface MetalSpotQuote {
    metal: string;
    currency: string;
    pricePerTroyOunce: number | null;
    priceGram24k: number | null;
    pricePerKilogram: number | null;
    timestamp: number | null;
    error?: string | null;
}

export interface MetalsSpotBundle {
    gold: MetalSpotQuote;
    silver: MetalSpotQuote;
    currency: string;
}

export interface MetalHistoryChart {
    labels: string[];
    goldPricePerGram24k: (number | null)[];
    silverPricePerGram24k: (number | null)[];
    currency: string;
    note?: string | null;
}
