import { HttpClientApi } from "@/publicJsApis/httpClient";
import { IEntityTypesMap, IEntityMetadataFetcher, ISyncEntitiesContext, ICacheProvider } from "./models";
import { DataTypes, IPropertyMetadata } from "@/interfaces";
import { IEntityMetadata, NestedProperties, isIHasEntityType, isPropertiesArray } from "@/interfaces/metadata";
import { getCachedMetadataByClassName, getCachedMetadataByTypeId, syncEntities } from "./utils";
import { IEntityTypeIndentifier } from "@/providers/sheshaApplication/publicApi/entities/models";
import { EntityTypesMap } from "./entityTypesMap";

type EntityMetadataByClassNameFetcher = (className: string) => Promise<IEntityMetadata | null>;

export class EntityMetadataFetcher implements IEntityMetadataFetcher {
  #syncPromise: Promise<void> | undefined;

  #httpClient: HttpClientApi;

  #typesMap: IEntityTypesMap;

  #cacheProvider: ICacheProvider;

  constructor(httpClient: HttpClientApi, cacheProvider: ICacheProvider) {
    this.#httpClient = httpClient;
    this.#typesMap = new EntityTypesMap();
    this.#cacheProvider = cacheProvider;
  }

  #ensureSynchronized = (): Promise<void> => {
    if (!this.#syncPromise) {
      this.#syncPromise = this.#syncEntities();
    }
    return this.#syncPromise;
  };

  #mapProperty = (property: IPropertyMetadata, byClassNameGetter: EntityMetadataByClassNameFetcher, prefix: string = ''): IPropertyMetadata => {
    const nestedProperties: NestedProperties = isPropertiesArray(property.properties)
      ? property.dataType === DataTypes.entityReference && isIHasEntityType(property)
        ? () => byClassNameGetter(property.entityType).then((m) => m.properties as IPropertyMetadata[])
        : property.properties.map((child) => this.#mapProperty(child, byClassNameGetter, property.path))
      : property.properties;

    return {
      ...property,
      path: property.path,
      prefix,
      properties: nestedProperties,
    };
  };

  #convertMetadata = (metadata: IEntityMetadata, byClassNameGetter: EntityMetadataByClassNameFetcher): IEntityMetadata => {
    if (isPropertiesArray(metadata.properties)) {
      metadata.properties = metadata.properties.map((p) => this.#mapProperty(p, byClassNameGetter));
    }
    return metadata;
  };

  get #syncContext(): ISyncEntitiesContext {
    return {
      httpClient: this.#httpClient,
      cacheProvider: this.#cacheProvider,
      typesMap: this.#typesMap,
    };
  };

  #syncEntities = (): Promise<void> => {
    return syncEntities(this.#syncContext);
  };

  syncAll = (): Promise<void> => {
    this.#syncPromise = this.#syncEntities();
    return this.#syncPromise;
  };

  getByClassName = async (className: string): Promise<IEntityMetadata | null> => {
    await this.#ensureSynchronized();
    const metadata = await getCachedMetadataByClassName(className, this.#syncContext);
    return metadata
      ? await this.#convertMetadata(metadata, this.getByClassName)
      : null;
  };

  getByTypeId = (typeId: IEntityTypeIndentifier): Promise<IEntityMetadata> => {
    return this.#ensureSynchronized().then(() => {
      return getCachedMetadataByTypeId(typeId, this.#syncContext).then((m) => this.#convertMetadata(m, this.getByClassName));
    });
  };

  isEntity = (className: string): Promise<boolean> => {
    return this.#ensureSynchronized().then(() => {
      const typeId = this.#typesMap.resolve(className);
      return Boolean(typeId);
    });
  };
};
