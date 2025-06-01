import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { TrendingUp, DollarSign, BarChart3 } from "lucide-react";

const DashboardPreview = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Live Dashboard Preview</h2>

            <div className="grid grid-cols-2 gap-4">
                {/* Portfolio Value */}
                <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Portfolio Value
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">$127,450</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +5.2% today
                        </p>
                    </CardContent>
                </Card>

                {/* Daily Change */}
                <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Daily Change
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">+$6,623</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Strong performance
                        </p>
                    </CardContent>
                </Card>

                {/* Top Stock */}
                <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Top Performer</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold text-gray-900">AAPL</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +12.4%
                        </p>
                    </CardContent>
                </Card>

                {/* Alerts */}
                <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Active Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold text-gray-900">3</div>
                        <p className="text-xs text-gray-500 mt-1">Price targets hit</p>
                    </CardContent>
                </Card>
            </div>

            {/* Mini Chart Simulation */}
            <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Portfolio Trend</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end space-x-1 h-16">
                        {[40, 45, 35, 60, 55, 70, 65, 80, 75, 85, 90, 95].map((height, i) => (
                            <div
                                key={i}
                                className="bg-gray-700 rounded-sm flex-1 animate-pulse"
                                style={{ height: `${height}%` }}
                            />
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Last 30 days performance</p>
                </CardContent>
            </Card>
        </div>
    );
};

export default DashboardPreview;