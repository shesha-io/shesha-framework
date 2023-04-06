import { Empty, Spin, Timeline } from 'antd';
import React, { FC, useEffect, useMemo } from 'react';
import { useGet } from 'restful-react';
import { useDebouncedCallback } from 'use-debounce';
import { EntitiesGetAllQueryParams, useEntitiesGetAll } from '../../apis/entities';
import { useGlobalState } from '../../providers';
import { ITimelineProps } from './models';
import { TimelineItem } from './timelineItem';

export const ShaTimeline: FC<ITimelineProps> = ({ properties, ownerId, entityType, customApiUrl, apiSource }) => {
  const useGetAll = apiSource === 'custom' ? useGet : useEntitiesGetAll;

  const { globalState } = useGlobalState();
  const getAllProps =
    apiSource === 'custom' ? { path: customApiUrl + `?id=${ownerId}` || '', lazy: true } : { lazy: true };
  const { refetch: fetchAllEntities, loading: isFetchingEntities, data } = useGetAll(getAllProps as any);

  const fetchEntities = (params: object) => {
    if (apiSource === 'custom') {
      fetchAllEntities();
    } else {
      fetchAllEntities(params);
    }
  };

  const queryParams = useMemo(() => {
    const result: EntitiesGetAllQueryParams = {
      entityType,
    };

    result.properties =
      typeof properties === 'string' ? `id ${properties}` : ['id', ...Array.from(new Set(properties || []))].join(' ');

    return result;
  }, [properties, globalState]);

  const debouncedRefresh = useDebouncedCallback(() => {
    fetchEntities({ queryParams });
  }, 300);

  const timelineData = apiSource === 'custom' ? data?.result : data?.result?.items;

  useEffect(() => {
    debouncedRefresh();
  }, [queryParams]);

  return (
    <Spin spinning={isFetchingEntities}>
      {(!timelineData?.length && <Empty description="Empty timeline" />) || (
        <Timeline>
          {timelineData?.map(({ title, body, toPerson, actionDate, type }) => {
            return (
              <TimelineItem
                title={title}
                toPerson={toPerson?._displayName}
                type={type}
                actionDate={actionDate}
                body={body}
              />
            );
          })}
        </Timeline>
      )}
    </Spin>
  );
};
