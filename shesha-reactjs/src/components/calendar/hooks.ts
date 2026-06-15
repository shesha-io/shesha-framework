import { DataTypes, extractAjaxResponse, IAjaxResponse, IAnyObject } from '@/interfaces';
import { useHttpClient } from '@/providers';
import { evaluateString } from '@/providers/form/utils';
import { useFormData } from '@/providers/formContext';
import { useGlobalState } from '@/providers/globalState';
import { useLayerGroupConfigurator } from '@/providers/layersProvider';
import { ICalendarLayersProps } from '@/providers/layersProvider/models';
import { useNestedPropertyMetadatAccessor } from '@/providers/metadataDispatcher';
import { useMetadataDispatcher } from '@/providers/metadataDispatcher/provider';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';
import { isDefined } from '@/utils/nullables';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-big-calendar';
import { evaluateFilters, getCalendarDataUrl, getLayerEventsData } from './utils';
import { ILayerWithMetadata } from './interfaces';

interface IGetData {
  fetchData: () => void;
  fetchDefaultCalendarView: () => Promise<View | null>;
  layerData: Array<IAnyObject[] | null>;
  layerEvents: ICalendarLayersProps[];
  updateDefaultCalendarView: (value: string) => Promise<void>;
}

export type NestedPropertyMetadatAccessor = ReturnType<typeof useNestedPropertyMetadatAccessor>;

type GetUserSettingValueRequest = {
  module: string;
  name: string;
};
type UpdateUserSettingValueRequest = {
  module: string;
  name: string;
  value: string;
  datatype: string;
};

type LayerDataListResponse = {
  items: IAnyObject[];
};
type LayerDataResponse = LayerDataListResponse | IAnyObject;
const isLayerDataListResponse = (response: LayerDataResponse): response is LayerDataListResponse => 'items' in response && isDefined(response.items) && Array.isArray(response.items);

export const useCalendarLayers = (layers: ICalendarLayersProps[] | undefined): IGetData => {
  const { refreshTrigger } = useLayerGroupConfigurator();
  const [state, setState] = useState<Pick<IGetData, 'layerData'>>({
    layerData: [],
  });

  const httpClient = useHttpClient();

  const { layerData } = state;

  const { data: formData } = useFormData();

  const { globalState } = useGlobalState();

  const layerEvents = useMemo(() => getLayerEventsData(layers ?? [], layerData),
    [layers, layerData],
  );

  const dispatcher = useMetadataDispatcher();

  const getMetadataAccessor = useCallback((modelType: string | IEntityTypeIdentifier): NestedPropertyMetadatAccessor => {
    return (propertyPath: string) => modelType
      ? dispatcher.getPropertyMetadata({ dataType: DataTypes.entityReference, modelType, propertyPath })
      : Promise.resolve(null);
  }, [dispatcher]);

  const layerWithMetadata = useMemo<ILayerWithMetadata[]>(() =>
    (layers ?? []).map((obj) => ({
      ...obj,
      metadata: isDefined(obj.entityType) ? getMetadataAccessor(obj.entityType) : undefined,
    })), [layers, getMetadataAccessor],
  );

  const fetchData = useCallback(() => {
    Promise.allSettled(
      layerWithMetadata.map(async (item) => {
        try {
          const filter = await evaluateFilters(item, formData, globalState, item.metadata);
          const evalCustomUrl = evaluateString(item.customUrl, { data: formData, globalState });

          const url = getCalendarDataUrl({ ...item, customUrl: evalCustomUrl, overfetch: item.overfetch }, filter);
          const response = await httpClient.get<IAjaxResponse<LayerDataResponse>>(url);
          return extractAjaxResponse(response.data);
        } catch (error) {
          console.error(`Failed to fetch data for layer "${item.label || item.id}":`, error);
          // Return null or empty result so this layer is skipped without breaking others
          return null;
        }
      }),
    )
      .then((results) => {
        // Normalize results to maintain alignment with layers - preserve indices even for failed fetches
        const normalizedData = results.map<IAnyObject[] | null>((result) => {
          if (result.status === 'fulfilled' && isDefined(result.value)) {
            return isLayerDataListResponse(result.value)
              ? result.value.items
              : Array.isArray(result.value)
                ? result.value as IAnyObject[]
                : null;
          } else
            return null;
        });

        setState((s) => ({ ...s, layerData: normalizedData }));
      })
      .catch((error) => {
        // This should rarely happen with allSettled, but handle it just in case
        console.error('Unexpected error in fetchData:', error);
        setState((s) => ({ ...s, layerData: [] }));
      });
  }, [layerWithMetadata, formData, globalState, httpClient]);


  const updateDefaultCalendarView = useCallback(async (value: string): Promise<void> => {
    try {
      const response = await httpClient.post<IAjaxResponse<View | null>, UpdateUserSettingValueRequest>('/api/services/app/Settings/UpdateUserValue',
        {
          name: 'Calendar View',
          module: 'Shesha',
          value: value,
          datatype: 'string',
        });

      extractAjaxResponse(response.data);
    } catch (error) {
      console.error('Error updating user settings:', error);
    }
  }, [httpClient]);


  const fetchDefaultCalendarView = useCallback(async (): Promise<View | null> => {
    try {
      const response = await httpClient.post<IAjaxResponse<View | null>, GetUserSettingValueRequest>('/api/services/app/Settings/GetUserValue',
        { name: 'Calendar View', module: 'Shesha' });
      const result = extractAjaxResponse(response.data);
      return result;
    } catch (error) {
      console.error('Error fetching default calendar view:', error);
      return null; // Return null in case of error
    }
  }, [httpClient]);

  // Refetch data when refreshTrigger changes
  useEffect(() => {
    fetchData();
  }, [refreshTrigger, fetchData]);

  return {
    fetchData,
    layerEvents,
    layerData,
    fetchDefaultCalendarView,
    updateDefaultCalendarView,
  };
};

