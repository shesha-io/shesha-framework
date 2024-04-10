import camelcase from 'camelcase';
import React, { FC, PropsWithChildren, useContext, useRef } from 'react';
import useThunkReducer from '@/hooks/thunkReducer';
import { activateProviderAction } from './actions';
import {
  IGetMetadataPayload,
  IGetNestedPropertiesPayload,
  IGetPropertiesMetadataPayload,
  IGetPropertyMetadataPayload,
  IMetadataDispatcherActionsContext,
  IMetadataDispatcherStateContext,
  IRegisterProviderPayload,
  METADATA_DISPATCHER_CONTEXT_INITIAL_STATE,
  MetadataDispatcherActionsContext,
  MetadataDispatcherStateContext,
  NestedPropertyMetadatAccessor,
  IMetadataDispatcherFullinstance,
} from './contexts';
import { IModelsDictionary, IProvidersDictionary } from './models';
import metadataReducer from './reducer';
import {
  IModelMetadata,
  IPropertyMetadata,
  isEntityReferencePropertyMetadata,
  isObjectReferencePropertyMetadata,
  isDataPropertyMetadata,
  isPropertiesArray,
  asPropertiesArray,
  ModelTypeIdentifier,
  IObjectMetadata,
} from '@/interfaces/metadata';
import { DataTypes } from '@/interfaces/dataTypes';
import { IDictionary } from '@/interfaces';
import { MetadataFetcher } from '@/utils/metadata/metadataBuilder';
import { useEntityMetadataFetcher } from './entities/useEntityMetadataFetcher';
import { PropertyMetadataDto, metadataGet } from '@/apis/metadata';
import { useSheshaApplication } from '../sheshaApplication';

export interface IMetadataDispatcherProviderProps { }

const MetadataDispatcherProvider: FC<PropsWithChildren<IMetadataDispatcherProviderProps>> = ({ children }) => {
  const initial: IMetadataDispatcherStateContext = {
    ...METADATA_DISPATCHER_CONTEXT_INITIAL_STATE,
  };
  const entityMetaFetcher = useEntityMetadataFetcher();
  const providers = useRef<IProvidersDictionary>({});
  const models = useRef<IModelsDictionary>({});

  const [state, dispatch] = useThunkReducer(metadataReducer, initial);

  const { backendUrl, httpHeaders } = useSheshaApplication();

  const mapProperty = (property: PropertyMetadataDto, prefix: string = ''): IPropertyMetadata => {
    return {
      ...property,
      path: property.path,
      prefix,
      properties: property.properties?.map((child) => mapProperty(child, property.path)),
    };
  };
  
  const getMetadata = (payload: IGetMetadataPayload): Promise<IModelMetadata> => {
    const { modelType, dataType } = payload;
    const loadedModel = models.current[payload.modelType]; // todo: split list by types
    if (loadedModel) return loadedModel;

    if (dataType === DataTypes.entityReference || dataType === DataTypes.objectReference || dataType === null) {
      const promise = entityMetaFetcher.isEntity(modelType).then(isEntity => {
        if (isEntity)
          return entityMetaFetcher.getByClassName(modelType);

        return metadataGet({ container: modelType }, { base: backendUrl, headers: httpHeaders })
          .then(response => {
            if (!response.success)
              throw new Error(`Failed to fetch metadata for model type: '${modelType}'`, { cause: response.error });

            const properties = response.result.properties.map<IPropertyMetadata>(p => mapProperty(p));
            const meta: IModelMetadata = {
              entityType: payload.modelType,
              dataType: response.result.dataType,
              name: payload.modelType, // todo: fetch name from server
              properties,
            };
            return meta;
          });
      });
      models.current[payload.modelType] = promise;
      return promise;
    }

    return Promise.resolve(null);
  };

  const registerModel = (modelType: string, model: Promise<IModelMetadata>) => {
    if (!models.current[modelType])
      models.current[modelType] = model;
  };

  const updateModel = (modelType: string, model: Promise<IModelMetadata>) => {
    models.current[modelType] = model;
  };

  const getPropertyByName = (properties: IPropertyMetadata[], name: string): IPropertyMetadata => {
    return properties?.find((p) => camelcase(p.path) === name);
  };

  const extractNestedProperty = (mainProperty: IPropertyMetadata, name: string): Promise<IPropertyMetadata> => {
    return isEntityReferencePropertyMetadata(mainProperty)
      ? getMetadata({ dataType: mainProperty.dataType, modelType: mainProperty.entityType }).then(entityMeta => {
        return entityMeta && isPropertiesArray(entityMeta.properties)
          ? getPropertyByName(entityMeta.properties, name)
          : undefined;
      })
      : Promise.resolve(isDataPropertyMetadata(mainProperty) && isPropertiesArray(mainProperty.properties)
        ? getPropertyByName(mainProperty.properties, name)
        : undefined
      );
  };

  const getPropertyMetadata = (payload: IGetPropertyMetadataPayload): Promise<IPropertyMetadata> => {
    const { dataType, modelType, propertyPath } = payload;

    const pathParts = propertyPath.split('.');
    if (pathParts.length === 0) return Promise.reject('Failed to build property path');

    // get container metadata
    const rootMetaPromise = getMetadata({ dataType, modelType: modelType });
    // get first level property and its metadata
    const level1 = pathParts.shift();
    const level1Promise = rootMetaPromise.then((m) => {
      const propertyMeta = m && isPropertiesArray(m.properties)
        ? getPropertyByName(m.properties, level1)
        : undefined;
      return propertyMeta;
    });

    // run full chain of properties starting from the first one
    const result = pathParts.reduce((a, c) => {
      return a.then((m) => extractNestedProperty(m, c));
    }, level1Promise);

    return result;
  };

  interface IPropertyPathWithMetadata {
    path: string;
    metadata: IPropertyMetadata;
  }
  const getPropertiesMetadata = (payload: IGetPropertiesMetadataPayload): Promise<IDictionary<IPropertyMetadata>> => {
    const { dataType, properties, modelType } = payload;

    const promises = properties.map(p => getPropertyMetadata({ dataType, modelType: modelType, propertyPath: p })
      .then<IPropertyPathWithMetadata>(propMeta => ({ path: p, metadata: propMeta }))
    );

    return Promise.allSettled(promises).then((results) => {
      const dictionary: IDictionary<IPropertyMetadata> = {};
      results
        .filter((r) => r.status === 'fulfilled')
        .forEach((r) => {
          const pathWithMeta = (r as PromiseFulfilledResult<IPropertyPathWithMetadata>)?.value;
          if (pathWithMeta) dictionary[pathWithMeta.path] = pathWithMeta.metadata;
        });

      return dictionary;
    });
  };

  /**
   * Register a metadata provider with the given payload.
   * Registration of providers is used for access by the provider identifier
   *
   * @param {IRegisterProviderPayload} payload - the payload for registering the provider
   * @return {void} 
   */
  const registerProvider = (payload: IRegisterProviderPayload) => {
    const existingProvider = providers.current[payload.id];
    if (!existingProvider) {
      providers.current[payload.id] = {
        id: payload.id,
        modelType: payload.modelType,
        contextValue: payload.contextValue,
      };
    } else {
      existingProvider.modelType = payload.modelType;
      existingProvider.contextValue = payload.contextValue;
    }
  };

  /**
   * Activates a provider based on the provided ID.
   * Active provider can be used in the forms designer for configuration
   *
   * @param {string} providerId - The ID of the provider to activate
   */
  const activateProvider = (providerId: string) => {
    if (state.activeProvider !== providerId)
      dispatch(activateProviderAction(providerId));
  };

  /**
   * Retrieves the context value of the active provider.
   *
   * @return {type} the context value of the active provider
   */
  const getActiveProvider = () => {
    const registration = state.activeProvider ? providers.current[state.activeProvider] : null;

    return registration?.contextValue;
  };

  const getNested = (meta: IModelMetadata, propName: string): Promise<IModelMetadata> => {
    const propMeta = asPropertiesArray(meta.properties, []).find((p) => camelcase(p.path) === propName);

    if (!propMeta) return Promise.reject(`property '${propName}' not found`);

    if (isEntityReferencePropertyMetadata(propMeta))
      return getMetadata({ dataType: DataTypes.entityReference, modelType: propMeta.entityType });

    if (isObjectReferencePropertyMetadata(propMeta)) {
      return getMetadata({ dataType: DataTypes.objectReference, modelType: propMeta.entityType });
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

  const getContainerMetadata = (payload: IGetNestedPropertiesPayload) => {
    const { metadata, containerPath } = payload;
    if (!metadata?.properties) return Promise.reject();

    if (containerPath) {
      const parts = containerPath.split('.');

      const promise = parts.reduce((left, right) => {
        return left.then((pp) => getNested(pp, right));
      }, Promise.resolve(metadata));

      return promise;
    } else {
      return Promise.resolve(metadata);
    }
  };

  const getContainerProperties = (payload: IGetNestedPropertiesPayload) => {
    return getContainerMetadata(payload).then((m) => typeof (m.properties) === 'function' ? m.properties() : m.properties);
  };

  const isEntityType = (modelType: string): Promise<boolean> => {
    if (!modelType) return Promise.resolve(false);

    return getMetadata({ dataType: null, modelType: modelType }).then(m => {
      return m.dataType === DataTypes.entityReference;
    });
  };

  const metadataActions: IMetadataDispatcherActionsContext = {
    getMetadata,
    getPropertyMetadata,
    getPropertiesMetadata,
    isEntityType,
    getContainerProperties,
    getContainerMetadata,
    registerProvider,
    activateProvider,
    getActiveProvider,
    registerModel,
    updateModel
    /* NEW_ACTION_GOES_HERE */
  };

  return (
    <MetadataDispatcherStateContext.Provider value={state}>
      <MetadataDispatcherActionsContext.Provider value={metadataActions}>
        {children}
      </MetadataDispatcherActionsContext.Provider>
    </MetadataDispatcherStateContext.Provider>
  );
};

function useMetadataDispatcherState(require: boolean) {
  const context = useContext(MetadataDispatcherStateContext);

  if (context === undefined && require) {
    throw new Error('useMetadataDispatcherState must be used within a MetadataDispatcherProvider');
  }

  return context;
}

function useMetadataDispatcherActions(require: boolean) {
  const context = useContext(MetadataDispatcherActionsContext);

  if (context === undefined && require) {
    throw new Error('useMetadataDispatcherActions must be used within a MetadataDispatcherProvider');
  }

  return context;
}

function useMetadataDispatcher(require: boolean = true): IMetadataDispatcherFullinstance {
  const actionsContext = useMetadataDispatcherActions(require);
  const stateContext = useMetadataDispatcherState(require);

  // useContext() returns initial state when provider is missing
  // initial context state is useless especially when require == true
  // so we must return value only when both context are available
  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
}

const useNestedPropertyMetadatAccessor = (modelType: string): NestedPropertyMetadatAccessor => {
  const dispatcher = useMetadataDispatcher();

  const accessor: NestedPropertyMetadatAccessor = (propertyPath: string) => modelType
    ? dispatcher.getPropertyMetadata({ dataType: DataTypes.entityReference, modelType, propertyPath })
    : Promise.resolve(null);

  return accessor;
};

const useMetadataFetcher = (): MetadataFetcher => {
  const { getMetadata } = useMetadataDispatcher();
  const metadataFetcher = (typeId: ModelTypeIdentifier): Promise<IObjectMetadata> => getMetadata({ dataType: DataTypes.entityReference, modelType: typeId.name });
  return metadataFetcher;
};

export {
  MetadataDispatcherProvider,
  useMetadataDispatcher,
  useMetadataDispatcherActions,
  useMetadataDispatcherState,
  useNestedPropertyMetadatAccessor,
  useMetadataFetcher,
};