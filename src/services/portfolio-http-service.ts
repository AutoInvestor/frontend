import {BaseHttpService} from "@/services/base-http-service.ts";
import {PortfolioHolding} from "@/model/PortfolioHolding.ts";

export class PortfolioHttpService extends BaseHttpService {
    public constructor() {
        super();
    }

    private getRandomInt(min: number, max: number): number {
        const lower = Math.ceil(min);
        const upper = Math.floor(max);
        return Math.floor(Math.random() * (upper - lower + 1)) + lower;
    }

    public getPortfolioHoldings(): Promise<PortfolioHolding[]> {
        //return this.get<PortfolioHolding[]>(`/portfolio/holdings`);
        return Promise.resolve([
            { assetId: "3abacf7a-4d9d-422c-babe-d53e521378e4", amount: 234, boughtPrice: this.getRandomInt(4, 8) },
            { assetId: "96dd1bde-2ce8-49eb-8399-093af843b84a", amount: 23, boughtPrice: this.getRandomInt(4, 8) },
            { assetId: "8f7549de-b142-4160-aa6b-cbbdc82a2546", amount: 65, boughtPrice: this.getRandomInt(4, 8) },
            { assetId: "c0444ffc-73cb-4226-bf89-add6ab8f17b0", amount: 545, boughtPrice: this.getRandomInt(4, 8) },
        ]);
    }

    public createHolding(holding: PortfolioHolding): Promise<void> {
        //return this.post<void>(`/portfolio/holdings`, [holding]);
        console.log(holding);
        return Promise.resolve();
    }

    public updateHolding(holding: PortfolioHolding): Promise<void> {
        //return this.put<void>(`/portfolio/holdings`, [holding]);
        console.log(holding);
        return Promise.resolve();
    }

    public deleteHolding(assetId: string): Promise<void> {
        //return this.delete<void>(`/portfolio/holdings?assetId=${assetId}`);
        console.log(assetId);
        return Promise.resolve();
    }
}