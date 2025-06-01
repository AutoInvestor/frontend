// src/components/AssetTable.tsx
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

import { PortfolioHolding } from "@/model/PortfolioHolding";
import { Asset } from "@/model/Asset";
import { AssetsHttpService } from "@/services/assets-http-service";
import { DecisionHttpService } from "@/services/decision-http-service";
import { UsersHttpService } from "@/services/users-http-service";

const assetsService = new AssetsHttpService();
const decisionService = new DecisionHttpService();
const usersService = new UsersHttpService();

/* ──────────────────────────────────────────────────────────────────────────── *
 * Helper types & fns                                                          *
 * ──────────────────────────────────────────────────────────────────────────── */
interface AssetHolding {
    assetId: string;
    mic: string;
    ticker: string;
    shares: number;
    valuePerShareCents: number;
    buyPriceCents: number;
    lastDecision: "BUY" | "SELL" | "HOLD";
    lastDecisionDate: Date;
}

const toUSD = (cents: number) =>
    (cents / 100).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
    });

interface AssetTableProps {
    holdings: PortfolioHolding[];
    assetsMap: Record<string, Asset>;
    onUpdate: (updated: PortfolioHolding) => Promise<void>;
    onDelete: (assetId: string) => Promise<void>;
}

export function AssetTable({
                               holdings,
                               assetsMap,
                               onUpdate,
                               onDelete,
                           }: AssetTableProps) {
    const [assetHoldings, setAssetHoldings] = useState<AssetHolding[]>([]);
    const [userRisk, setUserRisk] = useState(1);

    /* 1️⃣ user risk */
    useEffect(() => {
        usersService.getUser().then((u) => setUserRisk(u.riskLevel));
    }, []);

    /* 2️⃣ build rows */
    useEffect(() => {
        async function build() {
            const rows = await Promise.all(
                holdings
                    .filter((h) => assetsMap[h.assetId])
                    .map(async (h) => {
                        const asset = assetsMap[h.assetId]!;
                        const { price } = await assetsService.getPrice(h.assetId, new Date());
                        const decisions = await decisionService.getDecisions(
                            h.assetId,
                            userRisk
                        );
                        const last = decisions
                            .sort((a, b) => a.date.getTime() - b.date.getTime())
                            .pop();

                        return {
                            assetId: h.assetId,
                            mic: asset.mic,
                            ticker: asset.ticker,
                            shares: h.amount,
                            valuePerShareCents: price,
                            buyPriceCents: h.boughtPrice,
                            lastDecision: last ? last.type : "HOLD",
                            lastDecisionDate: last ? last.date : new Date(),
                        } satisfies AssetHolding;
                    })
            );
            setAssetHoldings(rows);
        }

        if (holdings.length && Object.keys(assetsMap).length && userRisk) {
            build().catch(console.error);
        } else {
            setAssetHoldings([]);
        }
    }, [holdings, assetsMap, userRisk]);

    const totalValue = assetHoldings.reduce(
        (sum, h) => sum + (h.valuePerShareCents * h.shares) / 100,
        0
    );

    /* 3️⃣ render */
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                <tr className="border-b border-border">
                    {[
                        "Ticker",
                        "Shares",
                        "Value / Share",
                        "Total value",
                        "Last decision",
                        "Change ( % )",
                        "",
                    ].map((h) => (
                        <th
                            key={h}
                            className="px-2 py-3 text-left font-medium text-muted-foreground"
                        >
                            {h}
                        </th>
                    ))}
                </tr>
                </thead>

                <tbody>
                {assetHoldings.map((h) => {
                    const change =
                        h.buyPriceCents > 0
                            ? ((h.valuePerShareCents - h.buyPriceCents) /
                                h.buyPriceCents) *
                            100
                            : 0;
                    const neg = change < 0;

                    return (
                        <tr
                            key={h.assetId}
                            className="border-b border-muted hover:bg-muted/50"
                        >
                            {/* ticker */}
                            <td className="px-2 py-4">
                                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {h.mic}
                    </span>
                                    <span className="font-medium text-foreground">
                      {h.ticker}
                    </span>
                                </div>
                            </td>

                            {/* shares */}
                            <td className="px-2 py-4 text-foreground">{h.shares}</td>

                            {/* value/share */}
                            <td className="px-2 py-4 text-foreground">
                                {toUSD(h.valuePerShareCents)}
                            </td>

                            {/* total */}
                            <td className="px-2 py-4 text-foreground">
                                {toUSD(h.valuePerShareCents * h.shares)}
                            </td>

                            {/* last decision */}
                            <td className="px-2 py-4">
                                <Badge
                                    variant="secondary"
                                    className="bg-muted text-foreground text-xs"
                                >
                                    {h.lastDecision}
                                </Badge>
                            </td>

                            {/* change */}
                            <td className="px-2 py-4">
                  <span className={neg ? "text-red-500" : "text-green-500"}>
                    {neg ? "" : "+"}
                      {change.toFixed(2)} %
                  </span>
                            </td>

                            {/* actions */}
                            <td className="px-2 py-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-foreground"
                                    onClick={() =>
                                        onUpdate({
                                            assetId: h.assetId,
                                            amount: h.shares,
                                            boughtPrice: h.buyPriceCents,
                                        })
                                    }
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="ml-2 text-red-500 hover:text-red-300"
                                    onClick={() => onDelete(h.assetId)}
                                >
                                    🗑
                                </Button>
                            </td>
                        </tr>
                    );
                })}

                {/* footer */}
                <tr className="border-t-2 border-border font-bold">
                    <td className="px-2 py-4 text-foreground">Total</td>
                    <td className="px-2 py-4"></td>
                    <td className="px-2 py-4"></td>
                    <td className="px-2 py-4 text-foreground">
                        ${totalValue.toFixed(2)}
                    </td>
                    <td className="px-2 py-4"></td>
                    <td className="px-2 py-4"></td>
                    <td className="px-2 py-4"></td>
                </tr>
                </tbody>
            </table>
        </div>
    );
}
