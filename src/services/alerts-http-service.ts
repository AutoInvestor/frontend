import {BaseHttpService} from "@/services/base-http-service.ts";
import {Alert} from "@/model/Alert.ts";

export class AlertsHttpService extends BaseHttpService {
    public constructor() {
        super();
    }

    public getAlerts(): Promise<Alert[]> {
        return this.get<Alert[]>('/alerts');
    }
}