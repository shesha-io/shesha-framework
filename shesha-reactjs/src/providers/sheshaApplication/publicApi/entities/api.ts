import { ICacheProvider } from "@/providers/metadataDispatcher/entities/models";
import { HttpClientApi } from "../http/api";
import { EntitiesManager } from "./manager";
import { IEntitiesModuleAccessor, EntitiesModuleAccessor } from "./moduleAccessor";
import { IEntityMetadataFetcher } from "@/providers/metadataDispatcher/entities/useEntityMetadataFetcher";

export interface IEntitiesApi {

}

/**
 * Entities API. Provides settings to the entities groupped by modules.
 */
export class EntitiesApi implements IEntitiesApi {
    readonly _modules: Map<string, IEntitiesModuleAccessor>;
    readonly _manager: EntitiesManager;

    getModuleEntities(name: string): IEntitiesModuleAccessor {
        if (this._modules.has(name))
            return this._modules.get(name);

        const moduleApi = new EntitiesModuleAccessor(this._manager, name);
        this._modules.set(name, moduleApi);
        return moduleApi;
    }

    constructor(httpClient: HttpClientApi, cacheProvider: ICacheProvider, metadataFetcher: IEntityMetadataFetcher) {
        this._manager = new EntitiesManager(httpClient, cacheProvider, metadataFetcher);
        this._modules = new Map<string, IEntitiesModuleAccessor>();

        return new Proxy(this, {
            get(target, name) {
                if (name in target) {
                    const result = target[name];
                    return typeof result === 'function' ? result.bind(target) : result;
                }

                return typeof (name) === 'string'
                    ? target.getModuleEntities(name)
                    : undefined;
            },

            set(target, name, value) {
                if (name in target) {
                    target[name] = value;
                    return true;
                }
                return false;
            }
        });
    }
}