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
        return this.get<PortfolioHolding[]>(`/portfolio/holdings`);
    }

    public createHolding(holding: PortfolioHolding): Promise<void> {
        return this.post<void>(`/portfolio/holdings`, [holding]);
    }

    public updateHolding(holding: PortfolioHolding): Promise<void> {
        return this.put<void>(`/portfolio/holdings`, [holding]);
    }

    public deleteHolding(assetId: string): Promise<void> {
        return this.delete<void>(`/portfolio/holdings?assetId=${assetId}`);
    }
}