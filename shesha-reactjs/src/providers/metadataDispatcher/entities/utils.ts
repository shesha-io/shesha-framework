import { IAjaxResponse, IEntityMetadata } from "@/interfaces";
import { IEntityTypeIndentifier } from "../../sheshaApplication/publicApi/entities/models";
import { ICacheProvider, ISyncEntitiesContext, ModuleSyncRequest, SyncAllRequest, SyncAllResponse, isEntityOutOfDateResponse } from "./models";
import { isAjaxSuccessResponse } from "@/interfaces/ajaxResponse";

const CACHE = {
  ENTITIES: 'entities',
  MISC: 'misc',
};

const NO_MODULE = '[no-module]';
const wrapModuleName = (name?: string | null): string => (name ?? NO_MODULE);
const unwrapModuleName = (name: string | null): string | null => (name === NO_MODULE ? null : name);

const CURRENT_SYNC_VERSION = '2';
const ENTITIES_SYNC_VERSION_FIELD_NAME = "ENTITIES_SYNC_VERSION";

const URLS = {
  SYNC_ENTITIES: '/api/services/app/EntityConfig/SyncClientApi',
};

export const getEntityMetadataCacheKey = (id: IEntityTypeIndentifier): string => {
  const moduleAccessor = wrapModuleName(id.module);
  return `${moduleAccessor}/${id.name}`;
};

const getEntitiesSyncVersion = (cacheProvider: ICacheProvider): Promise<string | null> => {
  const cache = cacheProvider.getCache(CACHE.MISC);
  return cache.getItem<string>(ENTITIES_SYNC_VERSION_FIELD_NAME);
};

const setEntitiesSyncVersion = (cacheProvider: ICacheProvider, value: string): Promise<string> => {
  const cache = cacheProvider.getCache(CACHE.MISC);
  return cache.setItem<string>(ENTITIES_SYNC_VERSION_FIELD_NAME, value);
};

const getEntitiesSyncRequest = async (context: ISyncEntitiesContext): Promise<SyncAllRequest> => {
  const modulesMap = new Map<string | null, ModuleSyncRequest>();
  const getModuleSyncRequest = (module: string | null): ModuleSyncRequest => {
    const key = unwrapModuleName(module);
    const existingRequest = modulesMap.get(key);
    if (existingRequest) {
      return existingRequest;
    } else {
      const newRequest = {
        accessor: key,
        entities: [],
      };
      modulesMap.set(key, newRequest);
      return newRequest;
    }
  };

  const metadataCache = context.cacheProvider.getCache(CACHE.ENTITIES);

  const savedVersion = await getEntitiesSyncVersion(context.cacheProvider);
  if (savedVersion === CURRENT_SYNC_VERSION) {
    await metadataCache.iterate<IEntityMetadata, void>((metadata) => {
      const { typeAccessor } = metadata;
      if (!typeAccessor)
        return;
      const moduleSync = getModuleSyncRequest(metadata.moduleAccessor);

      const aliases = [...(metadata.aliases ?? []), metadata.entityType];
      aliases.forEach((alias) => {
        context.typesMap.register(alias, {
          module: metadata.moduleAccessor,
          name: typeAccessor,
        });
      });

      moduleSync.entities.push({
        accessor: typeAccessor,
        md5: metadata.md5 ?? "",
        modificationTime: metadata.changeTime ?? new Date(),
      });
    });
  }
  await setEntitiesSyncVersion(context.cacheProvider, CURRENT_SYNC_VERSION);

  const request: SyncAllRequest = {
    modules: [],
  };
  modulesMap.forEach((m) => request.modules.push(m));
  return request;
};

export const syncEntities = async (context: ISyncEntitiesContext): Promise<void> => {
  context.typesMap.clear();
  const request = await getEntitiesSyncRequest(context);

  await context.httpClient.post<IAjaxResponse<SyncAllResponse>>(URLS.SYNC_ENTITIES, request)
    .then((response) => {
      if (isAjaxSuccessResponse(response.data)) {
        const promises: Promise<unknown>[] = [];
        const data = response.data.result;

        const metadataCache = context.cacheProvider.getCache(CACHE.ENTITIES);
        data.modules.forEach((m) => {
          m.entities.forEach((e) => {
            const key = getEntityMetadataCacheKey({ module: m.accessor, name: e.accessor });

            if (isEntityOutOfDateResponse(e)) {
              const meta = {
                ...e.metadata,
                entityType: e.metadata.className, // TODO: remove after refactoring
                name: e.metadata.className, // TODO: remove after refactoring
              };

              promises.push(metadataCache.setItem(key, meta));

              const aliases = [...e.metadata.aliases ?? [], e.metadata.className];
              aliases.forEach((alias) => {
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
        return Promise.all(promises).then();
      } else {
        console.error('Failed to sync entities', response.data.error);
        return Promise.reject(response.data.error);
      }
    });
};

export const getEntityMetadata = async (accessor: IEntityTypeIndentifier, context: ISyncEntitiesContext): Promise<IEntityMetadata | null> => {
  await syncEntities(context);

  const key = getEntityMetadataCacheKey(accessor);
  return context.cacheProvider.getCache(CACHE.ENTITIES).getItem<IEntityMetadata>(key);
};

export const getCachedMetadataByTypeId = (typeId: IEntityTypeIndentifier, context: ISyncEntitiesContext): Promise<IEntityMetadata | null> => {
  const key = getEntityMetadataCacheKey(typeId);
  return context.cacheProvider.getCache(CACHE.ENTITIES).getItem<IEntityMetadata>(key);
};

export const getCachedMetadataByClassName = (className: string, context: ISyncEntitiesContext): Promise<IEntityMetadata | null> => {
  const typeId = context.typesMap.resolve(className);
  if (!typeId) {
    throw new Error(`Failed to resolve type id for class ${className}`);
  }
  const key = getEntityMetadataCacheKey(typeId);
  return context.cacheProvider.getCache(CACHE.ENTITIES).getItem<IEntityMetadata>(key);
};
