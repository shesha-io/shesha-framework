import { IApiEndpoint, StandardEntityActions } from "@/interfaces/metadata";
import { HttpClientApi } from "@/publicJsApis/httpClient";
import { EntityConfigurationDto, IEntity, IEntityTypeIndentifier } from "./models";
import { IAjaxResponse, IEntityMetadata } from "@/interfaces";
import { ICacheProvider, IEntityMetadataFetcher } from "@/providers/metadataDispatcher/entities/models";
import qs from "qs";

import { IEntityEndpoints } from "./entityTypeAccessor";

export const ENTITIES_URLS = {
  GET_CONFIGURATIONS: '/api/services/app/EntityConfig/GetClientApiConfigurations',
};

export class EntitiesManager {
  readonly _httpClient: HttpClientApi;

  readonly _cacheProvider: ICacheProvider;

  readonly _metadataFetcher: IEntityMetadataFetcher;

  static #configurationsPromise: Promise<EntityConfigurationDto[]> = undefined;

  getApiEndpointsAsync = async (typeAccessor: IEntityTypeIndentifier): Promise<IEntityEndpoints> => {
    const meta = await this.#resolveEntityTypeAsync(typeAccessor);
    if (!meta?.apiEndpoints)
      throw new Error("Failed to get endpoints");

    return meta.apiEndpoints;
  };

  createEntityAsync = async <TId, TEntity extends IEntity<TId>>(typeAccessor: IEntityTypeIndentifier, value: TEntity): Promise<TEntity> => {
    const meta = await this.#resolveEntityTypeAsync(typeAccessor);
    const endpoint = this.#getApiEndpoint(meta, StandardEntityActions.create);

    const response = await this._httpClient.post<IAjaxResponse<TEntity>>(endpoint.url, value);
    if (response.status !== 200 || !response.data.success)
      throw new Error(`Failed to create entity '${typeAccessor.module}.${typeAccessor.name}'`);

    return response.data.result;
  };

  getEntityAsync = async <TId, TEntity extends IEntity<TId>>(typeAccessor: IEntityTypeIndentifier, id: TId): Promise<TEntity> => {
    const meta = await this.#resolveEntityTypeAsync(typeAccessor);
    const endpoint = this.#getApiEndpoint(meta, StandardEntityActions.read);

    const requestParams = { id: id };
    const url = `${endpoint.url}?${qs.stringify(requestParams)}`;
    const response = await this._httpClient.get<IAjaxResponse<TEntity>>(url);
    if (response.status !== 200 || !response.data.success)
      throw new Error(`Failed to get entity '${typeAccessor.module}.${typeAccessor.name}' by id ${id}`);

    return response.data.result;
  };

  updateEntityAsync = async <TId, TEntity extends IEntity<TId>>(typeAccessor: IEntityTypeIndentifier, value: TEntity): Promise<TEntity> => {
    const meta = await this.#resolveEntityTypeAsync(typeAccessor);
    const endpoint = this.#getApiEndpoint(meta, StandardEntityActions.update);

    const requestParams = { id: value.id };
    const url = `${endpoint.url}?${qs.stringify(requestParams)}`;
    const response = await this._httpClient.put<IAjaxResponse<TEntity>>(url, value);
    if (response.status !== 200 || !response.data.success)
      throw new Error(`Failed to update entity '${typeAccessor.module}.${typeAccessor.name}' by id ${value.id}`);

    return response.data.result;
  };

  deleteEntityAsync = async <TId>(typeAccessor: IEntityTypeIndentifier, id: TId): Promise<void> => {
    const meta = await this.#resolveEntityTypeAsync(typeAccessor);
    const endpoint = this.#getApiEndpoint(meta, StandardEntityActions.delete);

    const requestParams = { id: id };
    const url = `${endpoint.url}?${qs.stringify(requestParams)}`;
    const response = await this._httpClient.delete<IAjaxResponse<void>>(url);
    if (response.status !== 200 || !response.data.success)
      throw new Error(`Failed to delete entity '${typeAccessor.module}.${typeAccessor.name}' by id ${id}`);
  };

  #getApiEndpoint = (meta: IEntityMetadata, action: StandardEntityActions): IApiEndpoint => {
    return meta.apiEndpoints[action];
  };

  #resolveEntityTypeAsync = (typeId: IEntityTypeIndentifier): Promise<IEntityMetadata> => {
    return this._metadataFetcher.getByTypeId(typeId);
  };

  constructor(httpClient: HttpClientApi, cacheProvider: ICacheProvider, metadataFetcher: IEntityMetadataFetcher) {
    this._httpClient = httpClient;
    this._cacheProvider = cacheProvider;
    this._metadataFetcher = metadataFetcher;
  }

  static fetchConfigurationsAsync = (httpClient: HttpClientApi): Promise<EntityConfigurationDto[]> => {
    if (this.#configurationsPromise)
      return this.#configurationsPromise;

    this.#configurationsPromise = httpClient.get<IAjaxResponse<EntityConfigurationDto[]>>(ENTITIES_URLS.GET_CONFIGURATIONS)
      .then((res) => {
        const result = res.data.success ? res.data.result : [];
        return result;
      });
    return this.#configurationsPromise;
  };
}
