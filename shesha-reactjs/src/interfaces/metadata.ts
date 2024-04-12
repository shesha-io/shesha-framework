import { FormFullName } from "@/providers";
import { DataTypes } from "./dataTypes";
import { IDictionary } from "./shesha";

export interface IMemberType {
  dataType?: string | null;
  dataFormat?: string | null;
  baseType?: IMemberType;
}

export interface SourceFile {
  fileName: string;
  content: string;
}

export interface TypeDefinition {
  typeName: string;
  files: SourceFile[];
}

export interface TypeAndLocation {
  typeName: string;
  filePath?: string;
}

export interface ITypeDefinitionBuilder {
  getEntityType: (typeId: ModelTypeIdentifier) => Promise<TypeAndLocation>;  
  makeFormType: (formId: FormFullName, content: string) => TypeDefinition;
};
export interface ITypeDefinitionLoadingContext {
  typeDefinitionBuilder: ITypeDefinitionBuilder;
}

export type TypeDefinitionLoader = (context: ITypeDefinitionLoadingContext) => Promise<TypeDefinition>;
export interface IHasTypeDefinition {
  typeDefinitionLoader: TypeDefinitionLoader;
}

export interface IMetadata extends Partial<IHasTypeDefinition> {
  dataType: string;
  name?: string;
  description?: string;
}

export interface IMemberMetadata extends IMemberType, Partial<IHasTypeDefinition> {
  path?: string | null; // todo: check usages, replace with `name` and move to a common ancestor with IMetadata
  label?: string | null;
  description?: string | null;
}

export interface IHasChildPropertiesMetadata {
  properties: IPropertyMetadata[];
}

export interface ModelTypeIdentifier {
  name: string;
  module: string;
  // accessor: string;
  // moduleAccessor: string;
}

export interface IHasEntityType {
  entityType: string | null; // todo: split this property into two different (for objects and for entities) or rename existing
  entityModule?: string | null;
  
  typeAccessor?: string;
  moduleAccessor?: string;
}

export const isIHasEntityType = (value: any): value is IHasEntityType => {
  const typed = value as IHasEntityType;
  return typed && typeof typed.entityType === 'string';
};

export interface IObjectReferencePropertyMetadata extends IMemberMetadata, IHasEntityType, IHasChildPropertiesMetadata {
}

export interface IEntityReferencePropertyMetadata extends IMemberMetadata, IHasEntityType, Partial<IHasChildPropertiesMetadata> {
}

export const isEntityReferencePropertyMetadata = (propMeta: IMemberMetadata): propMeta is IEntityReferencePropertyMetadata => {
  return propMeta && propMeta.dataType === DataTypes.entityReference;
};

export const isObjectReferencePropertyMetadata = (propMeta: IMemberMetadata): propMeta is IObjectReferencePropertyMetadata => {
  return propMeta && propMeta.dataType === DataTypes.objectReference;
};

export interface IRefListPropertyMetadata extends IMemberMetadata {
  referenceListName?: string | null;
  referenceListModule?: string | null;
}

export const isRefListPropertyMetadata = (propMeta: IMemberMetadata): propMeta is IRefListPropertyMetadata => {
  return propMeta && propMeta.dataType === DataTypes.referenceListItem;
};

export interface IFunctionMetadata extends IMemberMetadata {
  arguments?: IMemberMetadata[];
  resultType: IMemberType;
}

export type PropertiesPromise = Promise<IPropertyMetadata[]>;
export type PropertiesLoader = () => PropertiesPromise;

export type NestedProperties = IPropertyMetadata[] | PropertiesLoader | null;

export interface IPropertyMetadata extends IMemberMetadata {
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
  properties?: NestedProperties;
  functions?: IFunctionMetadata[] | null;

  /**
   * If true, indicates that current property is a framework-related (e.g. Abp.Domain.Entities.ISoftDelete.IsDeleted, Abp.Domain.Entities.Auditing.IHasModificationTime.LastModificationTime)
   */
  isFrameworkRelated?: boolean;
  /**
   * If true, indicates that current property is nullable
   */
  isNullable?: boolean;
  prefix?: string;
  isVisible?: boolean;
  itemsType?: IPropertyMetadata;
}

export const isPropertiesArray = (value: NestedProperties): value is IPropertyMetadata[] => {
  return value && Array.isArray(value);
};

export const isPropertiesLoader = (value: NestedProperties): value is PropertiesLoader => {
  return value && typeof value === 'function';
};

export const asPropertiesArray = (value: NestedProperties, fallback: IPropertyMetadata[] | undefined): IPropertyMetadata[] | undefined => {
  return isPropertiesArray(value) ? value : fallback;
};

export const isFunctionMetadata = (value: IMemberMetadata): value is IFunctionMetadata => {
  return value && value.dataType === DataTypes.function;
};
export const isDataPropertyMetadata = (value: IMemberMetadata): value is IPropertyMetadata => {
  return value && value.dataType !== DataTypes.function;
};

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

export interface IContainerWithNestedProperties {
  properties: NestedProperties;
}

export interface IEntityMetadata extends IMetadata, IContainerWithNestedProperties, IHasEntityType {
  md5?: string;
  changeTime?: Date;
  aliases?: string[];
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