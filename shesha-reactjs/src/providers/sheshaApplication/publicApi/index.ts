import { CurrentUserApi, IInternalCurrentUserApi } from './currentUser/api';
import { ISettingsApi, SettingsApi } from './settings/api';
import { HttpClientApi } from './http/api';
import { EntitiesApi, IEntitiesApi } from './entities/api';
import { ICacheProvider } from '@/providers/metadataDispatcher/entities/models';
import { IEntityMetadataFetcher } from '@/providers/metadataDispatcher/entities/useEntityMetadataFetcher';

export interface IApplicationContext {
    user: IInternalCurrentUserApi;
    settings: ISettingsApi;
}

export class ApplicationContext implements IApplicationContext {
    public user: IInternalCurrentUserApi;
    public settings: ISettingsApi;
    public entities: IEntitiesApi;
    readonly _httpClient: HttpClientApi;

    constructor(httpClient: HttpClientApi, cacheProvider: ICacheProvider, metadataFetcher: IEntityMetadataFetcher) {
        this._httpClient = httpClient;
        this.user = new CurrentUserApi(this._httpClient);
        this.settings = new SettingsApi(this._httpClient);
        this.entities = new EntitiesApi(this._httpClient, cacheProvider, metadataFetcher);
    }
}