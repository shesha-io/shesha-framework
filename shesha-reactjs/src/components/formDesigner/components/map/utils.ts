import { IAnyObject } from 'interfaces';
import { isEmpty } from 'lodash';
import { evaluateDynamicFilters } from 'providers/dataTable/utils';
import { useEffect, useMemo } from 'react';
import { useMapEvents } from 'react-leaflet';
import camelCaseKeys from 'camelcase-keys';
import { useGet } from 'restful-react';
import { EntitiesGetAllQueryParams, useEntitiesGetAll } from 'apis/entities';
import { useDebouncedCallback } from 'use-debounce';
import { ILayerMarker, LayerTypeKeys } from './interfaces';
import { useDeepCompareEffect } from 'react-use';

export const mapClicked = async (event) => {
  console.log(event.latlng.lat, event.latlng.lng);
};

export const markerClicked = (marker) => {
  console.log(marker.position.lat, marker.position.lng);
};

export const MapContent = ({ onClick }) => {
  useMapEvents({
    click: (event) => onClick(event),
  });
  return null;
};

export const evaluateFilters = (item: any, formData: any, globalState: IAnyObject) => {
  return useMemo(() => {
    if (!item.filters) return '';

    const localFormData = !isEmpty(formData) ? camelCaseKeys(formData, { deep: true, pascalCase: true }) : formData;

    const response = evaluateDynamicFilters(
      [{ expression: item.filters } as any],
      [
        {
          match: 'data',
          data: localFormData,
        },
        {
          match: 'globalState',
          data: globalState,
        },
      ]
    );
    //@ts-ignore everything is in place here
    if (response.find((f) => f?.unevaluatedExpressions?.length)) return '';

    return JSON.stringify(response[0]?.expression) || '';
  }, [item.filters, formData, globalState]);
};

export const useGetData = (
  dataSource: string,
  entityType: string,
  longitude: string,
  latitude: string,
  evaluatedFilters: string,
  customUrl: string,
  ownerId: string,
  layertype: LayerTypeKeys,
  boundary: string
) => {
  const useGetAll = dataSource === 'custom' ? useGet : useEntitiesGetAll;

  const getAllProps =
    dataSource === 'custom' ? { path: customUrl + `?id=${ownerId}` || '', lazy: true } : { lazy: true };

  const { refetch: fetchAllEntities, data } = useGetAll(getAllProps as any);

  const fetchEntities = (params: object) => {
    if (dataSource === 'custom') {
      fetchAllEntities();
    } else {
      fetchAllEntities(params);
    }
  };

  const queryParams = () => {
    const result: EntitiesGetAllQueryParams = {
      entityType,
    };

    result.properties = [
      'id',
      ...Array.from(new Set(layertype === 'points' ? [longitude, latitude] : [boundary] || [])),
    ].join(' ');

    result.maxResultCount = 100;
    result.filter = evaluatedFilters;

    return result;
  };

  const mapData = dataSource === 'custom' ? data?.result : data?.result?.items;

  useDeepCompareEffect(() => {
    fetchEntities({ queryParams });
  }, [queryParams]);
  return {mapData};
};

const getLayerValue = (id: string, marker: ILayerMarker[]): ILayerMarker => marker.find((x) => x.id === id);

export const getPolgonAndMarkerData = (checkedValues: string[], marker: ILayerMarker[], key: LayerTypeKeys) => {
  let result = [];
  console.log('CHECKED VALUES', checkedValues);
  checkedValues.forEach((value) => {
    result = [...result, ...getMapPoints(value, marker, key)];
  });
  console.log('LOG:: pointer result', result);
  return result;
};

export const getMapPoints = (item: string, marker: ILayerMarker[], key: LayerTypeKeys) => {
  const checkedValue = getLayerValue(item, marker);

  console.log('LOG:: pointer checked value', checkedValue, item);
  if (Array.isArray(checkedValue?.markers)) {
    if (checkedValue.layertype == 'polygon' && key === 'polygon') {
      console.log('LOG:: polygon checked value', checkedValue);
      return [...checkedValue.markers];
    } else if (checkedValue.layertype == 'points' && key === 'points') {
      return [
        ...checkedValue.markers.map((object) => {
          console.log('object', object);
          return { ...object, color: checkedValue.iconColor, icon: checkedValue.icon, size: checkedValue.iconSize };
        }),
      ];
    } else {
      return [];
    }
  } else {
    console.log('LOG:: single point', checkedValue);
    checkedValue.markers.color = checkedValue.iconColor as string;
    checkedValue.markers.icon = checkedValue.icon;
    checkedValue.markers.size = checkedValue.iconSize;

    return [checkedValue.markers];
  }
};
