export interface IHasEntityType {
  entityType?: string | undefined;
  entityModule?: string | undefined;
}

export interface IMetadata {
  dataType: string;
  name?: string | null | undefined;
  description?: string | null | undefined;
  itemsType?: Omit<IPropertyMetadata, 'path'> | undefined;
}

export interface IMemberType {
  dataType: string;
  dataFormat?: string | null | undefined;
  baseType?: IMemberType | undefined;
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
  thousandsSeparator?: string;
  customFormat?: string | null;
  step?: string | null;
}

export interface IDecimalFormatting extends INumberFormatting {
  numDecimalPlaces?: number | null;
  showAsPercentage?: boolean;
}

export interface IPropertyMetadata extends IMemberMetadata, IHasEntityType {
  required?: boolean | undefined;
  readonly?: boolean | undefined;
  minLength?: number | null | undefined;
  maxLength?: number | null | undefined;
  min?: number | null | undefined;
  max?: number | null | undefined;
  validationMessage?: string | null | undefined;
  referenceListName?: string | undefined | undefined;
  referenceListModule?: string | undefined | undefined;
  /**
   * Child properties, applicable for complex data types (e.g. object, array)
   */
  properties?: NestedProperties | undefined;

  /**
   * If true, indicates that current property is a framework-related (e.g. Abp.Domain.Entities.ISoftDelete.IsDeleted, Abp.Domain.Entities.Auditing.IHasModificationTime.LastModificationTime)
   */
  isFrameworkRelated?: boolean | undefined;
  /**
   * If true, indicates that current property is nullable
   */
  isNullable?: boolean | undefined;
  prefix?: string | undefined;
  /**
   * If true, indicates that current property is visible. Treated as true by default
   */
  isVisible?: boolean | undefined;

  columnName?: string | null | undefined;
  createdInDb?: boolean | undefined;
  inheritedFromId?: string | null | undefined;
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
