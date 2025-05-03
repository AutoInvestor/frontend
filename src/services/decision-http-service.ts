import {BaseHttpService} from "@/services/base-http-service.ts";
import {Decision} from "@/model/Decision.ts";

export class DecisionHttpService extends BaseHttpService {
    public constructor() {
        super();
    }

    private getRandomInt(min: number, max: number): number {
        const lower = Math.ceil(min);
        const upper = Math.floor(max);
        return Math.floor(Math.random() * (upper - lower + 1)) + lower;
    }

    public getDecisions(assetId: string, riskLevel: number): Promise<Decision[]> {
        //return this.get<Decision[]>(`/decisions?assetId=${assetId}&riskLevel=${riskLevel}`);
        return Promise.resolve(Array.from({ length: this.getRandomInt(1, 10) }).map(() => {
            return { assetId: assetId, type: this.getRandomInt(0 , 1) > 0 ? "BUY" : "SELL", date: new Date(`2025-04-${this.getRandomInt(1, 30).toString().padStart(2, '0')}T13:13:00.000Z`), riskLevel: riskLevel }
        }));
    }
}