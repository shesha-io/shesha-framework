import { MetadataDto } from "@/apis/metadata";
import { IEntityTypeIndentifier } from "@/providers/sheshaApplication/publicApi/entities/models";
import { HttpClientApi } from "@/providers/sheshaApplication/publicApi/http/api";

export type SyncStatus = 'uptodate' | 'unknown' | 'outofdate';

export interface EntitySyncRequest {
    accessor: string;
    md5: string;
    modificationTime: Date;
};

export interface ModuleSyncRequest {
    accessor: string;
    entities: EntitySyncRequest[];
}

export interface SyncAllRequest {
    modules: ModuleSyncRequest[];
}

export type EntityOutOfDateResponse = {
    accessor: string;
    status: Extract<SyncStatus, 'outofdate'>;
    metadata: MetadataDto; //IEntityMetadata;
};

export const isEntityOutOfDateResponse = (response: EntitySyncResponse): response is EntityOutOfDateResponse => {
    return (response as EntityOutOfDateResponse).status === 'outofdate';
};

export type EntitySyncResponse = EntityOutOfDateResponse | {
    accessor: string;
    status: Omit<SyncStatus, 'outofdate'>;
};

export interface ModuleSyncResponse {
    accessor: string;
    status: SyncStatus;
    entities?: EntitySyncResponse[];
}

export interface SyncAllResponse {
    modules: ModuleSyncResponse[];
}

export interface ICacheProvider {
    getCache: (name: string) => ICache;
}

export interface ICache {
    getItem<T>(key: string, callback?: (err: any, value: T | null) => void): Promise<T | null>;
    setItem<T>(key: string, value: T, callback?: (err: any, value: T) => void): Promise<T>;
    iterate<T, U>(iteratee: (value: T, key: string, iterationNumber: number) => U, callback?: (err: any, result: U) => void): Promise<U>;
    removeItem(key: string, callback?: (err: any) => void): Promise<void>;
}

export interface EntityTypesMap {
    resolve: (className: string) => IEntityTypeIndentifier;
    register: (className: string, accessor: IEntityTypeIndentifier) => void;
    clear: () => void;
}

export interface ISyncEntitiesContext {
    cacheProvider: ICacheProvider;
    httpClient: HttpClientApi;
    typesMap: EntityTypesMap;
}