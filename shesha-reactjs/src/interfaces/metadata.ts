import { IDictionary } from '..';

export interface IPropertyMetadata {
  isVisible?: boolean;
  required?: boolean;
  readonly?: boolean;
  minLength?: number | null;
  maxLength?: number | null;
  min?: number | null;
  max?: number | null;
  validationMessage?: string | null;
  path?: string | null;
  label?: string | null;
  description?: string | null;
  dataType?: string | null;
  dataFormat?: string | null;
  entityType?: string | null;
  referenceListName?: string | null;
  referenceListModule?: string | null;
  orderIndex?: number;
  groupName?: string | null;
  /**
   * If true, indicates that current property is a framework-related (e.g. Abp.Domain.Entities.ISoftDelete.IsDeleted, Abp.Domain.Entities.Auditing.IHasModificationTime.LastModificationTime)
   */
  isFrameworkRelated?: boolean;
  /**
   * Child properties, applicable for complex data types (e.g. object, array)
   */
  properties?: IPropertyMetadata[] | null;
  prefix?: string;
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

export interface IModelMetadata {
  type: string;
  dataType: string;
  name?: string;
  description?: string;
  properties: IPropertyMetadata[];
  specifications: ISpecification[];
  apiEndpoints: IDictionary<IApiEndpoint>;
}

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
