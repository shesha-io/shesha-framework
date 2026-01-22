import { IDictionary } from '@/interfaces';
import { IModelMetadata, IPropertyMetadata } from '@/interfaces/metadata';
import { IEntityTypeIdentifier } from '../sheshaApplication/publicApi/entities/models';

export interface IGetMetadataPayload {
  modelType: string | IEntityTypeIdentifier;
  dataType: string | null;
}

export type IGetPropertyMetadataFromMetaPayload = {
  metadata: IModelMetadata;
  propertyPath: string;
};

export type IGetPropertyMetadataPayload = {
  dataType: string;
  modelType: string | IEntityTypeIdentifier;
  propertyPath: string;
};

export interface IGetPropertiesMetadataPayload {
  dataType: string;
  modelType: string | IEntityTypeIdentifier;
  properties: string[];
}

export interface IGetNestedPropertiesPayload {
  metadata: IModelMetadata;
  containerPath: string;
}

export interface IMetadataDispatcher {
  getMetadata: (payload: IGetMetadataPayload) => Promise<IModelMetadata | null>;
  getPropertyMetadata: (payload: IGetPropertyMetadataPayload) => Promise<IPropertyMetadata | null>;
  getPropertyFromMetadata: (payload: IGetPropertyMetadataFromMetaPayload) => Promise<IPropertyMetadata | null>;
  getPropertiesMetadata: (payload: IGetPropertiesMetadataPayload) => Promise<IDictionary<IPropertyMetadata>>;
  isEntityType: (modelType: string | IEntityTypeIdentifier) => Promise<boolean>;
  getContainerProperties: (payload: IGetNestedPropertiesPayload) => Promise<IPropertyMetadata[]>;
  getContainerMetadata: (payload: IGetNestedPropertiesPayload) => Promise<IModelMetadata | null>;
  registerModel: (modeltype: string, model: Promise<IModelMetadata>) => void;
  updateModel: (modeltype: string, model: Promise<IModelMetadata>) => void;
}

export type NestedPropertyMetadatAccessor = (propertyPath: string) => Promise<IPropertyMetadata | null>;
