import { ICacheProvider, IEntityMetadataFetcher } from "@/providers/metadataDispatcher/entities/models";
import { HttpClientApi } from "@/publicJsApis/httpClient";
import { EntitiesManager } from "./manager";
import { EntitiesModuleAccessor } from "./moduleAccessor";
import { createProxy } from "@/utils/proxy";

/**
 * Entities API. Provides settings to the entities groupped by modules.
 */
export class EntitiesApi {
  readonly _modules: Map<string, EntitiesModuleAccessor>;

  readonly _manager: EntitiesManager;

  getModuleEntities(name: string): EntitiesModuleAccessor {
    const existing = this._modules.get(name);
    if (existing)
      return existing;

    const moduleApi = new EntitiesModuleAccessor(this._manager, name);
    this._modules.set(name, moduleApi);
    return moduleApi;
  }

  constructor(httpClient: HttpClientApi, cacheProvider: ICacheProvider, metadataFetcher: IEntityMetadataFetcher) {
    this._manager = new EntitiesManager(httpClient, cacheProvider, metadataFetcher);
    this._modules = new Map<string, EntitiesModuleAccessor>();

    return createProxy<EntitiesApi>(this, {
      onGetProperty: (name: string) => this.getModuleEntities(name),
    });
  }
}
