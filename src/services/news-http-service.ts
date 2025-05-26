import {BaseHttpService} from "@/services/base-http-service.ts";
import {NewsItem} from "@/model/NewsItem.ts";

export class NewsHttpService extends BaseHttpService {
    public constructor() {
        super();
    }

    public getNews(): Promise<NewsItem[]> {
        return this.get<NewsItem[]>('/news');
    }
}