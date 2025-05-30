import {Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {PortfolioHttpService} from "@/services/portfolio-http-service.ts";
import {ReactNode, useEffect, useState} from "react";
import {PortfolioHolding} from "@/model/PortfolioHolding.ts";
import {AssetsHttpService} from "@/services/assets-http-service.ts";
import {Asset} from "@/model/Asset.ts";

import {PencilIcon} from "@heroicons/react/16/solid";

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
import {Minus, Plus} from "lucide-react"

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

const portfolioHttpService = new PortfolioHttpService();
const assetsHttpService = new AssetsHttpService();
const usersHttpService = new UsersHttpService();
const decisionHttpService = new DecisionHttpService();

function Dashboard() {
    return (
        <>
            <div>
                <Summary/>
                <div className={"mt-5"}>
                    <Portfolio/>
                </div>
            </div>
        </>
    )
}

function Summary() {
    return (
        <>
        </>
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
        }
        fetchInitialData().then();
    }, [holdings]);

    return (
        <>
            <Table className={"mb-5"}>
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
            <h2 className={"text-2xl font-medium py-6 mt-6"}>Add new asset</h2>
            <HoldingCreator onSubmit={onAddHolding}></HoldingCreator>
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
        <div className={"flex gap-3"}>
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
            {asset ? <AssetDrawer assetId={asset.assetId} onSubmit={onSubmit}>
                <Button>+ Add holding</Button>
            </AssetDrawer> : ""}
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