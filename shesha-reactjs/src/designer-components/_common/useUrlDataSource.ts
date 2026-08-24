import { useEffect, useMemo } from 'react';
import { useGet } from '@/hooks';
import { IAjaxResponse, isAjaxSuccessResponse } from '@/interfaces/ajaxResponse';
import { ILabelValue } from '@/designer-components/dropdown/model';
import { executeScriptSync } from '@/providers/form/utils';
import { isDefined, isNotNullOrWhiteSpace } from '@/utils/nullables';

/**
 * The shapes an options endpoint may return. A bare array and `{ items }` are both
 * accepted directly; either may also arrive wrapped in the standard ajax envelope.
 */
type RawOptionsPayload = ILabelValue<unknown>[] | { items: ILabelValue<unknown>[] };
type FetchResponse = IAjaxResponse<RawOptionsPayload> | RawOptionsPayload;

/** The subset of a component model that describes a `url` data source. */
export interface IUrlDataSource {
  dataSourceType?: string | undefined;
  /** The endpoint to read options from. Usually a JS setting evaluated before it reaches this hook. */
  dataSourceUrl?: string | undefined;
  /**
   * Optional script mapping the raw response to `{ label, value }` pairs. Receives the
   * unwrapped list as `data`.
   */
  reducerFunc?: string | undefined;
}

/**
 * Loads dropdown/radio/checkbox options from an arbitrary API endpoint.
 *
 * Returns `undefined` until a response has been unwrapped, which lets
 * `getDataSourceList` distinguish "not loaded yet" from "loaded and empty".
 *
 * `enabled` lets a caller that already holds resolved options keep the hook inert
 * instead of fetching the same URL a second time.
 */
export const useUrlDataSource = (model: IUrlDataSource, enabled: boolean = true): ILabelValue[] | undefined => {
  const { refetch, data } = useGet<FetchResponse>({ path: model.dataSourceUrl ?? '', lazy: true });

  const shouldFetch = enabled && model.dataSourceType === 'url' && isNotNullOrWhiteSpace(model.dataSourceUrl);

  useEffect(() => {
    if (!shouldFetch) return;
    refetch().catch((error) => {
      // A failed lookup leaves the group empty rather than breaking the whole form.
      console.error('Failed to fetch options from the configured Data Source URL', error);
    });
  }, [shouldFetch, refetch]);

  // Unwrap the payload: a bare array, `{ items }`, or either of those inside an ajax envelope
  // (including the `configuration.items` shape returned by ConfigurationItem endpoints).
  const fetchedData = useMemo<RawOptionsPayload | undefined>(() => {
    if (!data) return undefined;
    if (Array.isArray(data)) return data;
    if (typeof data === 'object' && 'success' in data) {
      const response = data as IAjaxResponse<RawOptionsPayload>;
      if (!isAjaxSuccessResponse(response)) return undefined;

      const result = response.result;
      if (isDefined(result) && !Array.isArray(result) && typeof result === 'object' && 'configuration' in result) {
        const config = (result as { configuration?: { items?: ILabelValue<unknown>[] } }).configuration;
        if (config?.items && Array.isArray(config.items)) return config.items;
      }
      return result;
    }
    if (typeof data === 'object' && Array.isArray((data as { items?: unknown }).items)) {
      return data as { items: ILabelValue<unknown>[] };
    }
    return undefined;
  }, [data]);

  return useMemo<ILabelValue[] | undefined>(() => {
    if (!fetchedData) return undefined;

    const list = Array.isArray(fetchedData)
      ? fetchedData
      : Array.isArray(fetchedData.items)
        ? fetchedData.items
        : [];

    if (isNotNullOrWhiteSpace(model.reducerFunc))
      return executeScriptSync<ILabelValue[]>(model.reducerFunc, { data: list });

    return list as ILabelValue[];
  }, [fetchedData, model.reducerFunc]);
};
