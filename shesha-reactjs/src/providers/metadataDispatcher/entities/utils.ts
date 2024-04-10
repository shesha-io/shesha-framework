import { IAjaxResponse, IEntityMetadata } from "@/interfaces";
import { IEntityTypeIndentifier } from "../../sheshaApplication/publicApi/entities/models";
import { ICacheProvider, ISyncEntitiesContext, ModuleSyncRequest, SyncAllRequest, SyncAllResponse, isEntityOutOfDateResponse } from "./models";

const CACHE = {
    ENTITIES: 'entities',
    MISC: 'misc',
};

const NO_MODULE = '[no-module]';
const wrapModuleName = (name: string) => (name ?? NO_MODULE);
const unwrapModuleName = (name: string) => (name === NO_MODULE ? null : name);

const CURRENT_SYNC_VERSION = '1';
const ENTITIES_SYNC_VERSION_FIELD_NAME = "ENTITIES_SYNC_VERSION";

const URLS = {
    SYNC_ENTITIES: '/api/services/app/EntityConfig/SyncClientApi',
};

export const getEntityMetadataCacheKey = (id: IEntityTypeIndentifier) => {
    const moduleAccessor = wrapModuleName(id.module);
    return `${moduleAccessor}/${id.name}`;
};

const getEntitiesSyncVersion = async (cacheProvider: ICacheProvider): Promise<string> => {
    const cache = cacheProvider.getCache(CACHE.MISC);
    return cache.getItem<string>(ENTITIES_SYNC_VERSION_FIELD_NAME);
};

const setEntitiesSyncVersion = async (cacheProvider: ICacheProvider, value: string): Promise<string> => {
    const cache = cacheProvider.getCache(CACHE.MISC);
    return cache.setItem<string>(ENTITIES_SYNC_VERSION_FIELD_NAME, value);
};

const getEntitiesSyncRequest = async (context: ISyncEntitiesContext): Promise<SyncAllRequest> => {
    const modulesMap = new Map<string, ModuleSyncRequest>();
    const getModuleSyncRequest = (module: string) => {
        const key = unwrapModuleName(module);
        if (!modulesMap.has(key)) {
            modulesMap.set(key, {
                accessor: key,
                entities: []
            });
        }
        return modulesMap.get(key);
    };

    const metadataCache = context.cacheProvider.getCache(CACHE.ENTITIES);

    const savedVersion = await getEntitiesSyncVersion(context.cacheProvider);
    if (savedVersion === CURRENT_SYNC_VERSION){
        await metadataCache.iterate<IEntityMetadata, void>((metadata) => {
            if (!metadata.typeAccessor)
                return;
            const moduleSync = getModuleSyncRequest(metadata.moduleAccessor);
            
            const aliases = [...(metadata.aliases ?? []), metadata.entityType];
            aliases.forEach(alias => {
                context.typesMap.register(alias, {
                    module: metadata.moduleAccessor,
                    name: metadata.typeAccessor,
                });
            });
    
            moduleSync.entities.push({
                accessor: metadata.typeAccessor,
                md5: metadata.md5,
                modificationTime: metadata.changeTime,
            });
        });
    }
    await setEntitiesSyncVersion(context.cacheProvider, CURRENT_SYNC_VERSION);

    const request: SyncAllRequest = {
        modules: [],
    };
    modulesMap.forEach(m => request.modules.push(m));
    return request;
};

export const syncEntities = async (context: ISyncEntitiesContext): Promise<void> => {
    context.typesMap.clear();
    const request = await getEntitiesSyncRequest(context);

    await context.httpClient.post<IAjaxResponse<SyncAllResponse>>(URLS.SYNC_ENTITIES, request)
        .then((response) => {
            if (response.data?.success) {
                const promises: Promise<any>[] = [];
                const data = response.data.result;

                //console.groupCollapsed('Sync entities to cache');
                const metadataCache = context.cacheProvider.getCache(CACHE.ENTITIES);
                data.modules.forEach(m => {
                    m.entities.forEach(e => {
                        const key = getEntityMetadataCacheKey({ module: m.accessor, name: e.accessor });
                        //console.log(`  ${key}: ${e.status}`);

                        if (isEntityOutOfDateResponse(e)) {
                            const meta = {
                                ...e.metadata,
                                entityType: e.metadata.className, // todo: remove after refactoring
                                name: e.metadata.className, // todo: remove after refactoring
                            };                            

                            promises.push(metadataCache.setItem(key, meta));

                            const aliases = [...e.metadata.aliases ?? [], e.metadata.className];
                            aliases?.forEach((alias) => {
                                context.typesMap.register(alias, { module: m.accessor, name: e.accessor });
                            });
                            return;
                        }

                        if (e.status === 'unknown') {
                            promises.push(metadataCache.removeItem(key));
                            return;
                        }
                    });
                });
                //console.groupEnd();
                return Promise.all(promises).then();
            } else {
                console.error('Failed to sync entities', response.data?.error);
                return Promise.reject(response.data?.error ?? 'Failed to sync entities');
            }
        });
};

export const getEntityMetadata = async (accessor: IEntityTypeIndentifier, context: ISyncEntitiesContext): Promise<IEntityMetadata> => {
    await syncEntities(context);

    const key = getEntityMetadataCacheKey(accessor);
    return context.cacheProvider.getCache(CACHE.ENTITIES).getItem<IEntityMetadata>(key);
};

export const getCachedMetadataByTypeId = async (typeId: IEntityTypeIndentifier, context: ISyncEntitiesContext): Promise<IEntityMetadata> => {
    const key = getEntityMetadataCacheKey(typeId);
    return context.cacheProvider.getCache(CACHE.ENTITIES).getItem<IEntityMetadata>(key);
};

export const getCachedMetadataByClassName = async (className: string, context: ISyncEntitiesContext): Promise<IEntityMetadata> => {
    const typeId = context.typesMap.resolve(className);
    if (!typeId) {
        throw new Error(`Failed to resolve type id for class ${className}`);
    }
    const key = getEntityMetadataCacheKey(typeId);
    return context.cacheProvider.getCache(CACHE.ENTITIES).getItem<IEntityMetadata>(key);
};