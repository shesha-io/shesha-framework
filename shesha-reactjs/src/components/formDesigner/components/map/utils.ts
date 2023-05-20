import camelCaseKeys from 'camelcase-keys';
import { IAnyObject, ICoords } from 'interfaces';
import { LatLngExpression } from 'leaflet';
import { isEmpty } from 'lodash';
import { evaluateDynamicFilters } from 'providers/dataTable/utils';
import { NestedPropertyMetadatAccessor } from 'providers/metadataDispatcher/contexts';
import { parseIntOrDefault } from '../imageAnnotation/utilis';
import { DEFAULT_LAT, DEFAULT_LNG } from './constants';
import { ILayersEntity, IMapMarker, IMapProps } from './interfaces';

export const evaluateFilters = (
  item: any,
  formData: any,
  globalState: IAnyObject,
  propertyMetadataAccessor: NestedPropertyMetadatAccessor
) => {
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
    ],
    propertyMetadataAccessor
  );
  //@ts-ignore everything is in place here
  if (response.find((f) => f?.unevaluatedExpressions?.length)) return '';

  return JSON.stringify(response[0]?.expression) || '';
};

export const getCenter = ({ defaultLat, defaultLng }: IMapProps) => ({
  lat: parseIntOrDefault(defaultLat, DEFAULT_LAT),
  lng: parseIntOrDefault(defaultLng, DEFAULT_LNG),
});

export const getLayerMarkers = (layers: ILayersEntity[], layerData: { [x: string]: any }[]): ILayersEntity[] =>
  layers.map((item, index) => {
    const { boundary, layertype } = item;
    const layerDataItem = layerData[index] || [];

    if (layertype === 'polygon') {
      return {
        ...item,
        markers: layerDataItem.filter((i) => i?.[boundary]).map((j) => JSON.parse(j?.[boundary])),
      };
    }

    return getLayerMarkerPoints(item, layerDataItem);
  });

export const getLayerMarkerPoints = (
  item: ILayersEntity,
  layerDataItem: { [x: string]: any }[] | { [x: string]: any }
) => {
  let markers;
  const { icon, iconColor, latitude, longitude } = item;

  if (Array.isArray(layerDataItem)) {
    markers = layerDataItem
      .filter((i) => i?.[latitude] && i?.[longitude])
      .map((j) => ({
        color: iconColor,
        icon,
        position: {
          lat: j?.[latitude],
          lng: j?.[longitude],
        },
      }));
  } else {
    markers = [
      { icon, color: iconColor, position: { lat: layerDataItem?.[latitude], lng: layerDataItem?.[longitude] } },
    ];
  }

  return { ...item, markers };
};

export const getLayerMarkerOptions = (layers: ILayersEntity[]) =>
  (layers || [])
    .filter((item) => item.visible)
    .map((i) => ({
      label: i.label,
      value: i.id,
      disabled: !i.allowChangeVisibility,
    }));

export const getMapContainerStyle = ({ width, height }: IMapProps) => ({
  width: width ? `${width}%` : '100%',
  height: height ? `${height}vh` : '100vh',
});

export const getMapRefetchParams = (param: ILayersEntity, filter: string) => {
  const { customUrl, dataSource, entityType, ownerId } = param;

  if (dataSource === 'custom') {
    return {
      path: customUrl + `?id=${ownerId}`,
    };
  }

  return {
    path: `/api/services/app/Entities/GetAll`,
    queryParams: {
      entityType,
      properties: getQueryProperties(param),
      maxResultCount: 100,
      filter,
    },
  };
};

export const getMarkerPoints = (layerMarker: ILayersEntity[], checked: string[]) =>
  checked
    .map(
      (item) => layerMarker.find(({ id, layertype }) => id === item && layertype === 'points')?.markers as IMapMarker[]
    )
    .filter((i) => i)
    .reduce((prev, curr) => [...(prev || []), ...(curr || [])], []);

export const getPolygonPoints = (layerMarker: ILayersEntity[], checked: string[]) =>
  checked
    .map(
      (item) =>
        layerMarker.find(({ id, layertype }) => id === item && layertype === 'polygon')?.markers as LatLngExpression[]
    )
    .reduce((prev, curr) => [...(prev || []), ...(curr || [])], []);

export const getQueryProperties = ({ boundary, layertype, latitude, longitude }: ILayersEntity) =>
  ['id', ...Array.from(new Set(layertype === 'points' ? [longitude, latitude] : [boundary] || []))].join(' ');

export const getResponseToState = (
  { dataSource }: ILayersEntity,
  result: { [key in string]: any } | { [key in string]: any }[]
) => (dataSource === 'custom' ? result : result?.['items']);

export const getSinglePoint = ({ color, icon, latitude: lat, longitude: lng }: IMapProps) => [
  {
    color,
    icon,
    position: {
      lat,
      lng,
    } as ICoords,
  },
];

export const getZoom = ({ defaultZoom }: IMapProps) => parseIntOrDefault(defaultZoom, 6);
