import { PhoneOutlined } from '@ant-design/icons';
import { Card, Spin, Timeline } from 'antd';
import React, { FC, useEffect, useMemo } from 'react';
import { useGet } from 'restful-react';
import { useDebouncedCallback } from 'use-debounce/lib';
import { EntitiesGetAllQueryParams, useEntitiesGetAll } from '../../apis/entities';
import { useGlobalState } from '../../providers';
import { ITimelineProps } from '../formDesigner/components/timeline/timeline';

export interface ITimelineComponentProps extends ITimelineProps {}

export const ShaTimeline: FC<ITimelineComponentProps> = ({
  dataSource,
  properties,
  items,
  entityType,
  customApiUrl,
  apiSource,
}) => {
  // debugger
  const useGetAll = apiSource === 'custom' ? useGet : useEntitiesGetAll;

  const { globalState } = useGlobalState();

  const getAllProps = apiSource === 'custom' ? { path: customApiUrl || '', lazy: true } : { lazy: true };
  const { refetch: fetchAllEntities, loading: isFetchingEntities, data, error: fetchEntitiesError } = useGetAll(
    getAllProps as any
  );

  const fetchEntities = (params: object) => {
    if (apiSource === 'custom') {
      fetchAllEntities();
    } else {
      fetchAllEntities(params);
    }
  };

  const queryParams = useMemo(() => {
    const _queryParams: EntitiesGetAllQueryParams = {
      entityType,
    };

    _queryParams.properties =
      typeof properties === 'string' ? `id ${properties}` : ['id', ...Array.from(new Set(properties || []))].join(' '); // Always include the `id` property/. Useful for deleting

    return _queryParams;
  }, [properties, globalState]);

  const debouncedRefresh = useDebouncedCallback(
    () => {
      fetchEntities({ queryParams });
    },
    // delay in ms
    300
  );

  useEffect(() => {
    debouncedRefresh();
  }, [queryParams]);

  return (
    <Spin spinning={isFetchingEntities}>
      <Timeline>
        {dataSource === 'form' &&
          items?.map((item) => {
            return <Timeline.Item>{item?.content}</Timeline.Item>;
          })}
        {dataSource === 'api' &&
          data?.result?.items?.map((item) => {
            return <TimelineItem title={item.fullName} description={item.firstName} />;
          })}
      </Timeline>
    </Spin>
  );
};

const TimelineItem = ({ title, description }) => {
  return (
    <Timeline.Item dot={<PhoneOutlined />}>
      <Card title={title}>
        <p>{description}</p>
      </Card>
    </Timeline.Item>
  );
};
