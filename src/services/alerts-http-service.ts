import {BaseHttpService} from "@/services/base-http-service.ts";
import {Alert} from "@/model/Alert.ts";
import z, {ZodType} from "zod/v4";

export class AlertsHttpService extends BaseHttpService {
    private static Schema: ZodType<Alert> = z.object({
        type: z.enum(["BUY", "SELL", "HOLD"]),
        assetId: z.string(),
        date: z.coerce.date(),
    })

    public constructor() {
        super();
    }

    public getAlerts(): Promise<Alert[]> {
        return this.get<Alert[]>('/alerts', z.array(AlertsHttpService.Schema));
    }
}