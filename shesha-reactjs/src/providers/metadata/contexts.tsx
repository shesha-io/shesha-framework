import { IModelMetadata, IPropertyMetadata } from '@/interfaces/metadata';
import { createNamedContext } from '@/utils/react';

export type MetadataType = 'entity' | 'context';

export interface IMetadataStateContext {
  id: string | null;
  modelType: string | null;
  dataType?: MetadataType;
  metadata: IModelMetadata | null;
}

export interface IMetadataActionsContext {
  getPropertyMeta: (name: string) => IPropertyMetadata | undefined;
}

export interface IMetadataContext extends IMetadataStateContext, IMetadataActionsContext { }

export interface ISetMetadataPayload {
  metadata: IModelMetadata | null;
  modelType: string;
  dataType?: MetadataType;
}

/** initial state */
export const METADATA_CONTEXT_INITIAL_STATE: IMetadataStateContext = {
  id: null,
  modelType: null,
  metadata: null,
};

export const MetadataContext = createNamedContext<IMetadataContext | undefined>(undefined, "MetadataContext");
