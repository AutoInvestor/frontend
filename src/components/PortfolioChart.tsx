// src/components/PortfolioChart.tsx
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PortfolioHolding } from "@/model/PortfolioHolding";
import { Asset } from "@/model/Asset";
import { Decision } from "@/model/Decision";
import { AssetsHttpService } from "@/services/assets-http-service";
import { format } from "date-fns";

const assetsService = new AssetsHttpService();

interface BaseChartData {
  date: string;
  autoinvested: number;
  noAutoinvested: number;
}

interface PortfolioChartProps {
  holdings: PortfolioHolding[];
  assetsMap: Record<string, Asset>;
  decisionsMap: Record<string, Decision[]>;
}

export function PortfolioChart({
                                 holdings,
                                 assetsMap,
                                 decisionsMap,
                               }: PortfolioChartProps) {
  const [chartData, setChartData] = useState<BaseChartData[]>([]);

  useEffect(() => {
    async function buildChart() {
      // ───── Build full date range ─────
      const allDecisionDates: Date[] = [];
      Object.values(decisionsMap).forEach((arr) =>
          arr.forEach((d) => allDecisionDates.push(d.date))
      );
      const buyDates = holdings.map(
          () => new Date(Date.now() - 7 * 86_400_000) // today − 7d
      );
      const allTimes = [...allDecisionDates, ...buyDates];
      if (!allTimes.length) return setChartData([]);

      const minDate = allTimes.reduce((a, b) => (a < b ? a : b));
      const maxDate = new Date(); // today

      const allDates: string[] = [];
      const dataByDate: Record<
          string,
          { autoinvested: number; noAutoinvested: number }
      > = {};
      for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
        const iso = d.toISOString().split("T")[0];
        allDates.push(iso);
        dataByDate[iso] = { autoinvested: 0, noAutoinvested: 0 };
      }

      // ───── Simulate each holding ─────
      for (const h of holdings) {
        const asset = assetsMap[h.assetId];
        if (!asset) continue;

        let cashForAuto = h.amount * h.boughtPrice;
        let sharesHeld = h.amount;
        const initialNoAuto = h.amount * h.boughtPrice;
        const decisions = decisionsMap[h.assetId] || [];

        for (const dateISO of allDates) {
          const dayDecisions = decisions
              .filter((d) => d.date.toISOString().startsWith(dateISO))
              .sort((a, b) => a.date.getTime() - b.date.getTime());

          for (const dec of dayDecisions) {
            const { price: px } = await assetsService.getPrice(
                h.assetId,
                dec.date
            );
            if (dec.type === "BUY") {
              const bought = Math.trunc(cashForAuto / px);
              cashForAuto -= bought * px;
              sharesHeld += bought;
            } else if (dec.type === "SELL") {
              cashForAuto += sharesHeld * px;
              sharesHeld = 0;
            }
          }

          const { price: eodPx } = await assetsService.getPrice(
              h.assetId,
              new Date(`${dateISO}T23:59:59Z`)
          );
          dataByDate[dateISO].autoinvested += cashForAuto + sharesHeld * eodPx;
          dataByDate[dateISO].noAutoinvested += initialNoAuto + sharesHeld * eodPx;
        }
      }

      const out = allDates.map((iso) => ({
        date: format(new Date(iso), "MM/dd"),
        autoinvested: dataByDate[iso].autoinvested / 100,
        noAutoinvested: dataByDate[iso].noAutoinvested / 100,
      }));
      setChartData(out);
    }

    if (
        holdings.length &&
        Object.keys(assetsMap).length &&
        Object.keys(decisionsMap).length
    ) {
      buildChart().catch(console.error);
    } else {
      setChartData([]);
    }
  }, [holdings, assetsMap, decisionsMap]);

  if (!chartData.length) {
    return <div className="text-muted-foreground">Loading chart…</div>;
  }

  return (
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickFormatter={(v) => `$${v.toLocaleString()}`}
            />
            <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--popover-foreground)",
                }}
                formatter={(v: number, n: string) => [
                  `$${v.toLocaleString()}`,
                  n === "autoinvested" ? "Autoinvested" : "No Autoinvested",
                ]}
            />
            <Legend wrapperStyle={{ color: "var(--foreground)" }} />
            <Line
                type="monotone"
                dataKey="autoinvested"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={{ fill: "var(--chart-1)", r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, stroke: "var(--chart-1)", strokeWidth: 2 }}
                name="Autoinvested"
            />
            <Line
                type="monotone"
                dataKey="noAutoinvested"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={{ fill: "var(--chart-2)", r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, stroke: "var(--chart-2)", strokeWidth: 2 }}
                name="No Autoinvested"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
  );
}
