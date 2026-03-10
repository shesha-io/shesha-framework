import { useGet, UseGetProps } from '@/hooks/useGet';
import { IAjaxResponse, IAjaxResponseBase } from '@/interfaces/ajaxResponse';
import * as RestfulShesha from '@/utils/fetchers';

/**
 * Indicate the source of the entity/property metadata
 */
export type MetadataSourceType = 1 | 2;

/**
 * Indicate the type of the entity metadata
 */
export type EntityConfigTypes = 1 | 2;

/**
 * Entity config DTO
 */
export interface EntityConfigDto {
  id?: string;
  friendlyName?: string | null;
  typeShortAlias?: string | null;
  tableName?: string | null;
  className?: string | null;
  namespace?: string | null;
  discriminatorValue?: string | null;
  source?: MetadataSourceType;
  entityConfigType?: EntityConfigTypes;
  generateAppService?: boolean;
  suppress?: boolean;
  module?: string | null;
  name?: string | null;
  label?: string | null;
  notImplemented?: boolean;
  moduleId?: string | null;
  description?: string | null;
}

export interface FormIdFullNameDto {
  name: string;
  module: string;
}

export type FormIdFullNameDtoAjaxResponse = IAjaxResponse<FormIdFullNameDto>;

export interface EntityConfigGetEntityConfigFormQueryParams {
  entityConfigName?: string;
  typeName?: string;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type entityConfigGetEntityConfigFormProps = Omit<
  RestfulShesha.GetProps<
    FormIdFullNameDtoAjaxResponse,
    IAjaxResponseBase,
    EntityConfigGetEntityConfigFormQueryParams,
    void
  >,
  'queryParams'
>;
export const entityConfigGetEntityConfigForm = (
  queryParams: EntityConfigGetEntityConfigFormQueryParams,
  props: entityConfigGetEntityConfigFormProps
) =>
  RestfulShesha.get<FormIdFullNameDtoAjaxResponse, IAjaxResponseBase, EntityConfigGetEntityConfigFormQueryParams, void>(
    `/api/services/app/EntityConfig/GetEntityConfigForm`,
    queryParams,
    props
  );

export interface EntityConfigDtoPagedResultDto {
  items?: EntityConfigDto[] | null;
  totalCount?: number;
}

export type EntityConfigDtoPagedResultDtoAjaxResponse = IAjaxResponse<EntityConfigDtoPagedResultDto>;

export interface EntityConfigGetMainDataListQueryParams {
  /**
   * Filter string in JsonLogic format
   */
  filter?: string;
  /**
   * Quick search string. Is used to search entities by text
   */
  quickSearch?: string;
  /**
   * List of specifications to apply on top of query
   */
  specifications?: string[];
  sorting?: string;
  skipCount?: number;
  maxResultCount?: number;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type UseEntityConfigGetMainDataListProps = Omit<
  UseGetProps<EntityConfigDtoPagedResultDtoAjaxResponse, EntityConfigGetMainDataListQueryParams, void>,
  'path'
>;

export const useEntityConfigGetMainDataList = (props: UseEntityConfigGetMainDataListProps) =>
  useGet<EntityConfigDtoPagedResultDtoAjaxResponse, IAjaxResponseBase, EntityConfigGetMainDataListQueryParams, void>(
    `/api/services/app/EntityConfig/GetMainDataList`,
    props
  );
