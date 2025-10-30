import { MetadataDto } from "@/apis/metadata";
import { IEntityMetadata } from "@/interfaces";
import { IConfigurationItemsLoaderActionsContext } from "@/providers/configurationItemsLoader/contexts";
import { IEntityTypeIndentifier } from "@/providers/sheshaApplication/publicApi/entities/models";
import { HttpClientApi } from "@/publicJsApis/httpClient";

export type SyncStatus = 'uptodate' | 'unknown' | 'outofdate';

export interface EntitySyncRequest {
  accessor: string;
  md5: string;
  modificationTime: Date;
};

export interface ModuleSyncRequest {
  accessor: string | null;
  entities: EntitySyncRequest[];
}

export interface SyncAllRequest {
  modules: ModuleSyncRequest[];
}

export type EntityOutOfDateResponse = {
  accessor: string;
  status: Extract<SyncStatus, 'outofdate'>;
  metadata: MetadataDto;
};

export const isEntityOutOfDateResponse = (response: EntitySyncResponse): response is EntityOutOfDateResponse => {
  return response.status === 'outofdate';
};

export type EntitySyncResponse = EntityOutOfDateResponse | {
  accessor: string;
  status: Omit<SyncStatus, 'outofdate'>;
};

export interface ModuleSyncResponse {
  accessor: string;
  status: SyncStatus;
  entities: EntitySyncResponse[];
}

export interface LookupItemSyncResponse {
  module: string;
  match: string;
}

export interface LookupSyncResponse {
  id?: string;
  aliases?: string[];
  module?: string;
  name?: string;
  items: LookupItemSyncResponse[];
}

export interface SyncAllResponse {
  modules: ModuleSyncResponse[];
  lookups: LookupSyncResponse[];
}

export interface ICacheProvider {
  getCache: (name: string) => ICache;
}

export interface ICache {
  getItem<T>(key: string, callback?: (err: unknown, value: T | null) => void): Promise<T | null>;
  setItem<T>(key: string, value: T, callback?: (err: unknown, value: T) => void): Promise<T>;
  iterate<T, U>(iteratee: (value: T, key: string, iterationNumber: number) => U, callback?: (err: unknown, result: U) => void): Promise<U>;
  removeItem(key: string, callback?: (err: unknown) => void): Promise<void>;
  clear(callback?: (err?: unknown) => void): Promise<void>;
}

export interface IEntityTypesMap {
  resolve: (className: string) => IEntityTypeIndentifier | undefined;
  register: (className: string, accessor: IEntityTypeIndentifier) => void;
  clear: () => void;
}

export interface ISyncEntitiesContext {
  cacheProvider: ICacheProvider;
  httpClient: HttpClientApi;
  typesMap: IEntityTypesMap;
  configurationItemsLoader: IConfigurationItemsLoaderActionsContext;
}

export interface IEntityMetadataFetcher {
  syncAll: () => Promise<void>;
  getByTypeId: (typeId: IEntityTypeIndentifier) => Promise<IEntityMetadata | null>;
  getByClassName: (className: string) => Promise<IEntityMetadata | null>;
  isEntity: (className: string) => Promise<boolean>;
}
