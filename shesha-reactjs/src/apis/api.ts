import { useGet, UseGetProps } from '@/hooks/useGet';
import { IAjaxErrorResponse, IAjaxResponse } from '@/interfaces/ajaxResponse';

/**
 * Generic DTO of the simple autocomplete item
 */
export interface AutocompleteItemDto {
  value?: string | null;
  displayText?: string | null;
}

export type AutocompleteItemDtoListAjaxResponse = IAjaxResponse<AutocompleteItemDto[] | null>;

export interface ApiEndpointsQueryParams {
  term?: string;
  verb?: string;
  maxResultCount?: number;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type UseApiEndpointsProps = Omit<
  UseGetProps<AutocompleteItemDtoListAjaxResponse, ApiEndpointsQueryParams, void>,
  'path'
>;

export const useApiEndpoints = (props: UseApiEndpointsProps) =>
  useGet<AutocompleteItemDtoListAjaxResponse, IAjaxErrorResponse, ApiEndpointsQueryParams, void>(
    `/api/services/app/Api/Endpoints`,
    props
  );
