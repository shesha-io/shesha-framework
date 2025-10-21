
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-big-calendar';
import { evaluateFilters, getCalendarRefetchParams, getLayerMarkers, getResponseListToState } from './utils';
import { useGet, useMutate } from '@/hooks';

import { DataTypes } from '@/interfaces';
import { useLayerGroupConfigurator } from '@/providers/layersProvider';
import { evaluateString, useFormData, useGlobalState, useMetadataDispatcher, useNestedPropertyMetadatAccessor } from '@/index';
import { ICalendarLayersProps } from '@/providers/layersProvider/models';

interface IGetData {
  fetchData: () => void;
  fetchDefaultCalendarView: () => Promise<ISettingResponse | null>;
  layerData: { [key in string]: any }[];
  layerEvents: ICalendarLayersProps[];
  updateDefaultCalendarView: (value: string) => Promise<ISettingResponse | null>;
}

interface ISettingResponse {
  success: boolean;
  result: View;
}

type NestedPropertyMetadatAccessor = ReturnType<typeof useNestedPropertyMetadatAccessor>;


export const useMetaMapMarker = (layers: ICalendarLayersProps[]): IGetData => {
  const { refreshTrigger } = useLayerGroupConfigurator();
  const [state, setState] = useState<Pick<IGetData, 'layerData'>>({
    layerData: [],
  });

  const { mutate } = useMutate<any>();

  const { layerData } = state;

  const { data: formData } = useFormData();

  const { globalState } = useGlobalState();

  const { refetch } = useGet({ path: '', lazy: true });

  const layerMarkers = getLayerMarkers(layers, layerData) || [];

  const dispatcher = useMetadataDispatcher();

  const getMetadataAccessor = (modelType: string): NestedPropertyMetadatAccessor => {
    return (propertyPath: string) => modelType
      ? dispatcher.getPropertyMetadata({ dataType: DataTypes.entityReference, modelType, propertyPath })
      : Promise.resolve(null);
  };

  const layerWithMetadata = useMemo(() =>
    layers?.map(obj => ({
      ...obj,
      metadata: getMetadataAccessor(obj.entityType)
    })), [layers, dispatcher]
  );

  const fetchData = useCallback(() => {
    Promise.allSettled(
      layerWithMetadata?.map(async (item) => {
        try {
          const filter = await evaluateFilters(item, formData, globalState, item.metadata);
          const evalCustomUrl = evaluateString(item.customUrl, { data: formData, globalState });

          const response = await refetch(
            getCalendarRefetchParams({ ...item, customUrl: evalCustomUrl, overfetch: item.overfetch }, filter)
          );

          return response;
        } catch (error) {
          console.error(`Failed to fetch data for layer "${item.label || item.id}":`, error);
          // Return null or empty result so this layer is skipped without breaking others
          return null;
        }
      }),
    )
      .then((results) => {
        // Filter out rejected promises and null results from failed layers
        const successfulData = results
          .filter((result): result is PromiseFulfilledResult<any> =>
            result.status === 'fulfilled' && result.value != null
          )
          .map((result) => result.value);

        setState((s) => ({ ...s, layerData: getResponseListToState(successfulData) }));
      })
      .catch((error) => {
        // This should rarely happen with allSettled, but handle it just in case
        console.error('Unexpected error in fetchData:', error);
        setState((s) => ({ ...s, layerData: [] }));
      });
  }, [layerWithMetadata, formData, globalState, refetch, refreshTrigger]);


  const updateDefaultCalendarView = useCallback(async (value: string) => {
    try {
      const response = await mutate(
        {
          url: '/api/services/app/Settings/UpdateUserValue',
          httpVerb: 'POST',
        },
        {
          name: 'Calendar View',
          module: 'Shesha',
          value: value,
          datatype: 'string',
        }
      );

      if (response?.success) {
        return response;
      }
    } catch (error) {
      console.error('Error updating user settings:', error);
      return null;
    }
  }, [mutate]);


  const fetchDefaultCalendarView = useCallback(async (): Promise<ISettingResponse> => {
    try {
      const response = await mutate(
        {
          url: '/api/services/app/Settings/GetUserValue',
          httpVerb: 'POST'
        },
        {
          name: 'Calendar View',
          module: 'Shesha'
        }
      );

      if (response?.success && response?.result !== undefined) {
        return response;
      } else {
        console.warn('Unexpected response format or result missing');
        return null;  // Return null as a fallback
      }
    } catch (error) {
      console.error('Error fetching default calendar view:', error);
      return null;  // Return null in case of error
    }
  }, [mutate]);

  return {
    fetchData,
    layerMarkers,
    layerData,
    fetchDefaultCalendarView,
    updateDefaultCalendarView
  };
};

