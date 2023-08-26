import { createContext } from 'react';
import { IDictionary } from '../../interfaces';
import { IModelMetadata, IPropertyMetadata } from '../../interfaces/metadata';
import { IMetadataContext, MetadataType } from '../metadata/contexts';

export interface IMetadataDispatcherStateContext {
  activeProvider?: string;
}

export interface IGetMetadataPayload {
  modelType: string;
  dataType?: MetadataType;
}

export interface IGetPropertyMetadataPayload {
  modelType: string;
  propertyPath: string;
}

export interface IGetPropertiesMetadataPayload {
  modelType: string;
  properties: string[];
}

export interface IGetNestedPropertiesPayload {
  metadata: IModelMetadata;
  containerPath: string;
}

export interface IRegisterProviderPayload {
  id: string;
  modelType: string;
  contextValue: IMetadataContext;
}

export interface IMetadataDispatcherActionsContext {
  getMetadata: (payload: IGetMetadataPayload) => Promise<IModelMetadata>;
  getPropertyMetadata: (payload: IGetPropertyMetadataPayload) => Promise<IPropertyMetadata>;
  getPropertiesMetadata: (payload: IGetPropertiesMetadataPayload) => Promise<IDictionary<IPropertyMetadata>>;
  isEntityType: (modelType: string) => Promise<boolean>;
  getContainerProperties: (payload: IGetNestedPropertiesPayload) => Promise<IPropertyMetadata[]>;
  getContainerMetadata: (payload: IGetNestedPropertiesPayload) => Promise<IModelMetadata>;
  registerProvider: (payload: IRegisterProviderPayload) => void;
  // todo: add `unregisterProvider`
  activateProvider: (providerId: string) => void;
  getActiveProvider: () => IMetadataContext;
  registerModel: (modeltype: string, model: Promise<IModelMetadata>) => void;
  updateModel: (modeltype: string, model: Promise<IModelMetadata>) => void;
}

export interface IMetadataDispatcherFullinstance extends IMetadataDispatcherStateContext, IMetadataDispatcherActionsContext {}

export interface IMetadataProviderRegistration {
  id: string;
  modelType: string;
  contextValue: IMetadataContext;
}

/** initial state */
export const METADATA_DISPATCHER_CONTEXT_INITIAL_STATE: IMetadataDispatcherStateContext = {
};

export const MetadataDispatcherStateContext = createContext<IMetadataDispatcherStateContext>({...METADATA_DISPATCHER_CONTEXT_INITIAL_STATE});

export const MetadataDispatcherActionsContext = createContext<IMetadataDispatcherActionsContext>(undefined);

export type NestedPropertyMetadatAccessor = (propertyPath: string) => Promise<IPropertyMetadata>;