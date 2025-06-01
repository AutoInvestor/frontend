import {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Calendar as CalendarIcon} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover";
import {Calendar} from "@/components/ui/calendar";
import {cn} from "@/lib/utils";
import {Badge} from "@/components/ui/badge";

import {PortfolioHolding} from "@/model/PortfolioHolding";
import {DateRange} from "react-day-picker";
import {format} from "date-fns";

import {SimulationResults} from "@/components/SimulationResults";

interface SimulationPanelProps {
  holdings: PortfolioHolding[];
  riskLevel: number;
}

export function SimulationPanel({ holdings, riskLevel }: SimulationPanelProps) {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const [showResults, setShowResults] = useState(false);

  const riskLevels = [
    { level: 1, label: "Conservative", description: "Low risk, steady returns" },
    { level: 2, label: "Moderate", description: "Balanced risk & reward" },
    { level: 3, label: "Aggressive", description: "Higher risk, higher potential returns" },
    { level: 4, label: "Very Aggressive", description: "Maximum risk & returns" },
  ];

  // We’ll let the parent (Dashboard) conditionally render whether the SimulationPanel is in “results” or “select” mode.
  if (showResults) {
    return <SimulationResults onBack={() => setShowResults(false)} />;
  }

  return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Time Period Selection */}
          <Card className="bg-black border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Time period</CardTitle>
            </CardHeader>
            <CardContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                      variant="outline"
                      className={cn(
                          "w-full justify-start text-left font-normal bg-gray-800 border-gray-600 text-white",
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
                    className="w-auto p-0 bg-gray-800 border-gray-600"
                    align="start"
                >
                  <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={(range?: DateRange) => {
                        if (range?.from && range?.to) {
                          setDateRange(range);
                        }
                      }}
                      numberOfMonths={2}
                      className="bg-gray-800 text-white pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          {/* Risk Profile */}
          <Card className="bg-black border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Risk profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {riskLevels.map((risk) => (
                    <Button
                        key={risk.level}
                        variant={riskLevel === risk.level ? "default" : "outline"}
                        className={cn(
                            "h-12 text-lg font-bold",
                            riskLevel === risk.level
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : "bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                        )}
                        onClick={() => {
                          // if you want to allow changing risk on the fly:
                          // setRiskProfile(risk.level);
                        }}
                    >
                      {risk.level}
                    </Button>
                ))}
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-gray-800 text-white">
                  {riskLevels[riskLevel - 1].label}
                </Badge>
                <p className="text-sm text-gray-400 mt-1">
                  {riskLevels[riskLevel - 1].description}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assets Selection (for now, we just show “Current portfolio” as a badge) */}
        <Card className="bg-black border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Assets selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                  💼
                </div>
                <div>
                  <h3 className="text-white font-medium">Current portfolio</h3>
                  <p className="text-gray-400 text-sm">
                    {holdings.length} assets selected
                  </p>
                </div>
              </div>
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Run Simulation Button */}
        <div className="flex justify-center">
          <Button
              className="bg-white hover:bg-gray-200 text-black px-8 py-2 font-medium"
              onClick={() => setShowResults(true)}
          >
            Run simulation
          </Button>
        </div>
      </div>
  );
}
