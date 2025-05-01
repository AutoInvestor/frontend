export class PortfolioHolding {
    assetId: string;
    amount: number;
    boughtPrice: number;

    constructor(assetId: string, amount: number, boughtPrice: number) {
        this.assetId = assetId;
        this.amount = amount;
        this.boughtPrice = boughtPrice;
    }
}