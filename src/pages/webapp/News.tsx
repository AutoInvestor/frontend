import {useEffect, useState} from "react";
import {ArrowTopRightOnSquareIcon, NewspaperIcon} from "@heroicons/react/16/solid";
import {NewsHttpService} from "@/services/news-http-service.ts";
import {NewsItem} from "@/model/NewsItem.ts";
import {AssetsHttpService} from "@/services/assets-http-service.ts";
import {Asset} from "@/model/Asset.ts";
import {Badge} from "@/components/ui/badge.tsx";
import {Card} from "@/components/ui/card.tsx";

const newsHttpService = new NewsHttpService();
const assetsHttpService = new AssetsHttpService();

function News() {
    return (
        <>
            <div className={"mt-5"}>
                <RecentNews/>
            </div>
        </>
    )
}

function RecentNews() {
    const [newsItems, setNewsItems] = useState<Map<string, NewsItem[]>>(new Map());
    const [assets, setAssets] = useState<Asset[]>([]);

    function groupBy<T, K extends keyof T>(array: T[], key: K): Map<T[K], T[]> {
        const map = new Map<T[K], T[]>();
        for (const item of array) {
            const groupKey = item[key];
            if (!map.has(groupKey)) {
                map.set(groupKey, []);
            }
            map.get(groupKey)!.push(item);
        }
        return map;
    }

    useEffect(() => {
        async function fetchData() {
            const newsItems = await newsHttpService.getNews();
            const newsItemsGrouped = groupBy(newsItems, "url");
            const distinctAssetIds = [...new Set(newsItems.map(item => item.assetId))];
            const assets = await Promise.all(distinctAssetIds.map(id => assetsHttpService.getAsset(id)));
            setAssets(assets);
            setNewsItems(newsItemsGrouped);
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
            {Array.from(newsItems.entries()).map(([url, newsItems]) => {
                const assets = newsItems.map(item => getAsset(item.assetId));
                const uniqueAssets = Array.from(new Map(assets.map(item => [item.assetId, item])).values());
                return (
                    <Card className={"shadow-none"}>
                        <div className={"flex flex-row gap-4 items-center px-5"}>
                            <div className={"rounded-xl bg-neutral-100 w-fit box-border p-3 border"}>
                                <NewspaperIcon className={"size-6"}/>
                            </div>
                            <div className={"flex-1"}>
                                <p>
                                    {uniqueAssets.map(asset => (
                                        <Badge variant="outline" className={"mr-1"} key={asset.assetId}>
                                            <span className={'text-neutral-400'}>{asset.mic}</span>
                                            <span className="ps-0.5 font-medium">{asset.ticker}</span>
                                        </Badge>
                                    ))}
                                </p>
                                <p className={"font-light-500 pt-1"}>{newsItems[0].title}</p>
                            </div>
                            <div className={"text-neutral-500"}>
                                <small>{newsItems[0].date.toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: true,
                                })}</small>
                            </div>
                            <div>
                                <a href={url} target={"_blank"}><ArrowTopRightOnSquareIcon className={"size-6"}/></a>
                            </div>
                        </div>
                    </Card>
                )
            })}
        </div>
    )
}

export default News;