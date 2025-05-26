import {BaseHttpService} from "@/services/base-http-service.ts";
import {Decision} from "@/model/Decision.ts";

export class DecisionHttpService extends BaseHttpService {
    public constructor() {
        super();
    }

    public getDecisions(assetId: string, riskLevel: number): Promise<Decision[]> {
        return this.get<Decision[]>(`/decisions?assetId=${assetId}&riskLevel=${riskLevel}`);
    }
}