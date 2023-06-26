import { Empty, Spin, Timeline } from 'antd';
import React, { FC, useEffect, useMemo } from 'react';
import { useGet } from 'hooks';
import { useDebouncedCallback } from 'use-debounce';
import { EntitiesGetAllQueryParams, useEntitiesGetAll } from 'apis/entities';
import { useGlobalState } from 'providers';
import { ITimelineProps } from './models';
import { TimelineItem } from './timelineItem';
import moment from 'moment';

export const ShaTimeline: FC<ITimelineProps> = ({ properties, ownerId, entityType, customApiUrl, apiSource }) => {
  const useGetAll = apiSource === 'custom' ? useGet : useEntitiesGetAll;

  //timeline icons
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

  const timelineData: any[] = apiSource === 'custom' ? data?.result : data?.result?.items;
  //sort values
  const sortedTimelineData = timelineData?.sort((item1, item2) => {
    const actionDataA = item1?.actionData;
    const actionDataB = item2?.actionData;

    if (actionDataA < actionDataB) {
      return -1;
    }
    if (actionDataA > actionDataB) {
      return 1;
    }
    return 0;
  });

  useEffect(() => {
    debouncedRefresh();
  }, [queryParams]);

  return (
    <Spin spinning={isFetchingEntities}>
      {(!sortedTimelineData?.length && <Empty description="Empty timeline" />) || (
        <Timeline>
          {sortedTimelineData?.map(({ title, body, fromPerson, actionDate, channel }) => {
            return (
              <TimelineItem
                title={title}
                toPerson={fromPerson?._displayName}
                channel={channel}
                actionDate={moment(actionDate).format('DD/MM/YYYY HH:mm')}
                body={body}
              />
            );
          })}
        </Timeline>
      )}
    </Spin>
  );
};
