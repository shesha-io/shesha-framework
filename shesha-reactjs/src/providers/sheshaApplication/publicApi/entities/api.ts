import { ICacheProvider, IEntityMetadataFetcher } from "@/providers/metadataDispatcher/entities/models";
import { HttpClientApi } from "@/publicJsApis/httpClient";
import { EntitiesManager } from "./manager";
import { EntitiesModuleAccessor } from "./moduleAccessor";

/**
 * Entities API. Provides settings to the entities groupped by modules.
 */
export class EntitiesApi {
  readonly _modules: Map<string, EntitiesModuleAccessor>;

  readonly _manager: EntitiesManager;

  getModuleEntities(name: string): EntitiesModuleAccessor {
    if (this._modules.has(name))
      return this._modules.get(name);

    const moduleApi = new EntitiesModuleAccessor(this._manager, name);
    this._modules.set(name, moduleApi);
    return moduleApi;
  }

  constructor(httpClient: HttpClientApi, cacheProvider: ICacheProvider, metadataFetcher: IEntityMetadataFetcher) {
    this._manager = new EntitiesManager(httpClient, cacheProvider, metadataFetcher);
    this._modules = new Map<string, EntitiesModuleAccessor>();

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
      },
    });
  }
}
