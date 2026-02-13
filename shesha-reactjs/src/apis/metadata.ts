import { useGet, UseGetProps } from '@/hooks/useGet';
import { IAjaxResponse, IAjaxResponseBase } from '@/interfaces/ajaxResponse';
import * as RestfulShesha from '@/utils/fetchers';
import { IDictionary } from '..';
import { ConfigurationDto } from '@/providers/configurationItemsLoader/models';
import { IApiEndpoint, IEntityTypeIdentifierQueryParams, ISpecification } from '@/interfaces/metadata';

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
  containerType?: string | null;
  entityType?: string | null;
  entityModule?: string | null;
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
  properties?: PropertyMetadataDto[];
  itemsType?: PropertyMetadataDto;
  source?: MetadataSourceType;
}

/**
 * Metadata DTO
 */
export interface MetadataDto extends ConfigurationDto {
  /**
   * Data type
   */
  dataType: string;
  /**
   * Type accessor
   */
  typeAccessor?: string;
  /**
   * Module accessor
   */
  moduleAccessor: string | null;
  /**
   * Propeties
   */
  properties: PropertyMetadataDto[];
  /**
   * Specifications, applicable for entities
   */
  specifications: ISpecification[];
  /**
   * Default API endpoints.
   * key - operation name (create/read/update/delete etc.)
   * value - endpoint DTO (url and http verb)
   */
  apiEndpoints: IDictionary<IApiEndpoint>;

  fullClassName: string;

  aliases?: string[];

  md5?: string;

  inheritedFromModule?: string | null | undefined;

  inheritedFromName?: string | null | undefined;

  inheritedFromFullClassName?: string | null | undefined;
}

export type MetadataDtoAjaxResponse = IAjaxResponse<MetadataDto>;

export interface MetadataGetQueryParams extends IEntityTypeIdentifierQueryParams {
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
