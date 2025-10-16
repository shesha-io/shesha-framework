import { useGet, UseGetProps } from '@/hooks/useGet';
import { IAjaxResponse, IAjaxResponseBase } from '@/interfaces/ajaxResponse';
import * as RestfulShesha from '@/utils/fetchers';
import { IDictionary } from '..';

/**
 * Indicate the source of the entity/property metadata
 */
export type MetadataSourceType = 1 | 2;

export interface PropertyMetadataDto {
  cascadeCreate?: boolean;
  cascadeUpdate?: boolean;
  cascadeDeleteUnreferenced?: boolean;
  isVisible?: boolean;
  required?: boolean;
  readonly?: boolean;
  minLength?: number | null;
  maxLength?: number | null;
  min?: number | null;
  max?: number | null;
  /**
   * Equivalent to Audited attribute on the property
   */
  audited?: boolean;
  /**
   * Validation RegularExpression
   */
  regExp?: string | null;
  /**
   * Validation message
   */
  validationMessage?: string | null;
  path: string;
  label?: string | null;
  description?: string | null;
  dataType: string;
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
   * If true, indicates that current property is nullable
   */
  isNullable?: boolean;
  /**
   * Child properties (applicable for complex objects)
   */
  properties?: PropertyMetadataDto[] | null;
  itemsType?: PropertyMetadataDto;
  source?: MetadataSourceType;
}

/**
 * API endpoint DTO
 */
export interface ApiEndpointDto {
  /**
   * Http verb (get/post/put etc)
   */
  httpVerb: string;
  /**
   * Url
   */
  url: string;
}

/**
 * DTO of the specification that can be applied on top of the entity query
 */
export interface SpecificationDto {
  /**
   * Name. Unique for all specifications in the application
   */
  name?: string | null;
  /**
   * Friendly name
   */
  friendlyName?: string | null;
  /**
   * Description
   */
  description?: string | null;
}

/**
 * Metadata DTO
 */
export interface MetadataDto {
  /**
   * Data type
   */
  dataType: string;
  /**
   * Module
   */
  module?: string | null;

  /**
   * Type accessor
   */
  typeAccessor?: string | null;
  /**
   * Module accessor
   */
  moduleAccessor?: string | null;
  /**
   * Propeties
   */
  properties: PropertyMetadataDto[];
  /**
   * Specifications, applicable for entities
   */
  specifications?: SpecificationDto[] | null;
  /**
   * Default API endpoints.
   * key - operation name (create/read/update/delete etc.)
   * value - endpoint DTO (url and http verb)
   */
  apiEndpoints?: IDictionary<ApiEndpointDto> | null;

  className: string;
  aliases?: string[];
}

export type MetadataDtoAjaxResponse = IAjaxResponse<MetadataDto>;

export interface MetadataGetQueryParams {
  container?: string;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type metadataGetProps = Omit<
  RestfulShesha.GetProps<MetadataDtoAjaxResponse, IAjaxResponseBase, MetadataGetQueryParams, void>,
  'queryParams'
>;
export const metadataGet = (queryParams: MetadataGetQueryParams, props: metadataGetProps) =>
  RestfulShesha.get<MetadataDtoAjaxResponse, IAjaxResponseBase, MetadataGetQueryParams, void>(
    `/api/services/app/Metadata/Get`,
    queryParams,
    props
  );

export type UseMetadataGetProps = Omit<UseGetProps<MetadataDtoAjaxResponse, MetadataGetQueryParams, void>, 'path'>;
export const useMetadataGet = (props: UseMetadataGetProps) =>
  useGet<MetadataDtoAjaxResponse, IAjaxResponseBase, MetadataGetQueryParams, void>(
    `/api/services/app/Metadata/Get`,
    props
  );
