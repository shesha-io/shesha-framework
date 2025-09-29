
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-big-calendar';
import { evaluateFilters, getCalendarRefetchParams, getLayerMarkers, getResponseListToState } from './utils';
import { useGet, useMutate } from '@/hooks';

import { DataTypes } from '@/interfaces';
import { useLayerGroupConfigurator } from '@/providers/calendar';
import { evaluateString, useFormData, useGlobalState, useMetadataDispatcher, useNestedPropertyMetadatAccessor } from '@/index';
import { ICalendarLayersProps } from '@/providers/calendar/models';

interface IGetData {
  fetchData: () => void;
  fetchDefaultCalendarView: () => Promise<ISettingResponse>;
  layerData: { [key in string]: any }[];
  layerMarkers: ICalendarLayersProps[];
  updateDefaultCalendarView: (value: string) => Promise<any>;
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
    })), [layers]
  );

  const fetchData = useCallback(() => {
    Promise.all(
      layerWithMetadata?.map(
        (item) =>
          new Promise(async (resolve, reject) => {
            const filter = await evaluateFilters(item, formData, globalState, item.metadata);

            const evalCustomUrl = evaluateString(item.customUrl, { data: formData, globalState });

            refetch(getCalendarRefetchParams({ ...item, customUrl: evalCustomUrl, overfetch: item.overfetch }, filter))
              .then(resolve)
              .catch(reject);
          }),
      ),
    )
      .then((resp) => setState((s) => ({ ...s, layerData: getResponseListToState(resp) })))
      .catch(() => setState((s) => ({ ...s, layerData: [] })));
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
        return null;  // Return an empty string as a fallback
      }
    } catch (error) {
      console.error('Error fetching default calendar view:', error);
      return null;  // Return an empty string in case of error
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

