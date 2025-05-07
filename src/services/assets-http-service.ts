import {BaseHttpService} from "@/services/base-http-service.ts";
import {Asset, AssetPriceData} from "@/model/Asset.ts";

export class AssetsHttpService extends BaseHttpService {
    public constructor() {
        super();
    }

    public getAsset(assetId: string): Promise<Asset> {
        // return this.get<Asset>(`/assets/${assetId}`);
        if (assetId === '3abacf7a-4d9d-422c-babe-d53e521378e4') {
            return Promise.resolve({assetId: '3abacf7a-4d9d-422c-babe-d53e521378e4', mic: 'XNAS', ticker: 'APPL'});
        }
        if (assetId === '96dd1bde-2ce8-49eb-8399-093af843b84a') {
            return Promise.resolve({assetId: '96dd1bde-2ce8-49eb-8399-093af843b84a', mic: 'XNAS', ticker: 'AMZN'});
        }
        if (assetId === '8f7549de-b142-4160-aa6b-cbbdc82a2546') {
            return Promise.resolve({assetId: '8f7549de-b142-4160-aa6b-cbbdc82a2546', mic: 'XNAS', ticker: 'IDTX'});
        }
        if (assetId === 'c0444ffc-73cb-4226-bf89-add6ab8f17b0') {
            return Promise.resolve({assetId: 'c0444ffc-73cb-4226-bf89-add6ab8f17b0', mic: 'XNAS', ticker: 'INTL'});
        }
        if (assetId === '6dfa3dc4-9b46-4195-a3a0-2039ea6f31b7') {
            return Promise.resolve({assetId: '6dfa3dc4-9b46-4195-a3a0-2039ea6f31b7', mic: 'BME', ticker: 'TEF'});
        }
        throw 'Error';
    }

    private getRandomInt(min: number, max: number): number {
        const lower = Math.ceil(min);
        const upper = Math.floor(max);
        return Math.floor(Math.random() * (upper - lower + 1)) + lower;
    }

    public getPrice(assetId: string, at: Date): Promise<AssetPriceData> {
        //return this.get<AssetPriceData>(`/assets/${assetId}/price?at=${at.toISOString()}`);
        console.log(assetId); // In order to avoid 'unused' error -> remove when unmocked
        return Promise.resolve({date: at, price: this.getRandomInt(4, 8)});
    }

    public getAllAssets() {
        //return this.get<Asset[]>('/assets');
        return Promise.resolve([
            {assetId: 'c0444ffc-73cb-4226-bf89-add6ab8f17b0', mic: 'XNAS', ticker: 'INTL'},
            {assetId: '8f7549de-b142-4160-aa6b-cbbdc82a2546', mic: 'XNAS', ticker: 'IDTX'},
            {assetId: '6dfa3dc4-9b46-4195-a3a0-2039ea6f31b7', mic: 'BME', ticker: 'TEF'},
            {assetId: '96dd1bde-2ce8-49eb-8399-093af843b84a', mic: 'XNAS', ticker: 'AMZN'},
            {assetId: '3abacf7a-4d9d-422c-babe-d53e521378e4', mic: 'XNAS', ticker: 'APPL'},
        ]);
    }
}