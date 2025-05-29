export interface Decision {
    type: AlertType;
    assetId: string;
    riskLevel: number;
    date: Date;
}

type AlertType =
    | "BUY"
    | "SELL"
    | "HOLD"