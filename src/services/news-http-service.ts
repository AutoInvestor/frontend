import {BaseHttpService} from "@/services/base-http-service.ts";
import {NewsItem} from "@/model/NewsItem.ts";

export class NewsHttpService extends BaseHttpService {
    public constructor() {
        super();
    }

    public getNews(): Promise<NewsItem[]> {
        //return this.get<News[]>('/news');
        return Promise.resolve([
            { title: "Warren Buffett sells stocks for tenth quarter in a row", source: "Financial Times", date: new Date("2025-01-01T00:00:00.000Z"), link: "https://www.ft.com/content/abf10a12-4bdc-4f58-aed1-9a445cae166b" },
            { title: "Stock Market Bull Charges On, Question Is When It Meets the Bear", source: "Bloomberg", date: new Date("2025-01-01T00:00:00.000Z"), link: "https://www.bloomberg.com/news/articles/2025-05-03/stock-market-bull-charges-on-question-is-when-it-meets-the-bear" },
            { title: "Australia's Albanese claims election victory, riding anti-Trump wave", source: "Reuters", date: new Date("2025-01-01T00:00:00.000Z"), link: "https://www.reuters.com/world/asia-pacific/count-under-way-australia-election-with-living-costs-trump-focus-2025-05-03" },
        ]);
    }
}