import { FormFullName } from "@/providers";
import { ArrayFormats, DataTypes, ObjectFormats } from "./dataTypes";
import { IDictionary } from "./shesha";
import { DataTypeInfo } from "@/providers/sheshaApplication/publicApi/entities/models";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { ConfigurationDto } from "@/providers/configurationItemsLoader/models";
import { IPropertyMetadata as IPublicPropertyMetadata,
  IMemberType as IPublicMemberType,
  IMemberMetadata as IPublicMemberMetadata,
} from "@/publicJsApis/metadata";

export interface IEntityTypeIdentifierQueryParams {
  name?: string | undefined;
  module?: string | undefined;
  entityType?: string | undefined;
}

export type IMemberType = IPublicMemberType;

export const isIMemberType = (value: object): value is IMemberType => {
  return isDefined(value) && "dataType" in value && typeof value.dataType === 'string' && isDefined(value.dataType);
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
  filePath?: string | undefined;
  metadata?: IModelMetadata;
}

export interface ITypeDefinitionBuilder {
  getEntityType: (typeId: ModelTypeIdentifier) => Promise<TypeAndLocation | undefined>;
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

export const hasTypeDefinition = (value: object): value is IHasTypeDefinition => isDefined(value) && "typeDefinitionLoader" in value && typeof value.typeDefinitionLoader === 'function';

export interface IMetadata extends Partial<IHasTypeDefinition> {
  dataType: string;
  name?: string | undefined;
  description?: string | undefined;
}

export interface IMemberMetadata extends IPublicMemberMetadata, Partial<IHasTypeDefinition> {

}

export const isIMemberMetadata = (value: object): value is IMemberMetadata => isDefined(value) && isIMemberType(value) && "path" in value && typeof (value.path) === 'string';
export const isPublicIMemberMetadata = (value: object): value is IPublicMemberMetadata => isIMemberMetadata(value);

export interface IHasItemsType {
  itemsType: IMemberType;
}

export const isIHasItemsType = (value: object): value is IHasItemsType => isDefined(value) && "itemsType" in value && typeof (value.itemsType) === 'object' && isDefined(value.itemsType) && isIMemberType(value.itemsType);

export interface IHasChildPropertiesMetadata {
  properties: IPropertyMetadata[];
}

export interface ModelTypeIdentifier {
  name: string;
  module: string | null; // TODO (V1):  review and make not nullable
}

export interface IHasEntityType {
  fullClassName?: string;
  entityType?: string | undefined;
  entityModule?: string | undefined;
}

export interface IHasFullyQualifiedEntityType {
  entityType: string;
  entityModule: string;
}

export const isHasFullyQualifiedEntityType = (value: IHasEntityType): value is IHasFullyQualifiedEntityType => isDefined(value) && typeof value.entityType === 'string' && typeof value.entityModule === 'string';

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
  return isDefined(value) && "inheritedFromEntityType" in value && typeof value.inheritedFromEntityType === 'string';
};

export interface IObjectProperty extends IPropertyMetadata, IHasTypeDefinition {
}

export interface IFunctionProperty extends IPropertyMetadata, IHasTypeDefinition {
}

export interface IEntityProperty extends IPropertyMetadata, IHasEntityType {
}

export const isIHasEntityType = (value: unknown): value is IHasEntityType => {
  return isDefined(value) && "entityType" in value && typeof value.entityType === 'string';
};

export interface IObjectReferencePropertyMetadata extends IMemberMetadata, IHasEntityType, IHasChildPropertiesMetadata {
}

export interface IEntityReferencePropertyMetadata extends IMemberMetadata, IHasEntityType, Partial<IHasChildPropertiesMetadata> {
}

export interface IEntityReferenceArrayPropertyMetadata extends IMemberMetadata, IHasEntityType, IHasItemsType {
}

export const isEntityReferencePropertyMetadata = (propMeta: IMemberMetadata): propMeta is IEntityReferencePropertyMetadata => {
  return isDefined(propMeta) && propMeta.dataType === DataTypes.entityReference;
};

export const isEntityReferenceArrayPropertyMetadata = (propMeta: IMemberMetadata): propMeta is IEntityReferenceArrayPropertyMetadata => {
  return isDefined(propMeta) && propMeta.dataType === DataTypes.array && [ArrayFormats.entityReference, ArrayFormats.manyToManyEntities].includes(propMeta.dataFormat ?? '');
};

export const isObjectReferencePropertyMetadata = (propMeta: IMemberMetadata): propMeta is IObjectReferencePropertyMetadata => {
  return isDefined(propMeta) && propMeta.dataType === DataTypes.object && propMeta.dataFormat === ObjectFormats.interface;
};

export interface IRefListPropertyMetadata extends IMemberMetadata {
  referenceListName?: string | null;
  referenceListModule?: string | null;
}

export const isRefListPropertyMetadata = (propMeta: IMemberMetadata): propMeta is IRefListPropertyMetadata => {
  return isDefined(propMeta) && propMeta.dataType === DataTypes.referenceListItem;
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
  isDefined(value) && "filter" in value && typeof (value.filter) === 'object' && !Array.isArray(value.filter) && value.filter !== null;

export interface INumberFormatting {
  thousandsSeparator?: string;
  customFormat?: string;
  step?: string;
}
export const isNumberFormatting = (value: object | null | undefined): value is INumberFormatting =>
  isDefined(value) && ("thousandsSeparator" in value || "customFormat" in value || "step" in value);

export interface IDecimalFormatting extends INumberFormatting {
  numDecimalPlaces?: number;
  showAsPercentage?: boolean;
}
export const isDecimalFormatting = (value: object | null | undefined): value is IDecimalFormatting =>
  isDefined(value) && ("numDecimalPlaces" in value || "showAsPercentage" in value);

export interface IPropertyMetadata extends IPublicPropertyMetadata {
  containerType?: string;
  functions?: IFunctionMetadata[] | null;
  itemsType?: IPropertyMetadata | undefined;
  isItemsType?: boolean;
}

export interface IArrayMetadata extends IMetadata {
  itemsType?: IPropertyMetadata;
}

export const isPropertiesArray = (value: NestedProperties | undefined): value is IPropertyMetadata[] => {
  return isDefined(value) && Array.isArray(value);
};

export const isPropertiesLoader = (value: NestedProperties | undefined): value is PropertiesLoader => {
  return isDefined(value) && typeof value === 'function';
};

export const asPropertiesArray = (value: NestedProperties, fallback: IPropertyMetadata[]): IPropertyMetadata[] => {
  return isPropertiesArray(value) ? value : fallback;
};

export const isFunctionMetadata = (value: IMemberMetadata): value is IFunctionMetadata => {
  return isDefined(value) && value.dataType === DataTypes.function;
};
export const isDataPropertyMetadata = (value: IMemberMetadata): value is IPropertyMetadata => {
  return isDefined(value) && value.dataType !== DataTypes.function;
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

export type IModelMetadata = IEntityMetadata | IObjectMetadata | IContextMetadata | IJsonEntityMetadata;

export const isEntityMetadata = (value: IModelMetadata): value is IEntityMetadata => {
  return Boolean(value) && value.dataType === DataTypes.entityReference;
};
export const isJsonEntityMetadata = (value: IModelMetadata | undefined): value is IJsonEntityMetadata => {
  // If module exists then it's json entity
  return isDefined(value) && value.dataType === DataTypes.object && "module" in value && typeof value.module === 'string' && !isNullOrWhiteSpace(value.module);
};
export const isObjectMetadata = (value: IModelMetadata | undefined): value is IObjectMetadata => {
  // If module doesn't exist then it's object
  return isDefined(value) && value.dataType === DataTypes.object && "module" in value && typeof value.module === 'string' && isNullOrWhiteSpace(value.module);
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

export const isApiEndpoint = (value: unknown): value is IApiEndpoint => {
  return isDefined(value) && typeof (value) === 'object' && "httpVerb" in value && typeof (value.httpVerb) === 'string' && "url" in value && typeof (value.url) === 'string';
};

export interface ISpecification {
  name: string;
  friendlyName: string;
  description?: string;
}
