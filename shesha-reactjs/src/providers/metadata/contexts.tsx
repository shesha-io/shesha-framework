import { IModelMetadata, IPropertyMetadata } from '@/interfaces/metadata';
import { createNamedContext } from '@/utils/react';
import { IEntityTypeIdentifier } from '../sheshaApplication/publicApi/entities/models';

export type MetadataType = 'entity' | 'context';

export interface IMetadataStateContext {
  id: string | null;
  modelType: IEntityTypeIdentifier | string | null;
  dataType?: MetadataType;
  metadata: IModelMetadata | null;
}

export interface IMetadataActionsContext {
  getPropertyMeta: (name: string) => IPropertyMetadata | undefined;
}

export interface IMetadataContext extends IMetadataStateContext, IMetadataActionsContext { }

export interface ISetMetadataPayload {
  metadata: IModelMetadata | null;
  modelType: string | IEntityTypeIdentifier;
  dataType?: MetadataType;
}

/** initial state */
export const METADATA_CONTEXT_INITIAL_STATE: IMetadataStateContext = {
  id: null,
  modelType: null,
  metadata: null,
};

export const MetadataContext = createNamedContext<IMetadataContext | undefined>(undefined, "MetadataContext");
