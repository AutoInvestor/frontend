import {Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {PortfolioHttpService} from "@/services/portfolio-http-service.ts";
import {useEffect, useState} from "react";
import {PortfolioHolding} from "@/model/portfolio-holding.ts";
import {AssetsHttpService} from "@/services/assets-http-service.ts";
import {Asset} from "@/model/asset.ts";

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
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Ticker</TableHead>
                    <TableHead>Shares</TableHead>
                    <TableHead>Value per share</TableHead>
                    <TableHead>Total value</TableHead>
                    <TableHead className="text-right">Change (%)</TableHead>
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
                                    <TableCell><span className={'text-neutral-400'}>{asset.mic}</span> <span className="font-medium">{asset.ticker}</span></TableCell>
                                    <TableCell>{holding.amount}</TableCell>
                                    <TableCell>$ {assetPrice}</TableCell>
                                    <TableCell>$ {currentHoldingValue}</TableCell>
                                    <TableCell className={`text-right font-medium ${parseFloat(difference) < 0 ? 'text-red-700': 'text-green-700'}`}>{parseFloat(difference) > 0 ? `+${difference}` : `${difference}`}</TableCell>
                                </TableRow>
                            )
                        } else {
                            return (
                                <TableRow key={holding.assetId}>
                                    <TableCell className="font-medium">{asset.ticker}</TableCell>
                                    <TableCell>{holding.amount}</TableCell>
                                    <TableCell colSpan={3}>Total</TableCell>
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
                    <TableCell className="text-right">?</TableCell>
                </TableRow>
            </TableFooter>
        </Table>
    )
}

export default Dashboard;