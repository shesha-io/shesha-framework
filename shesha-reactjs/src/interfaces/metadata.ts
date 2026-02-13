import { FormFullName } from "@/providers";
import { ArrayFormats, DataTypes, ObjectFormats } from "./dataTypes";
import { IDictionary } from "./shesha";
import { DataTypeInfo } from "@/providers/sheshaApplication/publicApi/entities/models";
import { isDefined } from "@/utils/nullables";
import { ConfigurationDto } from "@/providers/configurationItemsLoader/models";

export interface IEntityTypeIdentifierQueryParams {
  name?: string | undefined;
  module?: string | undefined;
  entityType?: string | undefined;
}

export interface IMemberType {
  dataType: string;
  dataFormat?: string | null;
  baseType?: IMemberType;
}

export const isIMemberType = (value: object): value is IMemberType => {
  const typed = value as IMemberType;
  return typed && typeof typed.dataType === 'string' && isDefined(typed.dataType);
};

export interface SourceFile {
  fileName: string;
  content: string;
}

export interface TypeDefinition {
  typeName: string;
  files: SourceFile[];
}

export interface TypeImport {
  typeName: string;
  filePath: string;
};

export interface GenericTypeDeclaration {
  /**
   * Final type declaration constructed taking into account all modifiers and generic types.
   * @example
   * { typeName: 'Date', typeDeclaration: 'Nullable<Date>' }
   */
  typeDeclaration?: string;
  /**
   * Type dependencies to be imported. Is used for generic types
   */
  dependencies?: TypeImport[];
}

export interface TypeAndLocation extends GenericTypeDeclaration {
  typeName: string;
  filePath?: string;
  metadata?: IModelMetadata;
}

export interface ITypeDefinitionBuilder {
  getEntityType: (typeId: ModelTypeIdentifier) => Promise<TypeAndLocation>;
  makeFormType: (formId: FormFullName, content: string) => TypeDefinition;
  makeFile: (fileName: string, content: string) => void;
};
export interface ITypeDefinitionLoadingContext {
  typeDefinitionBuilder: ITypeDefinitionBuilder;
}

export type TypeDefinitionLoader = (context: ITypeDefinitionLoadingContext) => Promise<TypeDefinition>;
export interface IHasTypeDefinition {
  typeDefinitionLoader: TypeDefinitionLoader;
}

export const hasTypeDefinition = (value: object): value is IHasTypeDefinition => value && "typeDefinitionLoader" in value && typeof value.typeDefinitionLoader === 'function';

export interface IMetadata extends Partial<IHasTypeDefinition> {
  dataType: string;
  name?: string | null;
  description?: string | null;
}

export interface IMemberMetadata extends IMemberType, Partial<IHasTypeDefinition> {
  path: string; // TODO: check usages, replace with `name` and move to a common ancestor with IMetadata
  label?: string | null;
  description?: string | null;
}

export const isIMemberMetadata = (value: object): value is IMemberMetadata => value && isIMemberType(value) && "path" in value && typeof (value.path) === 'string';
// DataTypeInfo

export interface IHasItemsType {
  itemsType: IMemberType;
}

export const isIHasItemsType = (value: object): value is IHasItemsType => value && "itemsType" in value && typeof (value.itemsType) === 'object' && isIMemberType(value.itemsType);

export interface IHasChildPropertiesMetadata {
  properties: IPropertyMetadata[];
}

export interface ModelTypeIdentifier {
  name: string;
  module: string;
}

export interface IHasEntityType {
  fullClassName?: string;
  entityType?: string;
  entityModule?: string | null;
}

export interface IHasFullEntityType {
  fullClassName: string;

  entityType: string;
  entityModule?: string | null;

  typeAccessor?: string;
  moduleAccessor: string | null;
}

export interface IHasInheritedFromEntityType {
  inheritedFromFullClassName?: string | null | undefined;
  inheritedFromEntityType?: string | null | undefined;
  inheritedFromEntityModule?: string | null | undefined;
}

export const isIHasInheritedFromEntityType = (value: unknown): value is IHasInheritedFromEntityType => {
  const typed = value as IHasInheritedFromEntityType;
  return typed && typeof typed.inheritedFromEntityType === 'string';
};


export interface IEntityProperty extends IPropertyMetadata, IHasEntityType {
}

export const isIHasEntityType = (value: unknown): value is IHasEntityType => {
  const typed = value as IHasEntityType;
  return typed && typeof typed.entityType === 'string';
};

export interface IObjectReferencePropertyMetadata extends IMemberMetadata, IHasEntityType, IHasChildPropertiesMetadata {
}

export interface IEntityReferencePropertyMetadata extends IMemberMetadata, IHasEntityType, Partial<IHasChildPropertiesMetadata> {
}

export interface IEntityReferenceArrayPropertyMetadata extends IMemberMetadata, IHasEntityType, IHasItemsType {
}

export const isEntityReferencePropertyMetadata = (propMeta: IMemberMetadata): propMeta is IEntityReferencePropertyMetadata => {
  return propMeta && propMeta.dataType === DataTypes.entityReference;
};

export const isEntityReferenceArrayPropertyMetadata = (propMeta: IMemberMetadata): propMeta is IEntityReferenceArrayPropertyMetadata => {
  return propMeta && propMeta.dataType === DataTypes.array && [ArrayFormats.entityReference, ArrayFormats.manyToManyEntities].includes(propMeta.dataFormat);
};

export const isObjectReferencePropertyMetadata = (propMeta: IMemberMetadata): propMeta is IObjectReferencePropertyMetadata => {
  return propMeta && propMeta.dataType === DataTypes.object && propMeta.dataFormat === ObjectFormats.interface;
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

// Formatting interfaces

export interface IHasDefaultEditor {
  defaultEditor?: string | null;
}

export interface IHasFilter {
  filter: object;
}
export const isHasFilter = (value: object | null | undefined): value is IHasFilter =>
  value && "filter" in value && typeof (value.filter) === 'object' && !Array.isArray(value.filter) && value.filter !== null;

export interface INumberFormatting {
  showThousandsSeparator?: boolean;
  customFormat?: string | null;
}
export const isHNumberFormatting = (value: object | null | undefined): value is INumberFormatting =>
  value && ("showThousandsSeparator" in value || "customFormat" in value);

export interface IDecimalFormatting extends INumberFormatting {
  numDecimalPlaces?: number | null;
  showAsPercentage?: boolean;
}
export const isDecimalFormatting = (value: object | null | undefined): value is IDecimalFormatting =>
  value && ("numDecimalPlaces" in value || "showAsPercentage" in value);

// -------

export interface IPropertyMetadata extends IMemberMetadata, IHasEntityType {
  containerType?: string;
  required?: boolean;
  readonly?: boolean;
  minLength?: number | null;
  maxLength?: number | null;
  min?: number | null;
  max?: number | null;
  validationMessage?: string | null;
  referenceListName?: string | null;
  referenceListModule?: string | null;
  /**
   * Child properties, applicable for complex data types (e.g. object, array)
   */
  properties?: NestedProperties | undefined;
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
  itemsType?: IPropertyMetadata | undefined;
  isItemsType?: boolean;

  columnName?: string | null;
  createdInDb?: boolean;
  inheritedFromId?: string | null;
  formatting?: IHasDefaultEditor & (IHasFilter | IDecimalFormatting);
}

export interface IArrayMetadata extends IMetadata {
  itemsType?: IPropertyMetadata;
}

export const isPropertiesArray = (value: NestedProperties | undefined): value is IPropertyMetadata[] => {
  return value && Array.isArray(value);
};

export const isPropertiesLoader = (value: NestedProperties | undefined): value is PropertiesLoader => {
  return value && typeof value === 'function';
};

export const asPropertiesArray = (value: NestedProperties, fallback: IPropertyMetadata[]): IPropertyMetadata[] => {
  return isPropertiesArray(value) ? value : fallback;
};

export const isFunctionMetadata = (value: IMemberMetadata): value is IFunctionMetadata => {
  return value && value.dataType === DataTypes.function;
};
export const isDataPropertyMetadata = (value: IMemberMetadata): value is IPropertyMetadata => {
  return value && value.dataType !== DataTypes.function;
};

export type ProperyDataType =
  | 'string' |
  'date' |
  'date-time' |
  'time' |
  'entity' |
  'file' |
  'number' |
  'reference-list-item' |
  'boolean' |
  'array' |
  'object' |
  'guid';

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
  list = 'list',
}

export interface IContainerWithNestedProperties {
  properties: NestedProperties;
}

export interface VariableDef {
  name: string;
  dataType: DataTypeInfo;
}

export interface IMethodMetadata {
  name: string;
  description?: string;
  isAsync: boolean;
  arguments?: VariableDef[];
  returnType?: DataTypeInfo;
};

export interface IHasMethods {
  methods?: IMethodMetadata[];
}

export interface IObjectMetadata extends IMetadata, IContainerWithNestedProperties, IHasMethods {

}

export interface IJsonEntityMetadata extends ConfigurationDto, Omit<IObjectMetadata, 'name' | 'description'>, IHasFullEntityType, IHasInheritedFromEntityType {
  md5?: string;
  changeTime?: Date;
  aliases?: string[];
}

export interface IEntityMetadata extends ConfigurationDto, Omit<IObjectMetadata, 'name' | 'description'>, IHasFullEntityType, IHasInheritedFromEntityType {
  md5?: string;
  changeTime?: Date;
  aliases?: string[];
  specifications: ISpecification[];
  apiEndpoints: IDictionary<IApiEndpoint>;
}

export interface IContextMetadata extends IMetadata, IContainerWithNestedProperties, IHasMethods {

}

export type IModelMetadata = IEntityMetadata | IObjectMetadata | IContextMetadata;

export const isEntityMetadata = (value: IModelMetadata): value is IEntityMetadata => {
  return Boolean(value) && value.dataType === DataTypes.entityReference;
};
export const isJsonEntityMetadata = (value: IModelMetadata): value is IJsonEntityMetadata => {
  const typed = value as IJsonEntityMetadata;
  // If module exists then it's json entity
  return Boolean(value) && value.dataType === DataTypes.object && typeof typed.module === 'string' && Boolean(typed.module);
};
export const isObjectMetadata = (value: IModelMetadata): value is IObjectMetadata => {
  const typed = value as IJsonEntityMetadata; // cast only to check module property
  // If module doesn't exist then it's object
  return Boolean(value) && value.dataType === DataTypes.object && !typed.module;
};
export const isContextMetadata = (value: IModelMetadata): value is IContextMetadata => {
  return Boolean(value) && value.dataType === DataTypes.context;
};

export const metadataHasNestedProperties = (value: IModelMetadata): value is IContainerWithNestedProperties & IModelMetadata => {
  return (isEntityMetadata(value) || isJsonEntityMetadata(value) || isObjectMetadata(value) || isContextMetadata(value)) &&
    Array.isArray((value as IContainerWithNestedProperties).properties);
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
