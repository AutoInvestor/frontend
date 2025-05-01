export class Asset {
    assetId: string;
    mic: string;
    ticker: string;
    price?: number;

    constructor(assetId: string, mic: string, ticker: string, price?: number) {
        this.assetId = assetId;
        this.mic = mic;
        this.ticker = ticker;
        this.price = price;
    }
}