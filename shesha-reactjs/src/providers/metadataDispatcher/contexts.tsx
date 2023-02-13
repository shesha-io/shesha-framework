import { createContext } from 'react';
import { IModelMetadata, IPropertyMetadata } from '../../interfaces/metadata';
import { IMetadataContext } from '../metadata/contexts';

export interface IMetadataDispatcherStateContext {
  activeProvider?: string;
}

export interface IGetMetadataPayload {
  modelType: string;
}

// export interface IGetSpecificationsPayload {
//   modelType: string;
// }

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
  isEntityType: (modelType: string) => Promise<boolean>;
  //getSpecifications: (payload: IGetSpecificationsPayload) => Promise<ISpecification[]>;
  getContainerProperties: (payload: IGetNestedPropertiesPayload) => Promise<IPropertyMetadata[]>;
  getContainerMetadata: (payload: IGetNestedPropertiesPayload) => Promise<IModelMetadata>;
  registerProvider: (payload: IRegisterProviderPayload) => void;
  // todo: add `unregisterProvider`
  activateProvider: (providerId: string) => void;
  getActiveProvider: () => IMetadataContext;
}

export interface IMetadataProviderRegistration {
  id: string;
  modelType: string;
  contextValue: IMetadataContext;
}

/** initial state */
export const METADATA_DISPATCHER_CONTEXT_INITIAL_STATE: IMetadataDispatcherStateContext = {
};

export const MetadataDispatcherStateContext = createContext<IMetadataDispatcherStateContext>(METADATA_DISPATCHER_CONTEXT_INITIAL_STATE);

export const MetadataDispatcherActionsContext = createContext<IMetadataDispatcherActionsContext>(undefined);