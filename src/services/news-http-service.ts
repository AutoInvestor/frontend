import {BaseHttpService} from "@/services/base-http-service.ts";
import {NewsItem} from "@/model/NewsItem.ts";
import z, {ZodType} from "zod/v4";

export class NewsHttpService extends BaseHttpService {
    private static Schema: ZodType<NewsItem> = z.object({
        title: z.string(),
        date: z.coerce.date(),
        url: z.string(),
        assetId: z.string(),
    })

    public constructor() {
        super();
    }

    public getNews(): Promise<NewsItem[]> {
        return this.get<NewsItem[]>('/news', z.array(NewsHttpService.Schema));
    }
}