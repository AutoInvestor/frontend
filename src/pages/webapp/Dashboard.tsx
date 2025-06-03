import {Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {PortfolioHttpService} from "@/services/portfolio-http-service.ts";
import {ReactNode, useEffect, useState} from "react";
import {PortfolioHolding} from "@/model/PortfolioHolding.ts";
import {AssetsHttpService} from "@/services/assets-http-service.ts";
import {Asset} from "@/model/Asset.ts";
import {useNavigate} from 'react-router-dom';

import {ExclamationTriangleIcon, NewspaperIcon, PencilIcon,} from "@heroicons/react/16/solid";

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import {Minus, Plus, TrendingDown, TrendingUp} from "lucide-react"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input.tsx";
import {DecisionHttpService} from "@/services/decision-http-service.ts";
import {UsersHttpService} from "@/services/users-http-service.ts";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {NewsItem} from "@/model/NewsItem.ts";
import {Alert} from "@/model/Alert.ts";
import {NewsHttpService} from "@/services/news-http-service.ts";
import {AlertsHttpService} from "@/services/alerts-http-service.ts";
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart.tsx";
import {CartesianGrid, Line, LineChart, XAxis, YAxis} from "recharts";
import {addDays, startOfDay} from "date-fns";

const portfolioHttpService = new PortfolioHttpService();
const assetsHttpService = new AssetsHttpService();
const usersHttpService = new UsersHttpService();
const decisionHttpService = new DecisionHttpService();

function Dashboard() {
    return (
        <div className={"flex flex-row gap-5"}>
            <div className={"flex-2"}>
                <Portfolio/>
            </div>
            <div className={"flex-1"}>
                <Summary/>
            </div>
        </div>
    )
}

const newsHttpService = new NewsHttpService();
const alertsHttpService = new AlertsHttpService();

function Summary() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchInitialData(): Promise<void> {
            const news = await newsHttpService.getNews();
            setNews(news);
            const alerts = await alertsHttpService.getAlerts();
            setAlerts(alerts);
        }

        fetchInitialData().then();
    }, []);

    const getLatestNews = () => {
        return news.reverse().pop();
    }

    const getLatestAlert = () => {
        return alerts.reverse().pop();
    }

    const isToday = (date: Date): boolean => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    }

    return (
        <div className={"flex flex-col gap-5"}>
            <Card onClick={() => navigate("/news")}
                  className={"md:flex-1 bg-neutral-100 shadow-none border-none cursor-pointer"}>
                <CardHeader>
                    <div className={"rounded-full bg-neutral-200 w-fit box-border p-3"}>
                        <NewspaperIcon className={"size-6"}/>
                    </div>
                    <CardTitle className={"pt-3"}>Market news</CardTitle>
                    <CardDescription>
                        <p>{news.filter(item => isToday(item.date)).length} new articles today</p>
                        <p>Latest: {getLatestNews()?.title}</p>
                    </CardDescription>
                </CardHeader>
            </Card>
            <Card onClick={() => navigate("/alerts")}
                  className={"md:flex-1 bg-neutral-100 shadow-none border-none cursor-pointer"}>
                <CardHeader>
                    <div className={"rounded-full bg-neutral-200 w-fit box-border p-3"}>
                        <ExclamationTriangleIcon className={"size-6"}/>
                    </div>
                    <CardTitle className={"pt-3"}>Title</CardTitle>
                    <CardDescription>
                        <p>{alerts.filter(item => isToday(item.date)).length} alerts in the last day</p>
                        <p>Latest: {
                            getLatestAlert()?.type === "BUY"
                                ? "Buy alert triggered"
                                : (getLatestAlert()?.type === "SELL"
                                    ? "Sell alert triggered"
                                    : "No change")
                        }</p>
                    </CardDescription>
                    <CardDescription></CardDescription>
                </CardHeader>
            </Card>
        </div>
    )
}

interface ChartData {
    date: string;
    portfolio: number;
}

const chartConfig = {
    portfolio: {
        label: "Portfolio",
        color: "hsl(var(--chart-blue-1))",
    },
} satisfies ChartConfig

function ChartLineDots({ chartData }: { chartData: ChartData[] }) {
    const calculatePerformance: <T, K extends keyof T = keyof T>(arr: T[], key: K extends keyof T ? (T[K] extends number ? K : never) : never) => number = (arr, key) => {
        const first = arr.length > 0 ? arr[0] : undefined;
        const last = arr.length > 0 ? arr[arr.length - 1] : undefined;
        if (!first || !last) {
            return 0;
        }
        const firstValue = first[key];
        const lastValue = last[key];
        if (typeof firstValue !== 'number' || typeof lastValue !== 'number') {
            return 0;
        }
        return parseFloat(((lastValue - firstValue) / firstValue * 100).toFixed(2));
    }

    return (
        <Card className={"shadow-none"}>
            <CardHeader>
                <CardTitle>Portfolio performance</CardTitle>
                <CardDescription>Portfolio performance for the last week</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className={"h-24 w-full"}>
                    <LineChart
                        accessibilityLayer
                        data={chartData}
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
                            dataKey="portfolio"
                            type="natural"
                            stroke="var(--color-portfolio)"
                            strokeWidth={2}
                            dot={{
                                fill: "var(--color-portfolio)",
                            }}
                            activeDot={{
                                r: 6,
                            }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    Trending up by {calculatePerformance(chartData, "portfolio")}% this week {
                    calculatePerformance(chartData, "portfolio") > 0
                        ? <TrendingUp className="h-4 w-4"/>
                        : <TrendingDown className="h-4 w-4"/>
                }
                </div>
                <div className="text-muted-foreground leading-none">
                    Showing total performance of the overall portfolio holdings
                </div>
            </CardFooter>
        </Card>
    )
}


interface AssetHolding {
    assetId: string;
    mic: string;
    ticker: string;
    shares: number;
    valueShare: number;
    buyPrice: number;
    lastDecision: "BUY" | "SELL" | "HOLD";
    lastDecisionDate: Date;
}

function toUSD(cents: number) {
    return (cents / 100).toLocaleString("en-US", {
        style: "currency",
        currency: "USD"
    })
}

function Portfolio() {
    const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
    const [assetHoldings, setAssetHoldings] = useState<AssetHolding[]>([]);
    const [performanceChartData, setPerformanceChartData] = useState<ChartData[]>([]);

    const percentageChange = (actual: number, original: number): string => {
        const numericChange = ((actual - original) / original) * 100;
        return `${numericChange < 0 ? '-' : '+'}${Math.abs(numericChange).toFixed(2)}`
    }

    const onUpdateHolding = async (holding: PortfolioHolding): Promise<void> => {
        await portfolioHttpService.updateHolding(holding);
        setHoldings(prevItems => {
            const index = prevItems.findIndex(item => item.assetId === holding.assetId);
            const updatedItems = [...prevItems];
            updatedItems[index] = {...updatedItems[index], ...holding};
            return updatedItems;
        });
    }

    const onAddHolding = async (holding: PortfolioHolding): Promise<void> => {
        if (holdings.findIndex(item => item.assetId === holding.assetId) !== -1) {
            return;
        }
        await portfolioHttpService.createHolding(holding);
        setHoldings(prevItems => [...prevItems, holding]);
    }

    const onDeleteHolding = async (assetId: string): Promise<void> => {
        await portfolioHttpService.deleteHolding(assetId);
        setHoldings(prevItems => prevItems.filter(item => item.assetId !== assetId));
    }

    const createPerformanceChartData = async (holdings: AssetHolding[]): Promise<ChartData[]> => {
        const entryCollection: ChartData[] = [];

        const sevenDaysAgo = startOfDay(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
        const end = startOfDay(new Date(Date.now()));
        for (
            let current = new Date(sevenDaysAgo);
            current <= end;
            current = addDays(current, 1)
        ) {
            const values = await Promise.all(holdings.map(async holding => {
                const price = await assetsHttpService.getPrice(holding.assetId, current)
                return price.price * holding.shares;
            }))
            const totalValue = values.reduce((acc, curr) => acc + curr, 0);
            entryCollection.push({
                date: current.toISOString().split('T')[0],
                portfolio: totalValue
            })
        }

        return entryCollection;
    }

    useEffect(() => {
        async function fetchInitialData(): Promise<void> {
            const holdings = await portfolioHttpService.getPortfolioHoldings();
            setHoldings(holdings);
        }

        fetchInitialData().then();
    }, []);

    useEffect(() => {
        async function fetchInitialData(): Promise<void> {
            const user = await usersHttpService.getUser();
            const assets = await Promise.all(holdings.map(async holding => {
                const asset = await assetsHttpService.getAsset(holding.assetId);
                const assetPrice = await assetsHttpService.getPrice(holding.assetId, new Date(Date.now()));
                const decisions = await decisionHttpService.getDecisions(holding.assetId, user.riskLevel);
                const lastDecision = decisions.sort((a, b) => a.date.getTime() - b.date.getTime()).pop();
                return {
                    assetId: holding.assetId,
                    mic: asset.mic,
                    ticker: asset.ticker,
                    shares: holding.amount,
                    valueShare: assetPrice.price,
                    buyPrice: holding.boughtPrice,
                    lastDecision: lastDecision?.type,
                    lastDecisionDate: lastDecision?.date
                } as AssetHolding;
            }));
            setAssetHoldings(assets);
            createPerformanceChartData(assets).then(setPerformanceChartData)
        }

        fetchInitialData().then();
    }, [holdings]);

    return (
        <>
            <ChartLineDots chartData={performanceChartData}></ChartLineDots>
            <Card className={"shadow-none box-border p-5 mt-5"}>
                <div className={"flex flex-col gap-5 items-end"}>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Ticker</TableHead>
                                <TableHead>Shares</TableHead>
                                <TableHead>Value per share</TableHead>
                                <TableHead>Total value</TableHead>
                                <TableHead>Last decision</TableHead>
                                <TableHead className="text-right">Change (%)</TableHead>
                                <TableHead colSpan={1}></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assetHoldings.map(holding => {
                                const difference = percentageChange(holding.valueShare, holding.buyPrice);
                                return (
                                    <TableRow key={holding.assetId} className={""}>
                                        <TableCell>
                                            <span className={'text-neutral-400'}>{holding.mic}</span>
                                            <span className="ps-2 font-medium">{holding.ticker}</span>
                                        </TableCell>
                                        <TableCell>{holding.shares}</TableCell>
                                        <TableCell>{toUSD(holding.valueShare)}</TableCell>
                                        <TableCell>{toUSD(holding.valueShare * holding.shares)}</TableCell>
                                        <TableCell>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Badge className={`${holding.lastDecision === "BUY"
                                                            ? "bg-green-700"
                                                            : (holding.lastDecision === "SELL"
                                                                ? "bg-red-700"
                                                                : "")}`} variant={"default"}>
                                                            {holding.lastDecision}
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{holding.lastDecisionDate.toLocaleString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: 'numeric',
                                                            minute: '2-digit',
                                                            second: '2-digit',
                                                            hour12: true,
                                                        })}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                        <TableCell
                                            className={`text-right font-medium ${difference.includes('-') ? 'text-red-700' : 'text-green-700'}`}>{difference}</TableCell>
                                        <TableCell>
                                            <AssetDrawer
                                                assetId={holding.assetId}
                                                buyPrice={holding.buyPrice}
                                                shares={holding.shares}
                                                onSubmit={onUpdateHolding}
                                                onDelete={onDeleteHolding}>
                                                <PencilIcon className={"size-4"}></PencilIcon>
                                            </AssetDrawer>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={3}>Total</TableCell>
                                <TableCell>{
                                    toUSD(assetHoldings
                                        .map(holding => holding.shares * holding.valueShare)
                                        .reduce((previous, current) => previous + current, 0))
                                }</TableCell>
                                <TableCell colSpan={3}></TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </Card>
            <Card className={"shadow-none box-border mt-5"}>
                <CardHeader>
                    <CardTitle>Add new asset to portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                    <HoldingCreator onSubmit={onAddHolding}></HoldingCreator>
                </CardContent>
            </Card>
        </>
    )
}

function groupByMap<T, K extends keyof T>(list: T[], key: K): Map<T[K], T[]> {
    return list.reduce((map, item) => {
        const keyValue = item[key];
        if (!map.has(keyValue)) {
            map.set(keyValue, []);
        }
        map.get(keyValue)!.push(item);
        return map;
    }, new Map<T[K], T[]>());
}

function HoldingCreator({onSubmit}: {
    onSubmit: (holding: PortfolioHolding) => Promise<void>
}) {
    const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
    const [asset, setAsset] = useState<Asset>();

    useEffect(() => {
        assetsHttpService.getAllAssets()
            .then(setAvailableAssets)
            .catch(err => console.error('Error fetching assets:', err));
    }, []);

    return (
        <div className={"flex justify-between"}>
            <Select onValueChange={value => {
                setAsset(availableAssets.find(asset => asset.assetId === value));
            }}>
                <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select an asset"/>
                </SelectTrigger>
                <SelectContent>
                    {Array.from(groupByMap(availableAssets, "mic").entries()).map(([key, assets]) => {
                        return (
                            <SelectGroup key={key}>
                                <SelectLabel>{key}</SelectLabel>
                                {assets.map(asset => (
                                    <SelectItem key={asset.assetId} value={asset.assetId}>{asset.ticker}</SelectItem>
                                ))}
                            </SelectGroup>
                        )
                    })}
                </SelectContent>
            </Select>
            {asset && <AssetDrawer assetId={asset.assetId} onSubmit={onSubmit}>
                <Button className={"cursor-pointer"}>Add holding</Button>
            </AssetDrawer>}
            {!asset && <Button disabled>Add holding</Button>}
        </div>
    )
}

export function AssetDrawer({assetId, buyPrice, shares, children, onSubmit, onDelete}: {
    assetId: string,
    buyPrice?: number,
    shares?: number,
    children?: ReactNode,
    onDelete?: (assetId: string) => Promise<void>,
    onSubmit: (holding: PortfolioHolding) => Promise<void>,
}) {
    const [asset, setAsset] = useState<Asset>();
    const [goal, setGoal] = useState(shares ?? 1)
    const [boughtAt, setBoughtAt] = useState(buyPrice ?? 0)
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (shares) setGoal(shares);
    }, [shares]);

    useEffect(() => {
        assetsHttpService.getAsset(assetId).then(setAsset);
        if (buyPrice) setBoughtAt(buyPrice);
        else assetsHttpService.getPrice(assetId, new Date(Date.now())).then(price => price.price).then(setBoughtAt);
    }, [assetId, buyPrice]);

    function onClick(adjustment: number) {
        setGoal(Math.max(1, goal + adjustment))
    }

    return (
        <Drawer open={open} onOpenChange={isOpen => {
            setOpen(isOpen);
            setGoal(shares ?? 1);
            setBoughtAt(buyPrice ? buyPrice / 100 : 0)
        }}>
            <DrawerTrigger asChild>
                {children}
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle>{asset?.ticker}</DrawerTitle>
                        <DrawerDescription>{asset?.mic}</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 pb-0">
                        <div className="flex items-center justify-center space-x-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 shrink-0 rounded-full"
                                onClick={() => onClick(-1)}
                                disabled={goal <= 1}
                            >
                                <Minus/>
                                <span className="sr-only">Decrease</span>
                            </Button>
                            <div className="flex-1 text-center">
                                <div className="text-7xl font-bold tracking-tighter">
                                    {goal}
                                </div>
                                <div className="text-[0.70rem] uppercase text-muted-foreground">
                                    Shares
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 shrink-0 rounded-full"
                                onClick={() => onClick(1)}
                            >
                                <Plus/>
                                <span className="sr-only">Increase</span>
                            </Button>
                        </div>
                        <div>
                            <Input value={boughtAt} onChange={event => setBoughtAt(parseFloat(event.target.value))}
                                   className={"mt-5"} type="number" min={0} placeholder="Bought price"/>
                        </div>
                    </div>
                    <DrawerFooter>
                        {asset && <>
                            <Button disabled={boughtAt === 0} onClick={() => {
                                const newHolding: PortfolioHolding = {
                                    assetId: asset.assetId,
                                    amount: goal,
                                    boughtPrice: parseFloat(boughtAt.toFixed(2)) * 100
                                }
                                onSubmit(newHolding).then(() => {
                                    setOpen(false);
                                })
                            }}>Submit</Button>
                            {onDelete ? <Button
                                variant={"destructiveOutline"}
                                onClick={() => {
                                    onDelete(asset.assetId).then(() => setOpen(false));
                                }}>Remove</Button> : ''
                            }
                        </>}
                        <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    )
}

export default Dashboard;