import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
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
      // 1) Gather all “decision dates” and a mocked “buy date” → build date range
      const allDecisionDates: Date[] = [];
      Object.values(decisionsMap).forEach((arr) =>
          arr.forEach((d) => allDecisionDates.push(d.date))
      );

      // Mocked “buy date” for each holding (today − 7 days)
      const buyDates: Date[] = holdings.map(
          () => new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)
      );

      const allTimes = [...allDecisionDates, ...buyDates];
      if (allTimes.length === 0) {
        setChartData([]);
        return;
      }

      // Determine minDate and maxDate
      const minDate = allTimes.reduce((a, b) => (a < b ? a : b));
      const maxDate = new Date(); // today

      // Build array of all ISO dates from minDate to maxDate (inclusive)
      const allDates: string[] = [];
      const dataByDate: Record<string, { autoinvested: number; noAutoinvested: number }> = {};
      for (
          let d = new Date(minDate);
          d <= maxDate;
          d.setDate(d.getDate() + 1)
      ) {
        const iso = d.toISOString().split("T")[0];
        allDates.push(iso);
        dataByDate[iso] = { autoinvested: 0, noAutoinvested: 0 };
      }

      // For each holding, simulate daily portfolio value
      for (const h of holdings) {
        const asset = assetsMap[h.assetId];
        if (!asset) continue;

        // initial “cash” = shares * boughtPrice (in cents)
        let cashForAuto: number = h.amount * h.boughtPrice;
        let sharesHeld: number = h.amount;
        const initialNoAuto: number = h.amount * h.boughtPrice;

        const decisions = decisionsMap[h.assetId] || [];

        for (const dateISO of allDates) {
          // Filter decisions that happened on this day
          const dayDecisions = decisions
              .filter((d) => d.date.toISOString().split("T")[0] === dateISO)
              .sort((a, b) => a.date.getTime() - b.date.getTime());

          // Apply each decision in chronological order
          for (const dec of dayDecisions) {
            const { price: priceAtDecisionCents } = await assetsService.getPrice(
                h.assetId,
                dec.date
            );
            if (dec.type === "BUY") {
              const boughtShares = Math.trunc(cashForAuto / priceAtDecisionCents);
              cashForAuto -= boughtShares * priceAtDecisionCents;
              sharesHeld += boughtShares;
            } else if (dec.type === "SELL") {
              cashForAuto += sharesHeld * priceAtDecisionCents;
              sharesHeld = 0;
            }
          }

          // At end of day, fetch price
          const { price: eodPriceCents } = await assetsService.getPrice(
              h.assetId,
              new Date(dateISO + "T23:59:59")
          );

          // autoinvested = cashForAuto + sharesHeld * eodPriceCents
          const autoValueCents = cashForAuto + sharesHeld * eodPriceCents;
          // noAutoinvested = initialNoAuto + sharesHeld * eodPriceCents
          const noAutoValueCents = initialNoAuto + sharesHeld * eodPriceCents;

          dataByDate[dateISO].autoinvested += autoValueCents;
          dataByDate[dateISO].noAutoinvested += noAutoValueCents;
        }
      }

      // Convert to BaseChartData[] and convert cents → dollars
      const result: BaseChartData[] = allDates.map((iso) => ({
        date: format(new Date(iso), "MM/dd"),
        autoinvested: dataByDate[iso].autoinvested / 100,
        noAutoinvested: dataByDate[iso].noAutoinvested / 100,
      }));
      setChartData(result);
    }

    // Only build the chart if we have holdings, asset metadata, and decision histories
    if (
        holdings.length > 0 &&
        Object.keys(assetsMap).length > 0 &&
        Object.keys(decisionsMap).length > 0
    ) {
      buildChart().catch(console.error);
    } else {
      setChartData([]);
    }
  }, [holdings, assetsMap, decisionsMap]);

  if (chartData.length === 0) {
    return <div className="text-gray-400">Loading chart…</div>;
  }

  return (
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
            <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(val) => `$${val.toLocaleString()}`}
            />
            <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F9FAFB",
                }}
                formatter={(value: number, name: string) => [
                  `$${value.toLocaleString()}`,
                  name === "autoinvested"
                      ? "Autoinvested"
                      : "No Autoinvested",
                ]}
            />
            <Legend wrapperStyle={{ color: "#F9FAFB" }} />
            <Line
                type="monotone"
                dataKey="autoinvested"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: "#3B82F6", r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2 }}
                name="Autoinvested"
            />
            <Line
                type="monotone"
                dataKey="noAutoinvested"
                stroke="#93C5FD"
                strokeWidth={2}
                dot={{ fill: "#93C5FD", r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, stroke: "#93C5FD", strokeWidth: 2 }}
                name="No Autoinvested"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
  );
}
