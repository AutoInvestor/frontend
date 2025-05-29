export interface Alert {
    type: AlertType;
    assetId: string;
    date: Date;
}

type AlertType =
    | "BUY"
    | "SELL"
    | "HOLD"