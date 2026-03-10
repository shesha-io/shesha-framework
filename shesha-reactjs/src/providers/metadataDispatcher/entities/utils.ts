import { IAjaxResponse, IEntityMetadata } from "@/interfaces";
import { IEntityTypeIdentifier } from "../../sheshaApplication/publicApi/entities/models";
import { ICacheProvider, ISyncEntitiesContext, ModuleSyncRequest, SyncAllRequest, SyncAllResponse, isEntityOutOfDateResponse } from "./models";
import { isAjaxSuccessResponse } from "@/interfaces/ajaxResponse";
import { IConfigurationItemDto } from "@/providers/configurationItemsLoader/models";
import { IEntityTypeIdentifierQueryParams, IPropertyMetadata } from "@/interfaces/metadata";

export const ENTITY_CACHE = {
  ENTITIES: 'entity',
  ENTITIES_LOOKUP: 'entity_lookup',
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

export const getEntityMetadataCacheKey = (id: IEntityTypeIdentifier): string => {
  const moduleAccessor = wrapModuleName(id.module);
  return `${moduleAccessor}:${id.name}`;
};

const getEntitiesSyncVersion = (cacheProvider: ICacheProvider): Promise<string | null> => {
  const cache = cacheProvider.getCache(ENTITY_CACHE.MISC);
  return cache.getItem<string>(ENTITIES_SYNC_VERSION_FIELD_NAME);
};

const setEntitiesSyncVersion = (cacheProvider: ICacheProvider, value: string): Promise<string> => {
  const cache = cacheProvider.getCache(ENTITY_CACHE.MISC);
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

  const metadataCache = context.cacheProvider.getCache(ENTITY_CACHE.ENTITIES);

  const savedVersion = await getEntitiesSyncVersion(context.cacheProvider);
  if (savedVersion === CURRENT_SYNC_VERSION) {
    await metadataCache.iterate<IConfigurationItemDto<IEntityMetadata>, void>((item) => {
      const metadata = item.configuration;
      const { name } = metadata;
      if (!name)
        return;
      const moduleSync = getModuleSyncRequest(metadata.module);

      const aliases = [...(metadata.aliases ?? []), metadata.fullClassName];
      aliases.forEach((alias) => {
        context.typesMap.register(alias, { module: metadata.module, name: metadata.name });
      });

      moduleSync.entities.push({
        accessor: name,
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
    .then(async (response) => {
      if (isAjaxSuccessResponse(response.data)) {
        const promises: Promise<unknown>[] = [];
        const data = response.data.result;

        const metadataCache = context.cacheProvider.getCache(ENTITY_CACHE.ENTITIES);
        data.modules.forEach((m) => {
          m.entities.forEach((e) => {
            const key = getEntityMetadataCacheKey({ module: m.accessor, name: e.accessor });

            if (isEntityOutOfDateResponse(e)) {
              const meta: IConfigurationItemDto<IEntityMetadata> = {
                cacheMd5: e.metadata.md5 ?? "",
                configuration: {
                  ...e.metadata,
                  entityType: e.metadata.name,
                  entityModule: e.metadata.module,
                  properties: e.metadata.properties.map((p) => ({ ...p, entityType: p.entityType ?? undefined } as IPropertyMetadata)),

                  inheritedFromEntityType: e.metadata.inheritedFromName,
                  inheritedFromEntityModule: e.metadata.inheritedFromModule,
                  inheritedFromFullClassName: e.metadata.inheritedFromFullClassName,
                },
              };

              promises.push(metadataCache.setItem(key, meta));

              const aliases = [...e.metadata.aliases ?? [], e.metadata.fullClassName];
              aliases.forEach((alias) => {
                context.typesMap.register(alias, { module: e.metadata.module, name: e.metadata.name });
              });
              return;
            }

            if (e.status === 'unknown') {
              promises.push(metadataCache.removeItem(key));
              return;
            }
          });
        });

        const lookupCache = context.cacheProvider.getCache(ENTITY_CACHE.ENTITIES_LOOKUP);
        await lookupCache.clear().catch((error) => {
          console.error('Failed to populate lookup cache', error);
          return Promise.reject(error);
        });
        data.lookups.forEach((m) => {
          if (m.items.length) {
            const key = getEntityMetadataCacheKey({ module: m.module ?? '', name: m.name ?? '' });

            const data = {} as { [key: string]: string };
            m.items.forEach((e) => {
              data[e.module] = e.match;
            });

            // Add lookup for full config name
            promises.push(lookupCache.setItem(key, data));

            // Add lookup for Full Class Name
            if (m.id)
              promises.push(lookupCache.setItem(m.id, { module: data['_default'] ?? '', name: m.name }));
            if (m.aliases?.length) {
              m.aliases.forEach((alias) => {
                promises.push(lookupCache.setItem(alias, { module: data['_default'] ?? '', name: m.name }));
              });
            }
          } else {
            // Add lookup for Full Class Name without lookup data
            if (m.id)
              promises.push(lookupCache.setItem(m.id, { module: m.module ?? '', name: m.name ?? '' }));
            if (m.aliases?.length) {
              m.aliases.forEach((alias) => {
                promises.push(lookupCache.setItem(alias, { module: m.module ?? '', name: m.name ?? '' }));
              });
            }
          }
        });
        return await Promise.all(promises);
      } else {
        console.error('Failed to sync entities', response.data.error);
        return Promise.reject(response.data.error);
      }
    });
};

const getEntityCacheItem = (key: string, context: ISyncEntitiesContext): Promise<IEntityMetadata | undefined> =>
  context.cacheProvider.getCache(ENTITY_CACHE.ENTITIES).getItem<IConfigurationItemDto<IEntityMetadata>>(key).then((item) => item?.configuration);

export const getEntityMetadata = async (accessor: IEntityTypeIdentifier, context: ISyncEntitiesContext): Promise<IEntityMetadata | undefined> => {
  await syncEntities(context);

  const key = getEntityMetadataCacheKey(accessor);
  return getEntityCacheItem(key, context);
};

export const getCachedMetadataByTypeId = (typeId: IEntityTypeIdentifier, context: ISyncEntitiesContext): Promise<IEntityMetadata | undefined> => {
  const key = getEntityMetadataCacheKey(typeId);
  return getEntityCacheItem(key, context);
};

export const getCachedMetadataByClassName = (className: string, context: ISyncEntitiesContext): Promise<IEntityMetadata | undefined> => {
  const typeId = context.typesMap.resolve(className);
  if (!typeId) {
    throw new Error(`Failed to resolve type id for class ${className}`);
  }
  const key = getEntityMetadataCacheKey(typeId);
  return getEntityCacheItem(key, context);
};

export const isEntityTypeIdentifier = (modelType: string | IEntityTypeIdentifier | null | undefined): modelType is IEntityTypeIdentifier =>
  modelType !== null && modelType !== undefined &&
  typeof modelType === 'object' &&
  'name' in modelType && 'module' in modelType &&
  typeof modelType.name === 'string';

export const getEntityTypeIdentifier = (modelType: string | IEntityTypeIdentifier): IEntityTypeIdentifier =>
  (isEntityTypeIdentifier(modelType) ? modelType : { name: modelType, module: null });

export const getEntityTypeIdentifierQueryParams = (modelType: string | IEntityTypeIdentifier): IEntityTypeIdentifierQueryParams =>
  (isEntityTypeIdentifier(modelType)
    ? { name: modelType.name, module: modelType.module ?? undefined }
    : { entityType: modelType }
  );
export const isEntityTypeIdEqual = (a: string | IEntityTypeIdentifier, b: string | IEntityTypeIdentifier): boolean =>
  (typeof a === 'string' && typeof b === 'string' && a === b) ||
  (isEntityTypeIdentifier(a) && isEntityTypeIdentifier(b) && a.name === b.name && a.module === b.module);

export const isEntityTypeIdEmpty = (a: string | IEntityTypeIdentifier | null | undefined): boolean =>
  a === null || a === undefined ||
  (typeof a === 'string' && a.trim().length === 0) ||
  (typeof a === 'object' && !isEntityTypeIdentifier(a)) ||
  (isEntityTypeIdentifier(a) && a.name.trim().length === 0);

export const getEntityTypeName = (modelType: string | IEntityTypeIdentifier | null | undefined): string | null | undefined =>
  isEntityTypeIdentifier(modelType)
    ? Boolean(modelType.module)
      ? `${modelType.module}:${modelType.name}`
      : modelType.name
    : modelType;
