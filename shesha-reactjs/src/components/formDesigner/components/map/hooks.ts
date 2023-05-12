import { EntitiesGetAllQueryParams, useEntitiesGetAll } from 'apis/entities';
import { useGet } from 'restful-react';
import { LayerTypeKeys } from './interfaces';

type MetaMapMarkerData = { [key: string]: any } | { items: { [key: string]: any }[] };

interface IGetData {
  fetchData: (props: IFetchData) => Promise<MetaMapMarkerData>;
}

interface IFetchData {
  dataSource: string;
  entityType: string;
  longitude: string;
  latitude: string;
  evaluatedFilters: string;
  customUrl: string;
  ownerId: string;
  layertype: LayerTypeKeys;
  boundary: string;
}

export const useMetaMapMarker = (): IGetData => {
  const getAllProps = (customUrl: string, ownerId: string, dataSource: string) =>
    dataSource === 'custom' ? { path: customUrl + `?id=${ownerId}` || '', lazy: true } : { lazy: true };

  const fetchData = async (props: IFetchData) => {
    const { dataSource, entityType, longitude, latitude, evaluatedFilters, customUrl, ownerId, layertype, boundary } =
      props;

    const useGetAll = dataSource === 'custom' ? useGet : useEntitiesGetAll;

    const { refetch: fetchAllEntities, data } = useGetAll(getAllProps(customUrl, ownerId, dataSource) as any);

    const fetchEntities = async (params: object) => {
      if (dataSource === 'custom') {
        await fetchAllEntities();
      } else {
        await fetchAllEntities(params);
      }
    };

    const queryParams = {
      entityType,
      properties: [
        'id',
        ...Array.from(new Set(layertype === 'points' ? [longitude, latitude] : [boundary] || [])),
      ].join(' '),
      maxResultCount: 100,
      filter: evaluatedFilters,
    } as EntitiesGetAllQueryParams;

    await fetchEntities({ queryParams });

    return dataSource === 'custom' ? data?.result : (data?.result?.items as MetaMapMarkerData);
  };

  return { fetchData };
};
