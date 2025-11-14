export interface IHasEntityType {
  entityType?: string;
  entityModule?: string | null;
}

export interface IMetadata {
  dataType: string;
  name?: string;
  description?: string;
  itemsType?: Omit<IPropertyMetadata, 'path'>;
}

export interface IMemberType {
  dataType: string | null;
  dataFormat?: string | null;
  baseType?: IMemberType;
}

export interface IMemberMetadata extends IMemberType {
  path: string;
  label?: string | null;
  description?: string | null;
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
  referenceListName?: string | null;
  referenceListModule?: string | null;
  /**
   * Child properties, applicable for complex data types (e.g. object, array)
   */
  properties?: NestedProperties;

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

  columnName?: string | null;
  createdInDb?: boolean;
  inheritedFromId?: string | null;
  formatting?: IHasDefaultEditor & (IHasFilter | IDecimalFormatting);
}

export type PropertiesPromise = Promise<IPropertyMetadata[]>;
export type PropertiesLoader = () => PropertiesPromise;

export type NestedProperties = IPropertyMetadata[] | PropertiesLoader | null;

export interface IContainerWithNestedProperties {
  properties: NestedProperties;
}

export interface IObjectMetadata extends IMetadata, IContainerWithNestedProperties {

}
