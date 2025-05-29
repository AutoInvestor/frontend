import {BaseHttpService} from "@/services/base-http-service.ts";
import {PortfolioHolding} from "@/model/PortfolioHolding.ts";
import z, {ZodType} from "zod/v4";

export class PortfolioHttpService extends BaseHttpService {
    private static Schema: ZodType<PortfolioHolding> = z.object({
        assetId: z.string(),
        amount: z.number(),
        boughtPrice: z.number(),
    })

    public constructor() {
        super();
    }

    public getPortfolioHoldings(): Promise<PortfolioHolding[]> {
        return this.get<PortfolioHolding[]>(`/portfolio/holdings`, z.array(PortfolioHttpService.Schema));
    }

    public createHolding(holding: PortfolioHolding): Promise<void> {
        return this.post<void>(`/portfolio/holdings`, [holding], z.void());
    }

    public updateHolding(holding: PortfolioHolding): Promise<void> {
        return this.put<void>(`/portfolio/holdings`, [holding], z.void());
    }

    public deleteHolding(assetId: string): Promise<void> {
        return this.delete<void>(`/portfolio/holdings?assetId=${assetId}`, z.void());
    }
}