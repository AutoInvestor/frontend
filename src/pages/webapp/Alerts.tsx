import {ArrowTrendingDownIcon, ArrowTrendingUpIcon} from "@heroicons/react/16/solid";
import {useEffect, useState} from "react";
import {Alert} from "@/model/Alert.ts";
import {AlertsHttpService} from "@/services/alerts-http-service.ts";
import {AssetsHttpService} from "@/services/assets-http-service.ts";
import {Asset} from "@/model/Asset.ts";
import {Badge} from "@/components/ui/badge.tsx";

const alertsHttpService = new AlertsHttpService();
const assetsHttpService = new AssetsHttpService();

function Alerts() {
    return (
        <>
            <div className={"mt-5"}>
                <RecentAlerts/>
            </div>
        </>
    )
}

function RecentAlerts() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);

    useEffect(() => {
        async function fetchData() {
            const alerts = await alertsHttpService.getAlerts();
            const distinctAssetIds = [...new Set(alerts.map(item => item.assetId))];
            const assets = await Promise.all(distinctAssetIds.map(id => assetsHttpService.getAsset(id)));
            setAssets(assets);
            setAlerts(alerts);
        }
        fetchData().then();
    }, [])

    const getAsset = (assetId: string) => {
        const asset = assets.find(asset => asset.assetId === assetId);
        if (asset) {
            return asset;
        }
        throw new Error(`Asset with id ${assetId} not found`);
    }

    return (
        <div className={"flex gap-y-4 flex-col"}>
            {alerts.map((alert) => {
                const asset = getAsset(alert.assetId);
                return (
                    <div className={"flex flex-row gap-4 items-center"}>
                        <div className={"rounded-xl bg-neutral-100 w-fit box-border p-3"}>
                            {alert.type === "BUY"
                                ? <ArrowTrendingUpIcon className={"size-6"}/>
                                : <ArrowTrendingDownIcon className={"size-6"}/>}
                        </div>
                        <div className={"flex-1"}>
                            <p>
                                <Badge variant="outline">
                                    <span className={'text-neutral-400'}>{asset.mic}</span>
                                    <span className="ps-0.5 font-medium">{asset.ticker}</span>
                                </Badge>
                            </p>
                            <p className={"font-light text-neutral-500 pt-1"}>
                                {alert.type === "BUY"
                                    ? "Technical indicators sugests buying opportunity"
                                    : "Technical indicators sugests selling opportunity"
                                }
                            </p>
                        </div>
                        <div className={"text-neutral-500"}>
                            <small>{alert.date.toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true,
                            })}</small>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default Alerts;