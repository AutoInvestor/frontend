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

const portfolioHttpService = new PortfolioHttpService();
const assetsHttpService = new AssetsHttpService();

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

function Portfolio() {
    const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);

    const getAsset = (assetId: string) => {
        return assets.find(asset => asset.assetId === assetId);
    }

    const toUSD = (cents: number): string => {
        return (cents / 100).toLocaleString("en-US", {
            style: "currency",
            currency: "USD"
        })
    }

    const percentageChange = (actual: number, boughtAt: number): string => {
        const numericChange = ((actual - boughtAt) / boughtAt) * 100;
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
        assetsHttpService.getAsset(holding.assetId).then(asset => setAssets(prevItems_1 => [...prevItems_1, asset]));
    }

    const onDeleteHolding = async (holding: PortfolioHolding): Promise<void> => {
        await portfolioHttpService.deleteHolding(holding.assetId);
        setHoldings(prevItems => prevItems.filter(item => item.assetId !== holding.assetId));
        setAssets(prevItems_1 => prevItems_1.filter(item_1 => item_1.assetId !== holding.assetId));
    }

    useEffect(() => {
        portfolioHttpService.getPortfolioHoldings()
            .then(holdings => {
                setHoldings(holdings);
                Promise
                    .all(holdings.map(holding => assetsHttpService.getAsset(holding.assetId)))
                    .then(setAssets)
                    .catch(err => console.error('Error fetching assets:', err));
            })
            .catch(err => console.error('Error fetching holdings:', err));
    }, []);

    return (
        <>
            <Table className={"mb-5"}>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Ticker</TableHead>
                        <TableHead>Shares</TableHead>
                        <TableHead>Value per share</TableHead>
                        <TableHead>Total value</TableHead>
                        <TableHead className="text-right">Change (%)</TableHead>
                        <TableHead colSpan={1}></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {holdings.map(holding => {
                        const asset = getAsset(holding.assetId);
                        if (asset) {
                            if (asset.price) {
                                const difference = percentageChange(asset.price, holding.boughtPrice);
                                return (
                                    <TableRow key={holding.assetId} className={""}>
                                        <TableCell>
                                            <span className={'text-neutral-400'}>{asset.mic}</span>
                                            <span className="ps-2 font-medium">{asset.ticker}</span>
                                        </TableCell>
                                        <TableCell>{holding.amount}</TableCell>
                                        <TableCell>{toUSD(asset.price)}</TableCell>
                                        <TableCell>{toUSD(asset.price * holding.amount)}</TableCell>
                                        <TableCell
                                            className={`text-right font-medium ${difference.includes('-') ? 'text-red-700' : 'text-green-700'}`}>{difference}</TableCell>
                                        <TableCell>
                                            <AssetDrawer
                                                holding={holding}
                                                asset={asset}
                                                onSubmit={onUpdateHolding}
                                                onDelete={onDeleteHolding}>
                                                <PencilIcon className={"size-4"}></PencilIcon>
                                            </AssetDrawer>
                                        </TableCell>
                                    </TableRow>
                                )
                            }
                            return (
                                <TableRow key={holding.assetId}>
                                    <TableCell className="font-medium">{asset.ticker}</TableCell>
                                    <TableCell>{holding.amount}</TableCell>
                                    <TableCell colSpan={3}>Total</TableCell>
                                    <TableCell>
                                        <AssetDrawer
                                            holding={holding}
                                            asset={asset}
                                            onSubmit={onUpdateHolding}
                                            onDelete={onDeleteHolding}>
                                            <PencilIcon className={"size-4"}></PencilIcon>
                                        </AssetDrawer>
                                    </TableCell>
                                </TableRow>
                            )
                        }
                    })}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={3}>Total</TableCell>
                        <TableCell>{toUSD(holdings.map(holding => {
                            const asset = getAsset(holding.assetId);
                            if (asset && asset.price) {
                                return holding.amount * asset.price;
                            }
                            return 0;
                        }).reduce((previous, current) => previous + current, 0))}</TableCell>
                        <TableCell colSpan={2}></TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
            <h2 className={"text-2xl font-medium py-6 mt-6"}>Add new asset</h2>
            <HoldingCreator onSubmit={onAddHolding}></HoldingCreator>
        </>
    )
}

function HoldingCreator({onSubmit}: {
    onSubmit: (holding: PortfolioHolding) => Promise<void>
}) {
    const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
    const [asset, setAsset] = useState<Asset>();

    const groupByMap = <T, K extends keyof T>(list: T[], key: K): Map<T[K], T[]> => {
        return list.reduce((map, item) => {
            const keyValue = item[key];
            if (!map.has(keyValue)) {
                map.set(keyValue, []);
            }
            map.get(keyValue)!.push(item);
            return map;
        }, new Map<T[K], T[]>());
    }

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
            {asset ? <AssetDrawer asset={asset} onSubmit={onSubmit}>
                <Button>+ Add holding</Button>
            </AssetDrawer> : ""}
        </div>
    )
}

export function AssetDrawer({holding, asset, onSubmit, onDelete, children}: {
    holding?: PortfolioHolding,
    asset: Asset,
    onSubmit: (holding: PortfolioHolding) => Promise<void>,
    onDelete?: (holding: PortfolioHolding) => Promise<void>,
    children: ReactNode
}) {
    const [goal, setGoal] = useState(holding ? holding.amount : 1)
    const [boughtAt, setBoughtAt] = useState(holding ? holding.boughtPrice / 100 : 0)
    const [open, setOpen] = useState(false);

    if (holding && !onDelete) {
        throw "No delete callback defined when editing holding";
    }

    function onClick(adjustment: number) {
        setGoal(Math.max(1, goal + adjustment))
    }

    return (
        <Drawer open={open} onOpenChange={isOpen => {
            setOpen(isOpen);
            setGoal(holding ? holding.amount : 1);
            setBoughtAt(holding ? holding.boughtPrice / 100 : 0)
        }}>
            <DrawerTrigger asChild>
                {children}
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle>{asset.ticker}</DrawerTitle>
                        <DrawerDescription>{asset.mic}</DrawerDescription>
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
                            <Input value={boughtAt} onChange={event => setBoughtAt(parseFloat(event.target.value))} className={"mt-5"} type="number" min={0} placeholder="Bought price" />
                        </div>
                    </div>
                    <DrawerFooter>
                        <Button onClick={() => {
                            const newHolding: PortfolioHolding = {
                                assetId: asset.assetId,
                                amount: goal,
                                boughtPrice: parseFloat(boughtAt.toFixed(2)) * 100
                            }
                            onSubmit(newHolding).then(() => {
                                setOpen(false);
                            })
                        }}>Submit</Button>
                        {holding ? <Button
                            variant={"destructiveOutline"}
                            onClick={() => {
                                if (onDelete) {
                                    onDelete(holding).then(() => setOpen(false));
                                }
                            }}>Remove</Button> : ''
                        }
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