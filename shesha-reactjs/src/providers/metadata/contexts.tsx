import { IModelMetadata, IPropertyMetadata } from '@/interfaces/metadata';
import { createNamedContext } from '@/utils/react';

export type MetadataType = 'entity' | 'context';

export interface IMetadataStateContext {
  id: string;
  modelType: string;
  dataType?: MetadataType;
  metadata?: IModelMetadata;
}

export interface IMetadataActionsContext {
  //getMetadata: () => Promise<IModelMetadata>;
  getPropertyMeta: (name: string) => IPropertyMetadata;
}

export interface IMetadataContext extends IMetadataStateContext, IMetadataActionsContext { }

export interface ISetMetadataPayload {
  metadata: IModelMetadata;
  modelType?: string;
  dataType?: MetadataType;
}

/** initial state */
export const METADATA_CONTEXT_INITIAL_STATE: IMetadataContext = {
  id: null,
  modelType: null,
  //getMetadata: null,
  getPropertyMeta: null,
};

export const MetadataContext = createNamedContext<IMetadataContext>(undefined, "MetadataContext");