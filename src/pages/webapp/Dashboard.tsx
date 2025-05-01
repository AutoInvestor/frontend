import {Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {PortfolioHttpService} from "@/services/portfolio-http-service.ts";
import {useEffect, useState} from "react";
import {PortfolioHolding} from "@/model/portfolio-holding.ts";
import {AssetsHttpService} from "@/services/assets-http-service.ts";
import {Asset} from "@/model/asset.ts";

import {PencilIcon, PlusIcon} from "@heroicons/react/16/solid";

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

    useEffect(() => {
        portfolioHttpService.getPortfolioHoldings()
            .then(setHoldings)
            .catch(err => console.error('Error fetching holdings:', err));
    }, []);

    useEffect(() => {
        Promise
            .all(holdings.map(holding => assetsHttpService.getAsset(holding.assetId)))
            .then(assets => setAssets(assets))
            .catch(err => console.error('Error fetching assets:', err));
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
                        <TableHead className="text-right">Change (%)</TableHead>
                        <TableHead colSpan={1}></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {holdings.map((holding) => {
                        const asset = getAsset(holding.assetId);
                        if (asset) {
                            if (asset.price) {
                                const assetPrice = (asset.price / 100).toFixed(2);
                                const currentHoldingValue = ((holding.amount * asset.price) / 100).toFixed(2);
                                const difference = ((asset.price - holding.boughtPrice) / 100).toFixed(2);
                                return (
                                    <TableRow key={holding.assetId} className={""}>
                                        <TableCell><span className={'text-neutral-400'}>{asset.mic}</span> <span
                                            className="font-medium">{asset.ticker}</span></TableCell>
                                        <TableCell>{holding.amount}</TableCell>
                                        <TableCell>$ {assetPrice}</TableCell>
                                        <TableCell>$ {currentHoldingValue}</TableCell>
                                        <TableCell
                                            className={`text-right font-medium ${parseFloat(difference) < 0 ? 'text-red-700' : 'text-green-700'}`}>{parseFloat(difference) > 0 ? `+${difference}` : `${difference}`}</TableCell>
                                        <TableCell><DrawerDemo holding={holding} asset={asset} onUpdateHolding={newHolding => {
                                            const newHoldings = holdings.map(elem => {
                                                if (elem.assetId === newHolding.assetId) {
                                                    return new PortfolioHolding(newHolding.assetId, newHolding.amount, newHolding.boughtPrice)
                                                }
                                                return elem;
                                            });
                                            setHoldings(newHoldings);
                                        }} onDeleteHolding={() => {
                                            const newHoldings = holdings.filter(elem => elem.assetId !== holding.assetId);
                                            setHoldings(newHoldings);
                                        }}></DrawerDemo></TableCell>
                                    </TableRow>
                                )
                            } else {
                                return (
                                    <TableRow key={holding.assetId}>
                                        <TableCell className="font-medium">{asset.ticker}</TableCell>
                                        <TableCell>{holding.amount}</TableCell>
                                        <TableCell colSpan={3}>Total</TableCell>
                                        <TableCell><DrawerDemo holding={holding} asset={asset} onUpdateHolding={newHolding => {
                                            const newHoldings = holdings.map(elem => {
                                                if (elem.assetId === newHolding.assetId) {
                                                    return new PortfolioHolding(newHolding.assetId, newHolding.amount, newHolding.boughtPrice)
                                                }
                                                return elem;
                                            });
                                            setHoldings(newHoldings);
                                        }} onDeleteHolding={() => {
                                            const newHoldings = holdings.filter(elem => elem.assetId !== holding.assetId);
                                            setHoldings(newHoldings);
                                        }}></DrawerDemo></TableCell>
                                    </TableRow>
                                )
                            }
                        }
                    })}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={3}>Total</TableCell>
                        <TableCell>$ {holdings.map(holding => {
                            const asset = getAsset(holding.assetId);
                            if (asset && asset.price) {
                                return (holding.amount * asset.price) / 100;
                            }
                            return 0;
                        }).reduce((previous, current) => previous + current, 0).toFixed(2)}</TableCell>
                        <TableCell colSpan={2}></TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
            <h2 className={"text-2xl font-medium py-6 mt-6"}>Add new asset</h2>
            <SelectAsset onAddHolding={holding => {
                setHoldings(prev => [...prev, holding]);
            }}></SelectAsset>
        </>
    )
}

function SelectAsset({ onAddHolding }: { onAddHolding: (holding: PortfolioHolding) => void }) {
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
                            <SelectGroup>
                                <SelectLabel>{key}</SelectLabel>
                                {assets.map(asset => (
                                    <SelectItem value={asset.assetId}>{asset.ticker}</SelectItem>
                                ))}
                            </SelectGroup>
                        )
                    })}
                </SelectContent>
            </Select>
            {asset ? <AddHolding asset={asset} onAddHolding={onAddHolding}/> : ""}
        </div>
    )
}

export function AddHolding({asset, onAddHolding}: { asset: Asset, onAddHolding: (holding: PortfolioHolding) => void }) {
    const [goal, setGoal] = useState(1)
    const [open, setOpen] = useState(false);

    function onClick(adjustment: number) {
        setGoal(Math.max(1, goal + adjustment))
    }

    return (
        <Drawer open={open} onOpenChange={setOpen} onClose={() => {
            setGoal(1)
        }}>
            <DrawerTrigger asChild>
                <Button><PlusIcon className={"size-4"}></PlusIcon> Add holding</Button>
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
                    </div>
                    <DrawerFooter>
                        <Button onClick={() => {
                            const holding = new PortfolioHolding(asset.assetId, goal, 0);
                            portfolioHttpService.createHolding(holding).then(() => {
                                onAddHolding(holding)
                                setOpen(false)
                            })
                        }}>Submit</Button>
                        <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    )
}

export function DrawerDemo({holding, asset, onUpdateHolding, onDeleteHolding}: { holding: PortfolioHolding, asset: Asset, onUpdateHolding: (holding: PortfolioHolding) => void, onDeleteHolding: () => void }) {
    const [goal, setGoal] = useState(holding.amount)
    const [open, setOpen] = useState(false);

    function onClick(adjustment: number) {
        setGoal(Math.max(0, goal + adjustment))
    }

    return (
        <Drawer open={open} onOpenChange={setOpen} onClose={() => setGoal(holding.amount)}>
            <DrawerTrigger asChild>
                <PencilIcon className={"size-4"}></PencilIcon>
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
                                disabled={goal <= 0}
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
                    </div>
                    <DrawerFooter>
                        <Button onClick={() => {
                            holding.amount = goal;
                            portfolioHttpService.updateHolding(holding).then(() => {
                                onUpdateHolding(holding)
                                setOpen(false)
                            })
                        }}>Submit</Button>
                        <Button variant={"destructiveOutline"} onClick={() => {
                            portfolioHttpService.deleteHolding(holding.assetId).then(() => {
                                onDeleteHolding()
                                setOpen(false)
                            })
                        }}>Remove</Button>
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