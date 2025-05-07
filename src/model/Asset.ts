export interface Asset {
    assetId: string;
    ticker: string;
    mic: string;
}

export interface AssetPriceData {
    date: Date;
    price: number;
}