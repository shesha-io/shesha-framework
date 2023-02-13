import { createContext } from 'react';
import { IModelMetadata } from '../../interfaces/metadata';
import { IConfigurableAction } from '../../utils/configurationFramework/models';

export interface IConfigurableActionsStateContext {
  owner: string;
  actions: IConfigurableAction[];
}

export interface IMetadataActionsContext {
  getMetadata: () => Promise<IModelMetadata>;
}

export interface IMetadataContext extends IConfigurableActionsStateContext, IMetadataActionsContext {
  
}

export interface ISetMetadataPayload {
  metadata: IModelMetadata;
}

/** initial state */
export const METADATA_CONTEXT_INITIAL_STATE: IMetadataContext = {
  id: null,
  modelType: null,
  getMetadata: null,
};

export const MetadataContext = createContext<IMetadataContext>(undefined);