import {WalletIcon} from "@heroicons/react/16/solid";
import {Switch} from "@/components/ui/switch.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useEffect, useState} from "react";
import {PortfolioHttpService} from "@/services/portfolio-http-service.ts";
import {AssetsHttpService} from "@/services/assets-http-service.ts";
import {Badge} from "@/components/ui/badge.tsx";

import {CartesianGrid, Line, LineChart, XAxis, YAxis} from "recharts"
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card"
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent,} from "@/components/ui/chart"
import {Decision} from "@/model/Decision.ts";
import {DecisionHttpService} from "@/services/decision-http-service.ts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {UsersHttpService} from "@/services/users-http-service.ts";
import {DatePickerRange} from "@/components/DatePickerRange.tsx";
import {DateRange} from "react-day-picker";
import {addDays, endOfDay, isWithinInterval, startOfDay} from "date-fns";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group.tsx";

const portfolioHttpService = new PortfolioHttpService();
const assetsHttpService = new AssetsHttpService();
const decisionHttpService = new DecisionHttpService();
const usersHttpService = new UsersHttpService();

interface SimulationConfig {
    fromDate: Date;
    toDate: Date;
    riskLevel: number;
    simulationItems: SimulationItem[];
}

interface SimulationItem {
    assetId: string;
    amount: number | undefined;
    locatedMoney: number | undefined;
}

interface AssetChartEntryCollection {
    mic: string;
    ticker: string;
    data: ChartEntryCollection;
}

class ChartEntryCollection extends Map<string, { autoinvested: number, noAutoinvested: number }> {
}

function Simulation() {
    const [simulationConfig, setSimulationConfig] = useState<SimulationConfig>();

    return (
        <div className={"flex flex-col lg:flex-row gap-5"}>
            <div className={"flex-1"}>
                <SimulationConfig setSimulationConfig={setSimulationConfig}/>
            </div>
            <div className={"flex-1"}>
                <SimulationResults simulationConfig={simulationConfig}/>
            </div>
        </div>
    )
}

function SimulationConfig({setSimulationConfig}: {
    setSimulationConfig: (simulationItems: SimulationConfig) => void
}) {
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [simulationItems, setSimulationItems] = useState<SimulationItem[]>([]);
    const [riskLevel, setRiskLevel] = useState(1);

    const addPortfolioHoldings = () => {
        portfolioHttpService.getPortfolioHoldings()
            .then(holdings => holdings.map(holding => ({
                assetId: holding.assetId,
                amount: holding.amount
            } as SimulationItem)))
            .then(setSimulationItems)

        usersHttpService.getUser().then(user => setRiskLevel(user.riskLevel));
    }

    const removePortfolioHoldings = () => {
        setSimulationItems([])
    }

    return (
        <div className={"flex flex-col gap-5"}>
            <Card className={"shadow-none"}>
                <CardHeader>
                    <CardTitle>Time period</CardTitle>
                    <CardDescription>Select the start and end dates for the simulation</CardDescription>
                </CardHeader>
                <CardContent>
                    <DatePickerRange value={dateRange} onValueChange={setDateRange}/>
                </CardContent>
            </Card>
            <Card className={"shadow-none"}>
                <CardHeader>
                    <CardTitle>Assets selection</CardTitle>
                    <CardDescription>Select the assets to be included in the simulation</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className={"flex gap-y-4 flex-col"}>
                        <div className={"flex flex-row gap-4 items-center"}>
                            <div className={"rounded-xl bg-neutral-100 w-fit box-border p-3"}>
                                <WalletIcon className={"size-6"}/>
                            </div>
                            <div className={"flex-1"}>
                                <p>Current portfolio</p>
                                <p className={"font-light text-neutral-500 pt-1"}>All assets in your current
                                    portfolio</p>
                            </div>
                            <div className={"text-neutral-500"}>
                                <Switch
                                    onCheckedChange={event => event ? addPortfolioHoldings() : removePortfolioHoldings()}/>
                            </div>
                        </div>
                    </div>
                    {simulationItems.length > 0 && (
                        <Badge variant="secondary" className={"mt-2"}>
                            {simulationItems.length} assets selected
                        </Badge>
                    )}
                </CardContent>
            </Card>
            <Card className={"shadow-none"}>
                <CardHeader>
                    <CardTitle>Risk profile</CardTitle>
                    <CardDescription>Select the risk profile to use in the simulation</CardDescription>
                </CardHeader>
                <CardContent>
                    <ToggleGroup
                        size="lg"
                        type="single"
                        variant="outline" value={riskLevel.toString()}
                        onValueChange={newValue => {
                            if (newValue) setRiskLevel(parseInt(newValue))
                        }}
                    >
                        {/* TODO: Fetch risk levels from back */}
                        {[1, 2, 3, 4].map((riskLevelItem, index) => (
                            <ToggleGroupItem
                                key={index}
                                value={riskLevelItem.toString()}
                                aria-label={`Toggle risk level ${riskLevelItem}`}
                            >
                                {riskLevelItem}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                    <Badge className={"mt-2"} variant="secondary">
                        {riskLevel === 1 && "Conservative"}
                        {riskLevel === 2 && "Moderate"}
                        {riskLevel === 3 && "Aggressive"}
                        {riskLevel === 4 && "Very aggressive"}
                    </Badge>
                </CardContent>
            </Card>
            <hr/>
            <Button className={"block mb-2 cursor-pointer"}
                    disabled={simulationItems.length === 0 || !dateRange}
                    onClick={() => {
                        if (!dateRange?.from || !dateRange?.to) return;
                        setSimulationConfig({
                            fromDate: dateRange.from,
                            toDate: dateRange.to,
                            riskLevel: riskLevel,
                            simulationItems: simulationItems
                        })
                    }}>
                Run simulation
            </Button>
        </div>
    )
}

async function createChartData(
    cash: number,
    shares: number,
    fromDate: Date,
    toDate: Date,
    decisions: Decision[],
    getPrice: (date: Date) => Promise<number>
): Promise<ChartEntryCollection> {
    let currentCash = cash;
    let currentShares = shares;

    const entryCollection = new ChartEntryCollection();

    const start = startOfDay(fromDate);
    const end = startOfDay(toDate);
    for (
        let current = new Date(start);
        current <= end;
        current = addDays(current, 1)
    ) {
        const decisionsAtDay = decisions
            .filter(decision => isWithinInterval(decision.date, {start: current, end: addDays(current, 1)}))
            .sort((a, b) => a.date.getTime() - b.date.getTime());

        for (const decision of decisionsAtDay) {
            const priceAtDecision = await getPrice(decision.date);
            if (decision.type === "BUY") {
                const boughtShares = Math.trunc(currentCash / priceAtDecision);
                currentCash -= priceAtDecision * boughtShares;
                currentShares += boughtShares;
            } else if (decision.type === "SELL") {
                currentCash += priceAtDecision * currentShares;
                currentShares = 0;
            }
        }

        const priceAtEOD = await getPrice(endOfDay(current));
        const dateKey = current.toISOString().split('T')[0];
        entryCollection.set(dateKey, {
            autoinvested: currentCash + currentShares * priceAtEOD,
            noAutoinvested: cash + shares * priceAtEOD
        });
    }

    return entryCollection;
}

interface MoneyChartData extends BaseChartData {
    select: string;
}

function SimulationResults({simulationConfig}: {
    simulationConfig: SimulationConfig | undefined;
}) {
    const [chartData, setChartData] = useState<MoneyChartData[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const normalise = (assets: AssetChartEntryCollection[]) => {
        return assets.map((asset: AssetChartEntryCollection) => {
            return Array.from(asset.data.entries()).map(([key, value]) => {
                return {
                    date: key,
                    autoinvested: value.autoinvested,
                    noAutoinvested: value.noAutoinvested,
                    select: asset.ticker
                } as MoneyChartData;
            })
        }).reduce((previous, current) => [...previous, ...current], []);
    }

    useEffect(() => {
        async function createAssetChartEntryCollection(simulationConfig: SimulationConfig): Promise<AssetChartEntryCollection[]> {
            return await Promise.all(simulationConfig.simulationItems.map(async item => {
                const decisions = await decisionHttpService.getDecisions(item.assetId, simulationConfig.riskLevel);
                const entryCollection = await createChartData(
                    item.locatedMoney || 0,
                    item.amount || 0,
                    simulationConfig.fromDate,
                    simulationConfig.toDate,
                    decisions,
                    date => assetsHttpService.getPrice(item.assetId, date).then(a => a.price)
                );
                const asset = await assetsHttpService.getAsset(item.assetId);
                return {
                    mic: asset.mic,
                    ticker: asset.ticker,
                    data: entryCollection
                } as AssetChartEntryCollection;
            }));
        }

        function createOverviewChartEntryCollection(assertChartDataEntryCollection: AssetChartEntryCollection[]): MoneyChartData[] {
            const map = new ChartEntryCollection();
            assertChartDataEntryCollection.forEach(assetData => {
                assetData.data.forEach((value, key) => {
                    const currentValue = map.get(key) || {autoinvested: 0, noAutoinvested: 0};
                    map.set(key, {
                        autoinvested: currentValue.autoinvested + value.autoinvested,
                        noAutoinvested: currentValue.noAutoinvested + value.noAutoinvested
                    });
                })
            })
            return Array.from(map.entries()).map(([key, value]) => ({
                date: key,
                autoinvested: value.autoinvested,
                noAutoinvested: value.noAutoinvested,
                select: "Overview"
            } as MoneyChartData));
        }

        if (simulationConfig) {
            setIsLoading(true);
            createAssetChartEntryCollection(simulationConfig)
                .then(collection => {
                    const overviewData = createOverviewChartEntryCollection(collection);
                    setChartData([...normalise(collection), ...overviewData]);
                })
                .catch(console.error)
                .finally(() => setIsLoading(false));
        }
    }, [simulationConfig]);

    return (
        <>
            {isLoading &&
                <div className="w-full flex items-center justify-center h-full">
                    <div
                        className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            }
            {simulationConfig && !isLoading &&
                <div>
                    <DataChart
                        data={chartData}
                        filterBy={(item) => {
                            return item.select
                        }}
                        sortByFilterBy={(a, b) => {
                            if (a === "Overview") return -1;
                            if (b === "Overview") return 1;
                            return a.localeCompare(b);
                        }}/>
                </div>
            }
        </>
    )
}

interface BaseChartData {
    date: string,
    autoinvested: number,
    noAutoinvested: number
}

function DataChart<T extends BaseChartData>
({
     data,
     filterBy,
     sortByFilterBy
 }: {
    data: T[],
    filterBy?: (item: T) => string,
    sortByFilterBy?: (a: string, b: string) => number
}) {
    const [selectedData, setSelectedData] = useState<string>();
    const [possibleValues, setPossibleValues] = useState<string[]>([]);
    const [filteredData, setFilteredData] = useState<BaseChartData[]>([]);

    useEffect(() => {
        if (filterBy) {
            let uniqueValues = [...new Set(data.map(filterBy))];
            if (sortByFilterBy) uniqueValues = uniqueValues.sort(sortByFilterBy)
            setPossibleValues(uniqueValues);
            setSelectedData(uniqueValues[0]);
        }
    }, [data, filterBy, sortByFilterBy]);

    useEffect(() => {
        let filtered;
        if (filterBy) {
            filtered = data.filter(item => filterBy(item) === selectedData)
                .map(item => ({
                    date: item.date,
                    autoinvested: item.autoinvested,
                    noAutoinvested: item.noAutoinvested
                } as BaseChartData));
        } else {
            filtered = data.map(item => ({
                date: item.date,
                autoinvested: item.autoinvested,
                noAutoinvested: item.noAutoinvested
            } as BaseChartData));
        }
        setFilteredData(filtered);
    }, [data, selectedData, filterBy]);

    return (
        <Card className={"shadow-none"}>
            <CardHeader className="flex items-center gap-4 space-y-0 border-b py-5 sm:flex-row flex-col">
                <div className="grid flex-1 gap-1 text-center sm:text-left">
                    <CardTitle>Simulation result</CardTitle>
                    <CardDescription>
                        Showing how portfolio could have behaved if stock operations were instructed by Autoinvestor
                    </CardDescription>
                </div>
                {possibleValues.length > 0 && <Select value={selectedData} onValueChange={setSelectedData}>
                    <SelectTrigger
                        className="sm:w-[160px] w-full rounded-lg sm:ml-auto"
                        aria-label="Select a value"
                    >
                        <SelectValue placeholder={possibleValues[0]}/>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        {possibleValues.map((value, index) => (
                            <SelectItem key={index} value={value} className="rounded-lg">
                                {value}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>}
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <LineChart
                        accessibilityLayer
                        data={filteredData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false}/>
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            domain={([dataMin, dataMax]) => {
                                const margin = (dataMax - dataMin) / 10;
                                return [Math.max(0, dataMin - margin), dataMax + margin]
                            }}
                            tickFormatter={(value) => {
                                const cents = Number(value);
                                return (cents / 100).toLocaleString("en-US", {
                                    style: "currency",
                                    currency: "USD"
                                })
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent
                                formatter={(value, name) => (
                                    <>
                                        <div
                                            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                                            style={{backgroundColor: `var(--color-${name})`}}
                                        />
                                        {((chartConfig["name" as keyof typeof chartConfig]?.label || name) as string)
                                            .replace(/^./, c => c.toUpperCase())}
                                        <div
                                            className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                            {(Number(value) / 100).toLocaleString("en-US", {
                                                style: "currency",
                                                currency: "USD"
                                            })}
                                        </div>
                                    </>
                                )}
                            />}
                        />
                        <Line
                            dataKey="autoinvested"
                            type="natural"
                            stroke="var(--color-autoinvested)"
                            strokeWidth={2}
                            dot={{
                                fill: "var(--color-autoinvested)",
                            }}
                            activeDot={{
                                r: 6,
                            }}
                        />
                        <Line
                            dataKey="noAutoinvested"
                            type="natural"
                            stroke="var(--color-noAutoinvested)"
                            strokeWidth={2}
                            dot={{
                                fill: "var(--color-noAutoinvested)",
                            }}
                            activeDot={{
                                r: 6,
                            }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

const chartConfig = {
    autoinvested: {
        label: "Autoinvested",
        color: "hsl(var(--chart-blue-1))",
    },
    noAutoinvested: {
        label: "No Autoinvested",
        color: "hsl(var(--chart-blue-2))",
    },
} satisfies ChartConfig

export default Simulation;