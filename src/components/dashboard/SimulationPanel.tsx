// src/components/SimulationPanel.tsx
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import { Calendar } from "@/components/ui/calendar.tsx";
import { cn } from "@/lib/utils.ts";
import { Badge } from "@/components/ui/badge.tsx";

import { PortfolioHolding } from "@/model/PortfolioHolding.ts";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

import { SimulationResults } from "@/components/dashboard/SimulationResults.tsx";

interface SimulationPanelProps {
  holdings: PortfolioHolding[];
  riskLevel: number;
}

export function SimulationPanel({
                                  holdings,
                                  riskLevel,
                                }: SimulationPanelProps) {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 7 * 86_400_000),
    to: new Date(),
  });
  const [showResults, setShowResults] = useState(false);

  const riskLevels = [
    { level: 1, label: "Conservative", description: "Low-risk, steady returns" },
    { level: 2, label: "Moderate", description: "Balanced risk & reward" },
    { level: 3, label: "Aggressive", description: "Higher risk, higher returns" },
    { level: 4, label: "Very Aggressive", description: "Maximum risk & returns" },
  ];

  if (showResults) {
    return <SimulationResults onBack={() => setShowResults(false)} />;
  }

  return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* ───── Time period ───── */}
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Time period</CardTitle>
            </CardHeader>
            <CardContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                      variant="outline"
                      className={cn(
                          "w-full justify-start bg-muted text-left font-normal text-foreground",
                          !dateRange?.from && "text-muted-foreground"
                      )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                        dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} –{" "}
                              {format(dateRange.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(dateRange.from, "LLL dd, y")
                        )
                    ) : (
                        <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto p-0 bg-muted border border-border"
                    align="start"
                >
                  <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={(r?: DateRange) => r?.from && r.to && setDateRange(r)}
                      numberOfMonths={2}
                      className="pointer-events-auto bg-muted text-foreground"
                  />
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          {/* ───── Risk profile ───── */}
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Risk profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {riskLevels.map(({ level }) => (
                    <Button
                        key={level}
                        variant={riskLevel === level ? "default" : "outline"}
                        className={cn(
                            "h-12 text-lg font-bold",
                            riskLevel === level
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "bg-muted text-foreground hover:bg-muted/75"
                        )}
                    >
                      {level}
                    </Button>
                ))}
              </div>

              <div className="mt-4">
                <Badge variant="secondary" className="bg-muted text-foreground">
                  {riskLevels[riskLevel - 1].label}
                </Badge>
                <p className="mt-1 text-sm text-muted-foreground">
                  {riskLevels[riskLevel - 1].description}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ───── Assets selection ───── */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Assets selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-muted-foreground/30">
                  💼
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Current portfolio</h3>
                  <p className="text-sm text-muted-foreground">
                    {holdings.length} assets selected
                  </p>
                </div>
              </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                <div className="h-3 w-3 rounded-full bg-primary-foreground"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ───── Run button ───── */}
        <div className="flex justify-center">
          <Button
              onClick={() => setShowResults(true)}
              className="px-8 py-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Run simulation
          </Button>
        </div>
      </div>
  );
}
