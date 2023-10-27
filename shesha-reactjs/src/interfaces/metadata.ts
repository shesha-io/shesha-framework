import { IDictionary } from '..';
import { DataTypes } from "./dataTypes";

export interface IPropertyMetadataBase {
  isVisible?: boolean;
  path?: string | null;
  label?: string | null;
  description?: string | null;
  dataType?: string | null;
  dataFormat?: string | null;
  /**
   * If true, indicates that current property is a framework-related (e.g. Abp.Domain.Entities.ISoftDelete.IsDeleted, Abp.Domain.Entities.Auditing.IHasModificationTime.LastModificationTime)
   */
  isFrameworkRelated?: boolean;
  prefix?: string;
}

export interface IHasChildPropertiesMetadata {
  properties: IPropertyMetadata[];
}

export interface IHasEntityType {
  entityType?: string | null; // todo: split this property into two different (for objects and for entities) or rename existing
}

export interface IObjectReferencePropertyMetadata extends IPropertyMetadataBase, IHasEntityType, IHasChildPropertiesMetadata {
}

export interface IEntityReferencePropertyMetadata extends IPropertyMetadataBase, IHasEntityType, IHasChildPropertiesMetadata {
}

export const isEntityReferencePropertyMetadata = (propMeta: IPropertyMetadataBase): propMeta is IEntityReferencePropertyMetadata => {
  return propMeta && propMeta.dataType === DataTypes.entityReference;
};

export const isObjectReferencePropertyMetadata = (propMeta: IPropertyMetadataBase): propMeta is IObjectReferencePropertyMetadata => {
  return propMeta && propMeta.dataType === DataTypes.objectReference;
};

export interface IRefListPropertyMetadata extends IPropertyMetadataBase {
  referenceListName?: string | null;
  referenceListModule?: string | null;
}

export const isRefListPropertyMetadata = (propMeta: IPropertyMetadataBase): propMeta is IRefListPropertyMetadata => {
  return propMeta && propMeta.dataType === DataTypes.referenceListItem;
};

export interface IPropertyMetadata extends IPropertyMetadataBase {
  required?: boolean;
  readonly?: boolean;
  minLength?: number | null;
  maxLength?: number | null;
  min?: number | null;
  max?: number | null;
  validationMessage?: string | null;
  //entityType?: string | null;
  referenceListName?: string | null;
  referenceListModule?: string | null;
  /**
   * Child properties, applicable for complex data types (e.g. object, array)
   */
  properties?: IPropertyMetadata[] | null;
}

export type ProperyDataType =
  | 'string'
  | 'date'
  | 'date-time'
  | 'time'
  | 'entity'
  | 'file'
  | 'number'
  | 'reference-list-item'
  | 'boolean'
  | 'array'
  | 'object'
  | 'object-reference'
  | 'guid';

export enum MetadataSourceType {
  ApplicationCode = 1,
  UserDefined = 2,
}

export enum EntityConfigType {
  Class = 1,
  Interface = 2,
}

export enum StandardEntityActions {
  create = 'create',
  read = 'read',
  update = 'update',
  delete = 'delete',
}

export interface IMetadata {
  dataType: string;
  name?: string;
  description?: string;
}

export interface IContainerWithNestedProperties {
  properties: IPropertyMetadata[];
}

export interface IEntityMetadata extends IMetadata, IContainerWithNestedProperties {
  entityType: string;
  specifications: ISpecification[];
  apiEndpoints: IDictionary<IApiEndpoint>;
}

export interface IObjectMetadata extends IMetadata, IContainerWithNestedProperties {
  
}
export interface IContextMetadata extends IMetadata, IContainerWithNestedProperties {

}

export type IModelMetadata = IEntityMetadata | IObjectMetadata | IContextMetadata;

export const isEntityMetadata = (value: IModelMetadata): value is IEntityMetadata => {
  return value && value.dataType === DataTypes.entityReference;
};
export const isObjectMetadata = (value: IModelMetadata): value is IObjectMetadata => {
  return value && value.dataType === DataTypes.object;
};
export const isContextMetadata = (value: IModelMetadata): value is IContextMetadata => {
  return value && value.dataType === DataTypes.context;
};

export const metadataHasNestedProperties = (value: IModelMetadata): value is IContainerWithNestedProperties & IModelMetadata => {
  return (isEntityMetadata(value) || isObjectMetadata(value) || isContextMetadata(value)) 
    && Array.isArray((value as IContainerWithNestedProperties).properties);
};

export interface IApiEndpoint {
  /**
   * Http verb (get/post/put etc)
   */
  httpVerb: string;
  /**
   * Url
   */
  url: string;
}

export interface ISpecification {
  name: string;
  friendlyName: string;
  description?: string;
}