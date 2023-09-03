import { createContext } from 'react';
import { IModelMetadata } from '../../interfaces/metadata';

export interface IMetadataStateContext {
  id: string;
  modelType: string;
  metadata?: IModelMetadata;
}

export interface IMetadataActionsContext {
  getMetadata: () => Promise<IModelMetadata>;
}

export interface IMetadataContext extends IMetadataStateContext, IMetadataActionsContext {}

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
