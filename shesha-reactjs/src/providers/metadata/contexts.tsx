import { createContext } from 'react';
import { IModelMetadata } from '../../interfaces/metadata';

export type MetadataType = 'entity' | 'context';

export interface IMetadataStateContext {
  id: string;
  modelType: string;
  dataType?: MetadataType;
  metadata?: IModelMetadata;
}

export interface IMetadataActionsContext {
  getMetadata: () => Promise<IModelMetadata>;
}

export interface IMetadataContext extends IMetadataStateContext, IMetadataActionsContext {
  
}

export interface ISetMetadataPayload {
  metadata: IModelMetadata;
  modelType?: string;
  dataType?: MetadataType;
}

/** initial state */
export const METADATA_CONTEXT_INITIAL_STATE: IMetadataContext = {
  id: null,
  modelType: null,
  getMetadata: null,
};

export const MetadataContext = createContext<IMetadataContext>(undefined);