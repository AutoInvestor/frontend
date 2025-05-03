export interface Asset {
    assetId: string;
    ticker: string;
    mic: string;
    price?: AssetPriceData;
}

export interface AssetPriceData {
    date: Date;
    price: number;
}