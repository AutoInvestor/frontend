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

/**
 * Local row shape for rendering
 */
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

function toUSD(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

/**
 * Props
 */
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
  const [userRisk, setUserRisk] = useState<number>(1);

  /* 1️⃣  Fetch user risk level once */
  useEffect(() => {
    usersService.getUser().then((u) => setUserRisk(u.riskLevel));
  }, []);

  /* 2️⃣  Re-build table data whenever inputs change */
  useEffect(() => {
    async function buildAssetHoldings() {
      const arr: AssetHolding[] = await Promise.all(
          holdings
              // ⬇️ Skip rows whose asset metadata we don't have yet
              .filter((h) => assetsMap[h.assetId])
              .map(async (h): Promise<AssetHolding> => {
                const asset = assetsMap[h.assetId]!; // non-null (filtered above)

                // current price
                const { price: currentPriceCents } = await assetsService.getPrice(
                    h.assetId,
                    new Date()
                );

                // decision history
                const decisions = await decisionService.getDecisions(
                    h.assetId,
                    userRisk
                );
                const lastDecision = decisions
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .pop();

                return {
                  assetId: h.assetId,
                  mic: asset.mic,
                  ticker: asset.ticker,
                  shares: h.amount,
                  valuePerShareCents: currentPriceCents,
                  buyPriceCents: h.boughtPrice,
                  lastDecision: lastDecision ? lastDecision.type : "HOLD",
                  lastDecisionDate: lastDecision ? lastDecision.date : new Date(),
                };
              })
      );

      setAssetHoldings(arr);
    }

    if (holdings.length && Object.keys(assetsMap).length && userRisk) {
      buildAssetHoldings().catch(console.error);
    } else {
      setAssetHoldings([]);
    }
  }, [holdings, assetsMap, userRisk]);

  /* 3️⃣  Total portfolio value */
  const totalValue = assetHoldings
      .reduce((sum, h) => sum + (h.valuePerShareCents * h.shares) / 100, 0);

  /* 4️⃣  Render table */
  return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-3 px-2 text-gray-400 font-medium">Ticker</th>
            <th className="text-left py-3 px-2 text-gray-400 font-medium">Shares</th>
            <th className="text-left py-3 px-2 text-gray-400 font-medium">Value / Share</th>
            <th className="text-left py-3 px-2 text-gray-400 font-medium">Total value</th>
            <th className="text-left py-3 px-2 text-gray-400 font-medium">Last decision</th>
            <th className="text-left py-3 px-2 text-gray-400 font-medium">Change (%)</th>
            <th className="text-left py-3 px-2 text-gray-400 font-medium"></th>
          </tr>
          </thead>

          <tbody>
          {assetHoldings.map((h) => {
            const changePercent =
                h.buyPriceCents > 0
                    ? ((h.valuePerShareCents - h.buyPriceCents) / h.buyPriceCents) * 100
                    : 0;
            const isNegative = changePercent < 0;

            return (
                <tr
                    key={h.assetId}
                    className="border-b border-gray-800 hover:bg-gray-800/50"
                >
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{h.mic}</span>
                      <span className="font-medium text-white">{h.ticker}</span>
                    </div>
                  </td>

                  <td className="py-4 px-2 text-white">{h.shares}</td>

                  <td className="py-4 px-2 text-white">
                    {toUSD(h.valuePerShareCents)}
                  </td>

                  <td className="py-4 px-2 text-white">
                    {toUSD(h.valuePerShareCents * h.shares)}
                  </td>

                  <td className="py-4 px-2">
                    <Badge variant="secondary" className="bg-gray-700 text-white text-xs">
                      {h.lastDecision}
                    </Badge>
                  </td>

                  <td className="py-4 px-2">
                  <span className={isNegative ? "text-red-500" : "text-green-500"}>
                    {isNegative ? "" : "+"}
                    {changePercent.toFixed(2)}%
                  </span>
                  </td>

                  <td className="py-4 px-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white"
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
                        className="text-red-500 hover:text-red-300 ml-2"
                        onClick={() => onDelete(h.assetId)}
                    >
                      🗑
                    </Button>
                  </td>
                </tr>
            );
          })}

          {/* footer */}
          <tr className="border-t-2 border-gray-600 font-bold">
            <td className="py-4 px-2 text-white">Total</td>
            <td className="py-4 px-2"></td>
            <td className="py-4 px-2"></td>
            <td className="py-4 px-2 text-white">${totalValue.toFixed(2)}</td>
            <td className="py-4 px-2"></td>
            <td className="py-4 px-2"></td>
            <td className="py-4 px-2"></td>
          </tr>
          </tbody>
        </table>
      </div>
  );
}
