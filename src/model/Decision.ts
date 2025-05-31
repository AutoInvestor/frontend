import { AlertType } from "./Alert";

export interface Decision {
    type: AlertType;
    assetId: string;
    riskLevel: number;
    date: Date;
}