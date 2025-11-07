import { DataTypes, IDictionary, IModelMetadata, IPropertyMetadata, isEntityReferencePropertyMetadata, isPropertiesArray } from "@/interfaces";
import { IGetMetadataPayload, IGetNestedPropertiesPayload, IGetPropertiesMetadataPayload, IGetPropertyMetadataFromMetaPayload, IGetPropertyMetadataPayload, IMetadataDispatcher } from "./contexts";
import { IModelsDictionary } from "./models";
import { IEntityMetadataFetcher } from "./entities/models";
import camelcase from 'camelcase';
import { asPropertiesArray, IHasEntityType, isDataPropertyMetadata, isEntityReferenceArrayPropertyMetadata, isObjectReferencePropertyMetadata } from "@/interfaces/metadata";
import { MetadataDtoAjaxResponse, MetadataGetQueryParams, PropertyMetadataDto } from "@/apis/metadata";
import { HttpClientApi } from "@/publicJsApis/httpClient";
import qs from "qs";
import { isAjaxErrorResponse } from "@/interfaces/ajaxResponse";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { getEntityTypeIdentifierQueryParams, isEntityTypeIdentifier } from "./entities/utils";
import { IEntityTypeIdentifier } from "../sheshaApplication/publicApi/entities/models";

interface IPropertyPathWithMetadata {
  path: string;
  metadata: IPropertyMetadata;
}

export class MetadataDispatcher implements IMetadataDispatcher {
  #models: IModelsDictionary;

  #entityMetaFetcher: IEntityMetadataFetcher;

  #httpClient: HttpClientApi;

  constructor(entityMetaFetcher: IEntityMetadataFetcher, httpClient: HttpClientApi) {
    this.#models = {};
    this.#entityMetaFetcher = entityMetaFetcher;
    this.#httpClient = httpClient;
  }

  //#region private methods

  #getPropertyByName = (properties: IPropertyMetadata[], name: string): IPropertyMetadata | undefined => {
    return properties.find((p) => camelcase(p.path) === name);
  };

  #getEntityTypeId = (property: IHasEntityType): IEntityTypeIdentifier =>
    ({ name: property.entityType, module: property.entityModule ?? null });


  #extractNestedProperty = (mainProperty: IPropertyMetadata, name: string): Promise<IPropertyMetadata | undefined> => {
    return isEntityReferencePropertyMetadata(mainProperty)
      ? this.getMetadata({ dataType: mainProperty.dataType, modelType: this.#getEntityTypeId(mainProperty) }).then((entityMeta) => {
        return entityMeta && isPropertiesArray(entityMeta.properties)
          ? this.#getPropertyByName(entityMeta.properties, name)
          : undefined;
      })
      : Promise.resolve(isDataPropertyMetadata(mainProperty) && isPropertiesArray(mainProperty.properties)
        ? this.#getPropertyByName(mainProperty.properties, name)
        : undefined,
      );
  };

  #getNested = (meta: IModelMetadata, propName: string): Promise<IModelMetadata | null> => {
    const propMeta = asPropertiesArray(meta.properties, []).find((p) => camelcase(p.path) === propName);

    if (!propMeta) return Promise.reject(`property '${propName}' not found`);

    if (isEntityReferencePropertyMetadata(propMeta))
      return this.getMetadata({ dataType: DataTypes.entityReference, modelType: this.#getEntityTypeId(propMeta) });

    if (isEntityReferenceArrayPropertyMetadata(propMeta))
      return this.getMetadata({ dataType: DataTypes.entityReference, modelType: this.#getEntityTypeId(propMeta) });

    if (isObjectReferencePropertyMetadata(propMeta)) {
      return this.getMetadata({ dataType: DataTypes.object, modelType: this.#getEntityTypeId(propMeta) });
    }

    if (isDataPropertyMetadata(propMeta) && propMeta.dataType === DataTypes.object) {
      const meta: IModelMetadata = {
        properties: propMeta.properties ?? null,
        specifications: [],
        apiEndpoints: {},
        dataType: DataTypes.object,
      };
      return Promise.resolve(meta);
    }

    return Promise.reject(`data type '${propMeta.dataType}' doesn't support nested properties`);
  };

  //#endregion

  getMetadata = async (payload: IGetMetadataPayload): Promise<IModelMetadata | null> => {
    const { modelType, dataType } = payload;
    const container = isEntityTypeIdentifier(modelType) ? `${modelType.module}:${modelType.name}` : modelType;
    const loadedModel = this.#models[container]; // TODO: split list by types
    if (loadedModel) return loadedModel;

    if (dataType === DataTypes.entityReference || dataType === DataTypes.object || dataType === null) {
      const promise = this.#entityMetaFetcher.isEntity(modelType).then((isEntity) => {
        if (isEntity)
          return isEntityTypeIdentifier(modelType)
            ? this.#entityMetaFetcher.getByTypeId(modelType)
            : this.#entityMetaFetcher.getByClassName(modelType);

        const mapProperty = (property: PropertyMetadataDto, prefix: string = ''): IPropertyMetadata => {
          const { properties, itemsType, ...rest } = property;
          return {
            ...rest,
            path: property.path,
            prefix,
            itemsType: itemsType ? mapProperty(itemsType) : undefined,
            properties: properties
              ? properties.map((child) => mapProperty(child, property.path))
              : undefined,
          };
        };

        const url = `/api/services/app/Metadata/Get?${qs.stringify(getEntityTypeIdentifierQueryParams(modelType) as MetadataGetQueryParams)}`;
        return this.#httpClient.get<MetadataDtoAjaxResponse>(url).then((rawResponse) => {
          const response = rawResponse.data;
          if (isAjaxErrorResponse(response))
            throw new Error(`Failed to fetch metadata for model type: '${modelType}'`, { cause: response.error });

          const properties = response.result.properties.map<IPropertyMetadata>((p) => mapProperty(p));
          const meta: IModelMetadata = {
            ...response.result,
            entityType: response.result.name,
            entityModule: response.result.module,
            properties,
          };
          return meta;
        }).catch((error) => {
          console.error(`Failed to fetch metadata of type "${modelType}"`, error);
          const meta: IModelMetadata = {
            name: isEntityTypeIdentifier(modelType) ? modelType.name : modelType,
            module: isEntityTypeIdentifier(modelType) ? modelType.module ?? '' : '',
            entityType: isEntityTypeIdentifier(modelType) ? modelType.name : modelType,
            entityModule: isEntityTypeIdentifier(modelType) ? modelType.module ?? '' : '',
            fullClassName: container,
            dataType: 'object',
            properties: [],
          };
          return meta;
        });
      });
      this.#models[container] = promise;
      return await promise;
    }

    return Promise.resolve(null);
  };

  getPropertyFromMetadata = async (payload: IGetPropertyMetadataFromMetaPayload): Promise<IPropertyMetadata | null> => {
    const { metadata, propertyPath } = payload;

    const pathParts = propertyPath.split('.');
    if (pathParts.length === 0) return Promise.reject('Failed to build property path');

    // get first level property and its metadata
    const level1 = pathParts.shift();
    const level1Promise = isPropertiesArray(metadata.properties) && !isNullOrWhiteSpace(level1)
      ? this.#getPropertyByName(metadata.properties, level1)
      : undefined;
    if (level1Promise === undefined)
      return Promise.resolve(null);

    const asyncReduce = async <T, U>(
      array: T[],
      callback: (accumulator: U, currentValue: T, index: number, array: T[]) => Promise<U | undefined>,
      initialValue: U,
    ): Promise<U | undefined> => {
      let accumulator: U = initialValue;

      for (let index = 0; index < array.length; index++) {
        const nextAccumulator = await callback(accumulator, array[index] as T, index, array);
        if (!isDefined(nextAccumulator))
          return undefined;
        accumulator = nextAccumulator;
      }

      return accumulator;
    };

    // run full chain of properties starting from the first one
    const result = await asyncReduce(pathParts, async (a, c) => {
      return await this.#extractNestedProperty(a, c);
    }, level1Promise);

    return isDefined(result) ? result : null;
  };


  getPropertyMetadata = async (payload: IGetPropertyMetadataPayload): Promise<IPropertyMetadata | null> => {
    const { dataType, modelType, propertyPath } = payload;

    // get container metadata
    const metadata = await this.getMetadata({ dataType, modelType });
    return metadata
      ? await this.getPropertyFromMetadata({ metadata, propertyPath })
      : null;
  };

  getPropertiesMetadata = (payload: IGetPropertiesMetadataPayload): Promise<IDictionary<IPropertyMetadata>> => {
    const { dataType, properties, modelType } = payload;

    const promises = properties.map((p) => this.getPropertyMetadata({ dataType, modelType: modelType, propertyPath: p })
      .then<IPropertyPathWithMetadata | null>((propMeta) => propMeta ? { path: p, metadata: propMeta } : null),
    );

    return Promise.allSettled(promises).then((results) => {
      const dictionary: IDictionary<IPropertyMetadata> = {};
      results
        .filter((r) => r.status === 'fulfilled')
        .forEach((r) => {
          const pathWithMeta = r.value;
          if (pathWithMeta) dictionary[pathWithMeta.path] = pathWithMeta.metadata;
        });

      return dictionary;
    });
  };

  isEntityType = (modelType: string | IEntityTypeIdentifier): Promise<boolean> => {
    if (!modelType) return Promise.resolve(false);

    return this.getMetadata({ dataType: null, modelType: modelType }).then((m) => {
      return m?.dataType === DataTypes.entityReference;
    });
  };

  getContainerProperties = (payload: IGetNestedPropertiesPayload): Promise<IPropertyMetadata[]> => {
    return this.getContainerMetadata(payload).then((m) => typeof (m?.properties) === 'function' ? m.properties() : (m?.properties ?? []));
  };

  getContainerMetadata = (payload: IGetNestedPropertiesPayload): Promise<IModelMetadata | null> => {
    const { metadata, containerPath } = payload;
    if (!metadata.properties) return Promise.reject();

    if (containerPath) {
      const parts = containerPath.split('.');

      const promise = parts.reduce((left, right) => {
        return left.then((pp) => pp ? this.#getNested(pp, right) : Promise.resolve(null));
      }, Promise.resolve(metadata) as Promise<IModelMetadata | null>);

      return promise;
    } else {
      return Promise.resolve(metadata);
    }
  };

  registerModel = (modelType: string, model: Promise<IModelMetadata>): void => {
    if (!this.#models[modelType])
      this.#models[modelType] = model;
  };

  updateModel = (modelType: string, model: Promise<IModelMetadata>): void => {
    this.#models[modelType] = model;
  };
}
