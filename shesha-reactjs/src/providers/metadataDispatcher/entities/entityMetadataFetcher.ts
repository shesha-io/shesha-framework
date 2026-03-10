import { HttpClientApi } from "@/publicJsApis/httpClient";
import { IEntityTypesMap, IEntityMetadataFetcher, ISyncEntitiesContext, ICacheProvider } from "./models";
import { DataTypes, IPropertyMetadata } from "@/interfaces";
import { IEntityMetadata, NestedProperties, isIHasEntityType, isPropertiesArray } from "@/interfaces/metadata";
import { ENTITY_CACHE, getEntityMetadataCacheKey, syncEntities } from "./utils";
import { IEntityTypeIdentifier } from "@/providers/sheshaApplication/publicApi/entities/models";
import { EntityTypesMap } from "./entityTypesMap";
import { IConfigurationLoader } from "@/providers/configurationItemsLoader/configurationLoader";

type EntityMetadataByClassNameFetcher = (className: string) => Promise<IEntityMetadata | null>;
type EntityMetadataByIdFetcher = (etityIdentifier: IEntityTypeIdentifier) => Promise<IEntityMetadata | null>;
type EntityMetadataByEntityTypeFetcher = (entityType: string | IEntityTypeIdentifier) => Promise<IEntityMetadata | null>;

export class EntityMetadataFetcher implements IEntityMetadataFetcher {
  #syncPromise: Promise<void> | undefined;

  #httpClient: HttpClientApi;

  #typesMap: IEntityTypesMap;

  #cacheProvider: ICacheProvider;

  #configurationItemsLoader: IConfigurationLoader;

  constructor(configurationItemsLoader: IConfigurationLoader, httpClient: HttpClientApi, cacheProvider: ICacheProvider) {
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
        ? () => metadataGetter({ name: property.entityType ?? '', module: property.entityModule ?? null })
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

  getByEntityType: EntityMetadataByEntityTypeFetcher = async (entityType: string | IEntityTypeIdentifier): Promise<IEntityMetadata | null> => {
    await this.#ensureSynchronized();
    const metadata = await this.#configurationItemsLoader.getCachedConfigAsync<IEntityMetadata>({ type: 'entity', id: entityType, skipCache: false });
    return metadata
      ? this.#convertMetadata(metadata.configuration, this.getByTypeId)
      : null;
  };

  getByTypeId: EntityMetadataByIdFetcher = async (typeId: IEntityTypeIdentifier): Promise<IEntityMetadata | null> => {
    return await this.getByEntityType(typeId);
  };

  getByClassName: EntityMetadataByClassNameFetcher = async (className: string): Promise<IEntityMetadata | null> => {
    return await this.getByEntityType(className);
  };

  isEntity = (modelType: string | IEntityTypeIdentifier): Promise<boolean> => {
    return this.#ensureSynchronized().then(async () => {
      // Check if modelType is a string and alias exists
      if (typeof modelType === 'string' && this.#typesMap.resolve(modelType))
        return true;

      // check if entity is cached
      const key = getEntityMetadataCacheKey(modelType as IEntityTypeIdentifier);
      const entity = await this.#cacheProvider.getCache(ENTITY_CACHE.ENTITIES).getItem<IEntityMetadata>(key);
      if (Boolean(entity))
        return true;

      // Check if entitty type exists in the types map
      return Boolean(this.#typesMap.identifierExists(modelType as IEntityTypeIdentifier));
    });
  };
};
