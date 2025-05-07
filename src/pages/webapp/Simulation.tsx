import {Input} from "@/components/ui/input.tsx";
import {WalletIcon} from "@heroicons/react/16/solid";
import {Switch} from "@/components/ui/switch.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useEffect, useRef, useState} from "react";
import {PortfolioHttpService} from "@/services/portfolio-http-service.ts";
import {AssetsHttpService} from "@/services/assets-http-service.ts";
import {Badge} from "@/components/ui/badge.tsx";

import {Area, AreaChart, CartesianGrid, XAxis, YAxis} from "recharts"
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {Decision} from "@/model/Decision.ts";
import {DecisionHttpService} from "@/services/decision-http-service.ts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";

const portfolioHttpService = new PortfolioHttpService();
const assetsHttpService = new AssetsHttpService();
const decisionHttpService = new DecisionHttpService();

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
        <>
            <div>
                <SimulationConfig setSimulationConfig={setSimulationConfig}/>
                <SimulationResults simulationConfig={simulationConfig}/>
            </div>
        </>
    )
}

function parseDateFromInput(inputValue: string): Date {
    const [year, month, day] = inputValue.split('-').map(Number);
    return new Date(year, month - 1, day); // month es base 0
}

function SimulationConfig({setSimulationConfig}: {
    setSimulationConfig: (simulationItems: SimulationConfig) => void
}) {
    const fromDate = useRef<HTMLInputElement>(null);
    const toDate = useRef<HTMLInputElement>(null);

    const [validDates, setValidDates] = useState<boolean>(true);
    const [simulationItems, setSimulationItems] = useState<SimulationItem[]>([]);

    const addPortfolioHoldings = () => {
        portfolioHttpService.getPortfolioHoldings()
            .then(holdings => holdings.map(holding => ({
                assetId: holding.assetId,
                amount: holding.amount
            } as SimulationItem)))
            .then(setSimulationItems)
    }

    const removePortfolioHoldings = () => {
        setSimulationItems([])
    }

    const checkDatesValidity = () => {
        if (fromDate.current?.value && toDate.current?.value) {
            const from = parseDateFromInput(fromDate.current.value);
            const to = parseDateFromInput(toDate.current.value);
            setValidDates(to > from);
        }
    }

    return (
        <>
            <div className={"mt-5"}>
                <h2 className={"text-2xl font-medium py-6"}>Time period</h2>
                <div className={"flex gap-4"}>
                    <Input onChange={() => checkDatesValidity()} ref={fromDate} type={"date"}/>
                    <Input onChange={() => checkDatesValidity()} ref={toDate} type={"date"}/>
                </div>
                {!validDates && (<p className={"text-red-800"}>Invalid dates</p>)}
            </div>
            <div className={"mt-5"}>
                <h2 className={"text-2xl font-medium py-6"}>Assets selection</h2>
                <div className={"flex gap-y-4 flex-col"}>
                    <div className={"flex flex-row gap-4 items-center"}>
                        <div className={"rounded-xl bg-neutral-100 w-fit box-border p-3"}>
                            <WalletIcon className={"size-6"}/>
                        </div>
                        <div className={"flex-1"}>
                            <p>Current portfolio</p>
                            <p className={"font-light text-neutral-500 pt-1"}>All assets in your current portfolio</p>
                        </div>
                        <div className={"text-neutral-500"}>
                            <Switch
                                onCheckedChange={event => event ? addPortfolioHoldings() : removePortfolioHoldings()}/>
                        </div>
                    </div>
                </div>
            </div>
            <div className={"mt-10"}>
                <Button className={"block mb-2 cursor-pointer"}
                        disabled={simulationItems.length === 0 || !validDates || !fromDate.current?.value || !toDate.current?.value}
                        onClick={() => setSimulationConfig({
                            fromDate: parseDateFromInput(fromDate.current?.value || ''),
                            toDate: parseDateFromInput(toDate.current?.value || ''),
                            riskLevel: 3,
                            simulationItems: simulationItems
                        })}>
                    Run simulation
                </Button>
                {simulationItems.length > 0 && (
                    <Badge variant="outline">
                        {simulationItems.length} assets selected
                    </Badge>
                )}
            </div>
        </>
    )
}

function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function endOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
}

function startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
}

function dateBetween(date: Date, min: Date, max: Date): boolean {
    return date < max && date > min;
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
            .filter(decision => dateBetween(decision.date, current, addDays(current, 1)))
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
    const [assetsData, setAssetsData] = useState<AssetChartEntryCollection[]>([]);
    const [chartData, setChartData] = useState<MoneyChartData[]>([]);

    useEffect(() => {
        const map = new ChartEntryCollection();
        assetsData.forEach(assetData => {
            assetData.data.forEach((value, key) => {
                const currentValue = map.get(key) || {autoinvested: 0, noAutoinvested: 0};
                map.set(key, {
                    autoinvested: currentValue.autoinvested + value.autoinvested,
                    noAutoinvested: currentValue.noAutoinvested + value.noAutoinvested
                });
            })
        })
        const overviewData = Array.from(map.entries()).map(([key, value]) => ({
            date: key,
            autoinvested: value.autoinvested,
            noAutoinvested: value.noAutoinvested,
            select: "Overview"
        }))
        setChartData([...normalise(assetsData), ...overviewData]);
    }, [assetsData]);

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
        async function fetchData(simulationConfig: SimulationConfig): Promise<void> {
            const assetsData = await Promise.all(simulationConfig.simulationItems.map(async item => {
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
            setAssetsData(assetsData);
        }

        if (simulationConfig) fetchData(simulationConfig).then();
    }, [simulationConfig]);

    return (
        <>
            {simulationConfig && <div className={"my-5"}>
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
            </div>}
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
        <Card>
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1 text-center sm:text-left">
                    <CardTitle>Simulation result</CardTitle>
                    <CardDescription>
                        Showing how portfolio could have behaved if stock operations were instructed by Autoinvestor
                    </CardDescription>
                </div>
                {possibleValues.length > 0 && <Select value={selectedData} onValueChange={setSelectedData}>
                    <SelectTrigger
                        className="w-[160px] rounded-lg sm:ml-auto"
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
                    <AreaChart data={filteredData}>
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
                            tickCount={3}
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
                            content={
                                <ChartTooltipContent
                                    formatter={(value, name) => (
                                        <>
                                            <div
                                                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                                                style={{ backgroundColor: `var(--color-${name})` }}
                                            />
                                            {chartConfig[name as keyof typeof chartConfig]?.label || name}
                                            <div
                                                className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                                {(Number(value) / 100).toLocaleString("en-US", {
                                                    style: "currency",
                                                    currency: "USD"
                                                })}
                                            </div>
                                        </>
                                    )}
                                    indicator="dot"
                                />
                            }
                        />
                        <defs>
                            <linearGradient id="fillAutoinvested" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-autoinvested)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-autoinvested)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient id="fillNoAutoinvested" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-noAutoinvested)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-noAutoinvested)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <Area
                            dataKey="autoinvested"
                            type="natural"
                            fill="url(#fillAutoinvested)"
                            fillOpacity={0.4}
                            stroke="var(--color-autoinvested)"
                            stackId="a"
                        />
                        <Area
                            dataKey="noAutoinvested"
                            type="natural"
                            fill="url(#fillNoAutoinvested)"
                            fillOpacity={0.4}
                            stroke="var(--color-noAutoinvested)"
                            stackId="b"
                        />
                        <ChartLegend content={<ChartLegendContent/>}/>
                    </AreaChart>
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