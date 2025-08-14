import { IDictionary } from '@/interfaces';
import { IModelMetadata, IPropertyMetadata } from '@/interfaces/metadata';

export interface IGetMetadataPayload {
  modelType: string;
  dataType: string;
}

export type IGetPropertyMetadataFromMetaPayload = {
  metadata: IModelMetadata;
  propertyPath: string;
};

export type IGetPropertyMetadataPayload = {
  dataType: string;
  modelType: string;
  propertyPath: string;
};

export interface IGetPropertiesMetadataPayload {
  dataType: string;
  modelType: string;
  properties: string[];
}

export interface IGetNestedPropertiesPayload {
  metadata: IModelMetadata;
  containerPath: string;
}

export interface IMetadataDispatcher {
  getMetadata: (payload: IGetMetadataPayload) => Promise<IModelMetadata>;
  getPropertyMetadata: (payload: IGetPropertyMetadataPayload) => Promise<IPropertyMetadata>;
  getPropertyFromMetadata: (payload: IGetPropertyMetadataFromMetaPayload) => Promise<IPropertyMetadata>;
  getPropertiesMetadata: (payload: IGetPropertiesMetadataPayload) => Promise<IDictionary<IPropertyMetadata>>;
  isEntityType: (modelType: string) => Promise<boolean>;
  getContainerProperties: (payload: IGetNestedPropertiesPayload) => Promise<IPropertyMetadata[]>;
  getContainerMetadata: (payload: IGetNestedPropertiesPayload) => Promise<IModelMetadata>;
  registerModel: (modeltype: string, model: Promise<IModelMetadata>) => void;
  updateModel: (modeltype: string, model: Promise<IModelMetadata>) => void;
}

export type NestedPropertyMetadatAccessor = (propertyPath: string) => Promise<IPropertyMetadata>;
