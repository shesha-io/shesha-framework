import { IAjaxResponse, IAjaxResponseBase } from '@/interfaces/ajaxResponse';
import * as RestfulShesha from '@/utils/fetchers';

/**
 * Generic entity reference Dto
 */
export interface GuidNullableEntityReferenceDto {
  id?: string | null;
  /**
   * Entity display name
   */
  _displayName?: string | null;
  /**
   * Entity class name
   */
  _className?: string | null;
}

/**
 * Dto of the Shesha.Domain.ReferenceListItem
 */
export interface ReferenceListItemDto {
  id: string;
  item: string | null;
  itemValue: number;
  description: string | null;
  orderIndex: number;
  /**
   * Color associated with the item
   */
  color: string | null;
  /**
   * Icon associated with the item
   */
  icon: string | null;
  /**
   * Short alias
   */
  shortAlias: string | null;
}

export interface ReferenceListGetByNameQueryParams {
  /**
   * Module name
   */
  module?: string;
  /**
   * Reference list name
   */
  name?: string;
  /**
   * MD5 of the reference list. Is used for the client side caching.
   * If specified, the application should compare the value received from the client with a local cache and return http response with code 304 (not changed)
   */
  md5?: string;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

/**
 * Status of the Shesha.Domain.ConfigurationItem
 */
export type ConfigurationItemVersionStatus = 1 | 2 | 3 | 4 | 5;

/**
 * Reference list full(with items) DTO
 */
export interface ReferenceListWithItemsDto {
  id?: string;
  /**
   * Module Id
   */
  moduleId?: string | null;
  /**
   * Origin id
   */
  originId?: string | null;
  /**
   * Module name
   */
  module?: string | null;
  name: string;
  label?: string | null;
  description?: string | null;
  hardLinkToApplication?: boolean;
  namespace?: string | null;
  noSelectionValue?: number | null;
  suppress?: boolean;
  items: ReferenceListItemDto[];
  /**
   * Cache MD5, is used for client-side caching
   */
  cacheMd5?: string | null;
}

export type ReferenceListWithItemsDtoAjaxResponse = IAjaxResponse<ReferenceListWithItemsDto>;

export type referenceListGetByNameProps = Omit<
  RestfulShesha.GetProps<
    ReferenceListWithItemsDtoAjaxResponse,
    IAjaxResponseBase,
    ReferenceListGetByNameQueryParams,
    void
  >,
  'queryParams'
>;
