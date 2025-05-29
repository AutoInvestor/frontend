import {useEffect, useState} from "react";
import {ArrowTopRightOnSquareIcon, NewspaperIcon} from "@heroicons/react/16/solid";
import {NewsHttpService} from "@/services/news-http-service.ts";
import {NewsItem} from "@/model/NewsItem.ts";
import {AssetsHttpService} from "@/services/assets-http-service.ts";
import {Asset} from "@/model/Asset.ts";
import {Badge} from "@/components/ui/badge.tsx";

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
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);

    useEffect(() => {
        async function fetchData() {
            const newsItems = await newsHttpService.getNews();
            const distinctAssetIds = [...new Set(newsItems.map(item => item.assetId))];
            const assets = await Promise.all(distinctAssetIds.map(assetsHttpService.getAsset));
            setNewsItems(newsItems);
            setAssets(assets);
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
            {newsItems.map((newsItem) => {
                return (
                    <div className={"flex flex-row gap-4 items-center"}>
                        <div className={"rounded-xl bg-neutral-100 w-fit box-border p-3"}>
                            <NewspaperIcon className={"size-6"}/>
                        </div>
                        <div className={"flex-1"}>
                            <p>
                                <Badge variant="outline">
                                    <span className={'text-neutral-400'}>{getAsset(newsItem.assetId).mic}</span>
                                    <span className="ps-0.5 font-medium">{getAsset(newsItem.assetId).ticker}</span>
                                </Badge>
                            </p>
                            <p className={"font-light-500 pt-1"}>{newsItem.title}</p>
                        </div>
                        <div className={"text-neutral-500"}>
                            <small>{newsItem.date.toLocaleString('en-US', {
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
                            <a href={newsItem.url} target={"_blank"}><ArrowTopRightOnSquareIcon className={"size-6"}/></a>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default News;