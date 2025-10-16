import { DataTypes, IDictionary, IModelMetadata, IPropertyMetadata, isEntityReferencePropertyMetadata, isPropertiesArray } from "@/interfaces";
import { IGetMetadataPayload, IGetNestedPropertiesPayload, IGetPropertiesMetadataPayload, IGetPropertyMetadataFromMetaPayload, IGetPropertyMetadataPayload, IMetadataDispatcher } from "./contexts";
import { IModelsDictionary } from "./models";
import { IEntityMetadataFetcher } from "./entities/models";
import camelcase from 'camelcase';
import { asPropertiesArray, isDataPropertyMetadata, isEntityReferenceArrayPropertyMetadata, isObjectReferencePropertyMetadata } from "@/interfaces/metadata";
import { MetadataDtoAjaxResponse, PropertyMetadataDto } from "@/apis/metadata";
import { HttpClientApi } from "@/publicJsApis/httpClient";
import qs from "qs";
import { isAjaxErrorResponse } from "@/interfaces/ajaxResponse";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";

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

  #extractNestedProperty = (mainProperty: IPropertyMetadata, name: string): Promise<IPropertyMetadata | undefined> => {
    return isEntityReferencePropertyMetadata(mainProperty)
      ? this.getMetadata({ dataType: mainProperty.dataType, modelType: mainProperty.entityType }).then((entityMeta) => {
        return entityMeta && isPropertiesArray(entityMeta.properties)
          ? this.#getPropertyByName(entityMeta.properties, name)
          : undefined;
      })
      : Promise.resolve(isDataPropertyMetadata(mainProperty) && isPropertiesArray(mainProperty.properties)
        ? this.#getPropertyByName(mainProperty.properties, name)
        : undefined,
      );
  };

  #getNested = (meta: IModelMetadata, propName: string): Promise<IModelMetadata> => {
    const propMeta = asPropertiesArray(meta.properties, []).find((p) => camelcase(p.path) === propName);

    if (!propMeta) return Promise.reject(`property '${propName}' not found`);

    if (isEntityReferencePropertyMetadata(propMeta))
      return this.getMetadata({ dataType: DataTypes.entityReference, modelType: propMeta.entityType });

    if (isEntityReferenceArrayPropertyMetadata(propMeta))
      return this.getMetadata({ dataType: DataTypes.entityReference, modelType: propMeta.entityType });

    if (isObjectReferencePropertyMetadata(propMeta)) {
      return this.getMetadata({ dataType: DataTypes.object, modelType: propMeta.entityType });
    }

    if (isDataPropertyMetadata(propMeta) && propMeta.dataType === DataTypes.object) {
      const meta: IModelMetadata = {
        properties: propMeta.properties,
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
    const loadedModel = this.#models[modelType]; // TODO: split list by types
    if (loadedModel) return loadedModel;

    if (dataType === DataTypes.entityReference || dataType === DataTypes.object || dataType === null) {
      const promise = this.#entityMetaFetcher.isEntity(modelType).then((isEntity) => {
        if (isEntity)
          return this.#entityMetaFetcher.getByClassName(modelType);

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

        const url = `/api/services/app/Metadata/Get?${qs.stringify({ container: modelType })}`;
        return this.#httpClient.get<MetadataDtoAjaxResponse>(url).then((rawResponse) => {
          const response = rawResponse.data;
          if (isAjaxErrorResponse(response))
            throw new Error(`Failed to fetch metadata for model type: '${modelType}'`, { cause: response.error });

          const properties = response.result.properties.map<IPropertyMetadata>((p) => mapProperty(p));
          const meta: IModelMetadata = {
            entityType: modelType,
            dataType: response.result.dataType,
            name: modelType, // TODO: fetch name from server
            properties,
          };
          return meta;
        }).catch((error) => {
          console.error(`Failed to fetch metadata of type "${modelType}"`, error);
          const meta: IModelMetadata = {
            entityType: modelType,
            dataType: 'object',
            name: modelType, // TODO: fetch name from server
            properties: [],
          };
          return meta;
        });
      });
      this.#models[payload.modelType] = promise;
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
        const nextAccumulator = await callback(accumulator, array[index], index, array);
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

  isEntityType = (modelType: string): Promise<boolean> => {
    if (!modelType) return Promise.resolve(false);

    return this.getMetadata({ dataType: null, modelType: modelType }).then((m) => {
      return m.dataType === DataTypes.entityReference;
    });
  };

  getContainerProperties = (payload: IGetNestedPropertiesPayload): Promise<IPropertyMetadata[]> => {
    return this.getContainerMetadata(payload).then((m) => typeof (m.properties) === 'function' ? m.properties() : m.properties);
  };

  getContainerMetadata = (payload: IGetNestedPropertiesPayload): Promise<IModelMetadata> => {
    const { metadata, containerPath } = payload;
    if (!metadata.properties) return Promise.reject();

    if (containerPath) {
      const parts = containerPath.split('.');

      const promise = parts.reduce((left, right) => {
        return left.then((pp) => this.#getNested(pp, right));
      }, Promise.resolve(metadata));

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
