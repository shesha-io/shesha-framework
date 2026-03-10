import { MetadataDto } from "@/apis/metadata";
import { FormIdentifier, IEntityMetadata, IReferenceListIdentifier } from "@/interfaces";
import { IConfigurationLoader } from "@/providers/configurationItemsLoader/configurationLoader";
import { IEntityTypeIdentifier } from "@/providers/sheshaApplication/publicApi/entities/models";
import { HttpClientApi } from "@/publicJsApis/httpClient";

export type SyncStatus = 'uptodate' | 'unknown' | 'outofdate';

export enum ConfigurationType {
  ReferenceList = 'reference-list',
  Form = 'form',
  Entity = 'entity',
}

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
  resolve: (className: string) => IEntityTypeIdentifier | undefined;
  identifierExists: (model: IEntityTypeIdentifier) => boolean;
  register: (className: string, accessor: IEntityTypeIdentifier) => void;
  clear: () => void;
}

export interface ISyncEntitiesContext {
  cacheProvider: ICacheProvider;
  httpClient: HttpClientApi;
  typesMap: IEntityTypesMap;
  configurationItemsLoader: IConfigurationLoader;
}

export interface IEntityMetadataFetcher {
  syncAll: () => Promise<void>;
  getByTypeId: (typeId: IEntityTypeIdentifier) => Promise<IEntityMetadata | null>;
  getByClassName: (className: string) => Promise<IEntityMetadata | null>;
  getByEntityType: (entityType: string | IEntityTypeIdentifier) => Promise<IEntityMetadata | null>;
  isEntity: (modelType: string | IEntityTypeIdentifier) => Promise<boolean>;
}

export interface IGetFormPayload {
  formId: FormIdentifier;
  skipCache: boolean;
}

export interface IGetRefListPayload {
  refListId: IReferenceListIdentifier;
  skipCache: boolean;
}
