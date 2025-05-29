import {BaseHttpService} from "@/services/base-http-service.ts";
import {Decision} from "@/model/Decision.ts";
import z, {ZodType} from "zod/v4";

export class DecisionHttpService extends BaseHttpService {
    private static Schema: ZodType<Decision> = z.object({
        type: z.union([z.literal("BUY"), z.literal("SELL")]),
        assetId: z.string(),
        riskLevel: z.number(),
        date: z.coerce.date(),
    })

    public constructor() {
        super();
    }

    public getDecisions(assetId: string, riskLevel: number): Promise<Decision[]> {
        return this.get<Decision[]>(`/decisions?assetId=${assetId}&riskLevel=${riskLevel}`, z.array(DecisionHttpService.Schema));
    }
}