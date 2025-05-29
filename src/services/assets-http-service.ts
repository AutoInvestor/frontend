import {BaseHttpService} from "@/services/base-http-service.ts";
import {Asset, AssetPriceData} from "@/model/Asset.ts";
import z, {ZodType} from "zod/v4";

export class AssetsHttpService extends BaseHttpService {
    private static Schema: ZodType<Asset> = z.object({
        assetId: z.string(),
        ticker: z.string(),
        mic: z.string(),
    })

    private static SchemaPriceData: ZodType<AssetPriceData> = z.object({
        date: z.coerce.date(),
        price: z.number(),
    })

    public constructor() {
        super();
    }

    public getAsset(assetId: string): Promise<Asset> {
        return this.get<Asset>(`/assets/${assetId}`, AssetsHttpService.Schema);
    }

    public getPrice(assetId: string, at: Date): Promise<AssetPriceData> {
        return this.get<AssetPriceData>(`/assets/${assetId}/price?at=${at.toISOString()}`, AssetsHttpService.SchemaPriceData);
    }

    public getAllAssets(): Promise<Asset[]> {
        return this.get<Asset[]>('/assets', z.array(AssetsHttpService.Schema));
    }
}