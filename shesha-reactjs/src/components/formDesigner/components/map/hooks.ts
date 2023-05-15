import { useFormData, useGlobalState } from 'providers';
import { useState } from 'react';
import { useGet } from 'restful-react';
import { ILayersEntity } from './interfaces';
import { evaluateFilters, getLayerMarkers, getMapRefetchParams, getResponseToState } from './utils';

interface IGetData {
  layerData: { [key in string]: any }[];
  layerMarkers: ILayersEntity[];
  fetchData: () => void;
}

export const useMetaMapMarker = (layers: ILayersEntity[]): IGetData => {
  const [{ layerData }, setState] = useState<Pick<IGetData, 'layerData'>>({
    layerData: [],
  });

  const { data: formData } = useFormData();

  const { globalState } = useGlobalState();

  const { refetch } = useGet({ path: '', lazy: true });

  const layerMarkers = getLayerMarkers(layers, layerData);

  const fetchData = () => {
    layers.forEach(async (item) => {
      const filter = evaluateFilters(item, formData, globalState, null);

      refetch(getMapRefetchParams(item, filter)).then((resp) =>
        setState((s) => ({ ...s, layerData: [...s.layerData, getResponseToState(item, resp?.result)] }))
      );
    });
  };

  return { layerData, layerMarkers, fetchData };
};
