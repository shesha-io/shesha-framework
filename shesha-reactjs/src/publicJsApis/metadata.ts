export interface IHasEntityType {
  entityType?: string | undefined;
  entityModule?: string | undefined;
}

export interface IMetadata {
  dataType: string;
  name?: string | undefined;
  description?: string | undefined;
  itemsType?: Omit<IPropertyMetadata, 'path'> | undefined;
}

export interface IMemberType {
  dataType: string;
  dataFormat?: string | null;
  baseType?: IMemberType;
}

export interface IMemberMetadata extends IMemberType {
  path: string;
  label?: string | null | undefined;
  description?: string | null | undefined;
}

export interface IHasDefaultEditor {
  defaultEditor?: string | null;
}

export interface IHasFilter {
  filter: object;
}

export interface INumberFormatting {
  showThousandsSeparator?: boolean;
  customFormat?: string | null;
}

export interface IDecimalFormatting extends INumberFormatting {
  numDecimalPlaces?: number | null;
  showAsPercentage?: boolean;
}

export interface IPropertyMetadata extends IMemberMetadata, IHasEntityType {
  required?: boolean;
  readonly?: boolean;
  minLength?: number | null;
  maxLength?: number | null;
  min?: number | null;
  max?: number | null;
  validationMessage?: string | null;
  referenceListName?: string | undefined;
  referenceListModule?: string | undefined;
  /**
   * Child properties, applicable for complex data types (e.g. object, array)
   */
  properties?: NestedProperties | undefined;

  /**
   * If true, indicates that current property is a framework-related (e.g. Abp.Domain.Entities.ISoftDelete.IsDeleted, Abp.Domain.Entities.Auditing.IHasModificationTime.LastModificationTime)
   */
  isFrameworkRelated?: boolean;
  /**
   * If true, indicates that current property is nullable
   */
  isNullable?: boolean;
  prefix?: string;
  /**
   * If true, indicates that current property is visible. Treated as true by default
   */
  isVisible?: boolean;

  columnName?: string | null;
  createdInDb?: boolean;
  inheritedFromId?: string | null;
  formatting?: IHasDefaultEditor & (IHasFilter | IDecimalFormatting) | undefined;
}

export type PropertiesPromise = Promise<IPropertyMetadata[]>;
export type PropertiesLoader = () => PropertiesPromise;

export type NestedProperties = IPropertyMetadata[] | PropertiesLoader | null;

export interface IContainerWithNestedProperties {
  properties: NestedProperties;
}

export interface IObjectMetadata extends IMetadata, IContainerWithNestedProperties {

}
