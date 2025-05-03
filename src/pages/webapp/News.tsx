import {useEffect, useState} from "react";
import {ArrowTopRightOnSquareIcon, NewspaperIcon} from "@heroicons/react/16/solid";
import {NewsHttpService} from "@/services/news-http-service.ts";
import {NewsItem} from "@/model/NewsItem.ts";

const newsHttpService = new NewsHttpService();

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

    useEffect(() => {
        newsHttpService.getNews()
            .then(setNewsItems)
            .catch(err => console.error('Error fetching alerts:', err));
    }, [])

    return (
        <div className={"flex gap-y-4 flex-col"}>
            {newsItems.map((alert) => {
                return (
                    <div className={"flex flex-row gap-4 items-center"}>
                        <div className={"rounded-xl bg-neutral-100 w-fit box-border p-3"}>
                            <NewspaperIcon className={"size-6"}/>
                        </div>
                        <div className={"flex-1"}>
                            <p>{alert.source}</p>
                            <p className={"font-light text-neutral-500 pt-1"}>{alert.title}</p>
                        </div>
                        <div className={"text-neutral-500"}>
                            <small>{alert.date.toDateString()}</small>
                        </div>
                        <div>
                            <a href={alert.link} target={"_blank"}><ArrowTopRightOnSquareIcon className={"size-6"}/></a>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default News;