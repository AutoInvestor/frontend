// src/components/SimulationResults.tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { ArrowLeft } from "lucide-react";

/**
 * Props:
 *  - onBack: () => void
 */
interface SimulationResultsProps {
  onBack: () => void;
}

export function SimulationResults({ onBack }: SimulationResultsProps) {
  /* POC data – replace with real API data later */
  const data = [
    { date: "May 14", autoinvested: 3500, noAutoinvested: 3500 },
    { date: "May 16", autoinvested: 3650, noAutoinvested: 3450 },
    { date: "May 18", autoinvested: 3800, noAutoinvested: 3400 },
    { date: "May 20", autoinvested: 3750, noAutoinvested: 3600 },
    { date: "May 22", autoinvested: 3918.11, noAutoinvested: 3918.11 },
    { date: "May 24", autoinvested: 4100, noAutoinvested: 3800 },
    { date: "May 26", autoinvested: 4200, noAutoinvested: 3750 },
    { date: "May 28", autoinvested: 4300, noAutoinvested: 3700 },
    { date: "May 30", autoinvested: 4400, noAutoinvested: 3650 },
  ];

  return (
      <div className="space-y-6">
        {/* ───── Header ───── */}
        <div className="flex items-center gap-4">
          <Button
              variant="ghost"
              onClick={onBack}
              className="text-foreground hover:bg-muted"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h2 className="text-2xl font-bold text-foreground">
            Simulation result
          </h2>
        </div>

        {/* ───── Result card ───── */}
        <Card className="bg-card border border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg text-foreground">
                Simulation result
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Showing how the portfolio could have behaved if operations were
                instructed by AutoInvestor
              </p>
            </div>

            <Select defaultValue="overview">
              <SelectTrigger className="w-32 bg-muted border border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-muted border border-border">
                <SelectItem value="overview" className="text-foreground">
                  Overview
                </SelectItem>
                <SelectItem value="detailed" className="text-foreground">
                  Detailed
                </SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>

          <CardContent>
            {/* ───── Chart ───── */}
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                  />
                  <XAxis
                      dataKey="date"
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                  />
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
                      formatter={(val: number, name: string) => [
                        `$${val.toLocaleString()}`,
                        name === "autoinvested"
                            ? "Autoinvested"
                            : "No Autoinvested",
                      ]}
                  />
                  <Legend
                      wrapperStyle={{ color: "var(--foreground)" }}
                  />
                  <Line
                      name="Autoinvested"
                      type="monotone"
                      dataKey="autoinvested"
                      stroke="var(--chart-1)"
                      strokeWidth={3}
                      dot={{ fill: "var(--chart-1)", strokeWidth: 2 }}
                  />
                  <Line
                      name="No Autoinvested"
                      type="monotone"
                      dataKey="noAutoinvested"
                      stroke="var(--chart-2)"
                      strokeWidth={3}
                      dot={{ fill: "var(--chart-2)", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* ───── Summary cards ───── */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium text-primary">Autoinvested</h4>
                <p className="text-2xl font-bold text-foreground">$4 400.00</p>
                <p className="text-sm text-green-400">+25.7 % gain</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium text-primary/80">
                  No Autoinvested
                </h4>
                <p className="text-2xl font-bold text-foreground">$3 650.00</p>
                <p className="text-sm text-red-400">+4.3 % gain</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
