import {BaseHttpService} from "@/services/base-http-service.ts";
import {Asset, AssetPriceData} from "@/model/Asset.ts";

export class AssetsHttpService extends BaseHttpService {
    public constructor() {
        super();
    }

    public getAsset(assetId: string): Promise<Asset> {
        return this.get<Asset>(`/assets/${assetId}`);
    }

    public getPrice(assetId: string, at: Date): Promise<AssetPriceData> {
        return this.get<AssetPriceData>(`/assets/${assetId}/price?at=${at.toISOString()}`);
    }

    public getAllAssets() {
        return this.get<Asset[]>('/assets');
    }
}