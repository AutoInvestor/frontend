import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,} from "recharts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {ArrowLeft} from "lucide-react";

/**
 * Props:
 *  - onBack: () => void
 */
interface SimulationResultsProps {
  onBack: () => void;
}

export function SimulationResults({ onBack }: SimulationResultsProps) {
  // For now, we use hard‐coded data (just as a POC).
  // Eventually you’ll replace this with the real “simulation” API call.
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
        <div className="flex items-center gap-4">
          <Button
              variant="ghost"
              onClick={onBack}
              className="text-white hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h2 className="text-2xl font-bold text-white">Simulation result</h2>
        </div>

        <Card className="bg-black border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white text-lg">Simulation result</CardTitle>
              <p className="text-gray-400 text-sm">
                Showing how portfolio could have behaved if stock operations were
                instructed by AutoInvestor
              </p>
            </div>
            <Select defaultValue="overview">
              <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="overview" className="text-white">
                  Overview
                </SelectItem>
                <SelectItem value="detailed" className="text-white">
                  Detailed
                </SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                  <YAxis
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
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
                        name === "autoinvested" ? "Autoinvested" : "No Autoinvested",
                      ]}
                  />
                  <Legend wrapperStyle={{ color: "#F9FAFB" }} />
                  <Line
                      type="monotone"
                      dataKey="autoinvested"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      name="Autoinvested"
                      dot={{ fill: "#3B82F6", strokeWidth: 2 }}
                  />
                  <Line
                      type="monotone"
                      dataKey="noAutoinvested"
                      stroke="#93C5FD"
                      strokeWidth={3}
                      name="No Autoinvested"
                      dot={{ fill: "#93C5FD", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-blue-400 font-medium">Autoinvested</h4>
                <p className="text-white text-2xl font-bold">$4,400.00</p>
                <p className="text-green-400 text-sm">+25.7% gain</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-blue-300 font-medium">No Autoinvested</h4>
                <p className="text-white text-2xl font-bold">$3,650.00</p>
                <p className="text-red-400 text-sm">+4.3% gain</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
