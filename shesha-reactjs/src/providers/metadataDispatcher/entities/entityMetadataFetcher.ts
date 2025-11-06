import { HttpClientApi } from "@/publicJsApis/httpClient";
import { IEntityTypesMap, IEntityMetadataFetcher, ISyncEntitiesContext, ICacheProvider } from "./models";
import { DataTypes, IPropertyMetadata } from "@/interfaces";
import { IEntityMetadata, NestedProperties, isIHasEntityType, isPropertiesArray } from "@/interfaces/metadata";
import { ENTITY_CACHE, getEntityMetadataCacheKey, syncEntities } from "./utils";
import { IEntityTypeIndentifier } from "@/providers/sheshaApplication/publicApi/entities/models";
import { EntityTypesMap } from "./entityTypesMap";
import { IConfigurationItemsLoaderActionsContext } from "@/providers/configurationItemsLoader/contexts";

type EntityMetadataByClassNameFetcher = (className: string) => Promise<IEntityMetadata | null>;
type EntityMetadataByIdFetcher = (etityIdentifier: IEntityTypeIndentifier) => Promise<IEntityMetadata | null>;

export class EntityMetadataFetcher implements IEntityMetadataFetcher {
  #syncPromise: Promise<void> | undefined;

  #httpClient: HttpClientApi;

  #typesMap: IEntityTypesMap;

  #cacheProvider: ICacheProvider;

  #configurationItemsLoader: IConfigurationItemsLoaderActionsContext;

  constructor(configurationItemsLoader: IConfigurationItemsLoaderActionsContext, httpClient: HttpClientApi, cacheProvider: ICacheProvider) {
    this.#httpClient = httpClient;
    this.#typesMap = new EntityTypesMap();
    this.#cacheProvider = cacheProvider;
    this.#configurationItemsLoader = configurationItemsLoader;
  }

  #ensureSynchronized = (): Promise<void> => {
    if (!this.#syncPromise) {
      this.#syncPromise = this.#syncEntities();
    }
    return this.#syncPromise;
  };

  #mapProperty = (property: IPropertyMetadata, metadataGetter: EntityMetadataByIdFetcher, prefix: string = ''): IPropertyMetadata => {
    const nestedProperties: NestedProperties = isPropertiesArray(property.properties)
      ? property.dataType === DataTypes.entityReference && isIHasEntityType(property)
        ? () => metadataGetter({ name: property.entityType, module: property.entityModule ?? null })
          .then((m) => (m?.properties ?? []) as IPropertyMetadata[])
        : property.properties.map((child) => this.#mapProperty(child, metadataGetter, property.path))
      : (property.properties ?? null);

    return {
      ...property,
      path: property.path,
      prefix,
      properties: nestedProperties,
    };
  };

  #convertMetadata = (metadata: IEntityMetadata, metadataGetter: EntityMetadataByIdFetcher): IEntityMetadata => {
    if (isPropertiesArray(metadata.properties)) {
      metadata.properties = metadata.properties.map((p) => this.#mapProperty(p, metadataGetter));
    }
    return metadata;
  };

  get #syncContext(): ISyncEntitiesContext {
    return {
      httpClient: this.#httpClient,
      cacheProvider: this.#cacheProvider,
      typesMap: this.#typesMap,
      configurationItemsLoader: this.#configurationItemsLoader,
    };
  };

  #syncEntities = (): Promise<void> => {
    return syncEntities(this.#syncContext);
  };

  syncAll = (): Promise<void> => {
    this.#syncPromise = this.#syncEntities();
    return this.#syncPromise;
  };

  getByTypeId: EntityMetadataByIdFetcher = async (typeId: IEntityTypeIndentifier): Promise<IEntityMetadata | null> => {
    await this.#ensureSynchronized();
    const metadata = await this.#configurationItemsLoader.getCachedConfig<IEntityMetadata>({ type: 'entity', id: typeId, skipCache: false });
    return metadata
      ? this.#convertMetadata(metadata.configuration, this.getByTypeId)
      : null;
  };

  getByClassName: EntityMetadataByClassNameFetcher = async (className: string): Promise<IEntityMetadata | null> => {
    await this.#ensureSynchronized();
    const metadata = await this.#configurationItemsLoader.getCachedConfig<IEntityMetadata>({ type: 'entity', id: className, skipCache: false });
    return metadata
      ? this.#convertMetadata(metadata.configuration, this.getByTypeId)
      : null;
  };

  isEntity = (modelType: string | IEntityTypeIndentifier): Promise<boolean> => {
    return this.#ensureSynchronized().then(async () => {
      // Check if modelType is a string and alias exists
      if (typeof modelType === 'string' && this.#typesMap.resolve(modelType))
        return true;

      // check if entity is cached
      const key = getEntityMetadataCacheKey(modelType as IEntityTypeIndentifier);
      const entity = await this.#cacheProvider.getCache(ENTITY_CACHE.ENTITIES).getItem<IEntityMetadata>(key);
      if (Boolean(entity))
        return true;

      // Check if entitty type exists in the types map
      return Boolean(this.#typesMap.identifierExists(modelType as IEntityTypeIndentifier));
    });
  };
};
