export type AlertType = "BUY" | "SELL" | "HOLD";

export interface Alert {
    type: AlertType;
    assetId: string;
    date: Date;
}