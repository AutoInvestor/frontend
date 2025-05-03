import {BaseHttpService} from "@/services/base-http-service.ts";
import {Asset} from "@/model/Asset.ts";

export class AssetsHttpService extends BaseHttpService {
    public constructor() {
        super();
    }

    public getAsset(assetId: string): Promise<Asset> {
        // return this.get<Asset>(`/assets/${assetId}?price=true`);
        if (assetId === '3abacf7a-4d9d-422c-babe-d53e521378e4') {
            return Promise.resolve({ assetId: '3abacf7a-4d9d-422c-babe-d53e521378e4', mic: 'XNAS', ticker: 'APPL', price: 14523 });
        }
        if (assetId === '96dd1bde-2ce8-49eb-8399-093af843b84a') {
            return Promise.resolve({ assetId: '96dd1bde-2ce8-49eb-8399-093af843b84a', mic: 'XNAS', ticker: 'AMZN', price: 2134 });
        }
        if (assetId ==='8f7549de-b142-4160-aa6b-cbbdc82a2546' ) {
            return Promise.resolve({ assetId: '8f7549de-b142-4160-aa6b-cbbdc82a2546', mic: 'XNAS', ticker: 'IDTX', price: 6545 });
        }
        if (assetId === 'c0444ffc-73cb-4226-bf89-add6ab8f17b0') {
            return Promise.resolve({ assetId: 'c0444ffc-73cb-4226-bf89-add6ab8f17b0', mic: 'XNAS', ticker: 'INTL', price: 256 });
        }
        if (assetId === '6dfa3dc4-9b46-4195-a3a0-2039ea6f31b7') {
            return Promise.resolve({ assetId: '6dfa3dc4-9b46-4195-a3a0-2039ea6f31b7', mic: 'BME', ticker: 'TEF', price: 413 });
        }
        throw 'Error';
    }

    public getAllAssets() {
        //return this.get<Asset[]>('/assets');
        return Promise.resolve([
            { assetId: 'c0444ffc-73cb-4226-bf89-add6ab8f17b0', mic: 'XNAS', ticker: 'INTL' },
            { assetId: '8f7549de-b142-4160-aa6b-cbbdc82a2546', mic: 'XNAS', ticker: 'IDTX' },
            { assetId: '6dfa3dc4-9b46-4195-a3a0-2039ea6f31b7', mic: 'BME', ticker: 'TEF' },
            { assetId: '96dd1bde-2ce8-49eb-8399-093af843b84a', mic: 'XNAS', ticker: 'AMZN' },
            { assetId: '3abacf7a-4d9d-422c-babe-d53e521378e4', mic: 'XNAS', ticker: 'APPL' },
        ]);
    }
}