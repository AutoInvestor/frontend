import {BaseHttpService} from "@/services/base-http-service.ts";
import {Alert} from "@/model/Alert.ts";

export class AlertsHttpService extends BaseHttpService {
    public constructor() {
        super();
    }

    public getAlerts(): Promise<Alert[]> {
        //return this.get<Alert[]>('/alerts');
        return Promise.resolve([
            { assetId: "3abacf7a-4d9d-422c-babe-d53e521378e4", type: "BUY", date: new Date("2025-01-01T00:00:00.000Z") },
            { assetId: "96dd1bde-2ce8-49eb-8399-093af843b84a", type: "SELL", date: new Date("2025-03-01T00:00:00.000Z") },
            { assetId: "8f7549de-b142-4160-aa6b-cbbdc82a2546", type: "SELL", date: new Date("2025-03-01T00:00:00.000Z") },
            { assetId: "c0444ffc-73cb-4226-bf89-add6ab8f17b0", type: "BUY", date: new Date("2025-04-24T00:00:00.000Z") },
        ]);
    }
}