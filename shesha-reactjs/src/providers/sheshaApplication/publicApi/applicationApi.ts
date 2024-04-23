import { CurrentUserApi, IInternalCurrentUserApi } from './currentUser/api';
import { ISettingsApi, SettingsApi } from './settings/api';
import { HttpClientApi } from './http/api';
import { EntitiesApi, IEntitiesApi } from './entities/api';
import { ICacheProvider } from '@/providers/metadataDispatcher/entities/models';
import { IEntityMetadataFetcher } from '@/providers/metadataDispatcher/entities/useEntityMetadataFetcher';

export interface IApplicationPlugin {
    name: string;
    data: any;
}

export interface IApplicationApi {
    user: IInternalCurrentUserApi;
    settings: ISettingsApi;
    entities: IEntitiesApi;

    addPlugin: (plugin: IApplicationPlugin) => void;
    removePlugin: (pluginName: string) => void;
}

export class ApplicationApi implements IApplicationApi {
    public user: IInternalCurrentUserApi;
    public settings: ISettingsApi;
    public entities: IEntitiesApi;
    readonly #httpClient: HttpClientApi;
    readonly #plugins: Map<string, IApplicationPlugin>;

    constructor(httpClient: HttpClientApi, cacheProvider: ICacheProvider, metadataFetcher: IEntityMetadataFetcher) {
        this.#plugins = new Map<string, IApplicationPlugin>();

        this.#httpClient = httpClient;
        this.user = new CurrentUserApi(this.#httpClient);
        this.settings = new SettingsApi(this.#httpClient);
        this.entities = new EntitiesApi(this.#httpClient, cacheProvider, metadataFetcher);
    }

    addPlugin(plugin: IApplicationPlugin) {
        if (this.#plugins.has(plugin.name))
            throw new Error(`Plugin with name '${plugin.name}' already registered`);
        this.#plugins.set(plugin.name, plugin);

        Object.defineProperty(this, plugin.name, {
            get() {
                return plugin.data;
            }
        });
    }

    removePlugin(pluginName: string) {
        if (!this.#plugins.has(pluginName))
            throw new Error(`Plugin with name '${pluginName}' is not registered`);

        this.#plugins.delete(pluginName);
        delete this[pluginName];
    }
}