import {
  CommentOutlined,
  InboxOutlined,
  MailOutlined,
  MessageOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { Card, Spin, Timeline } from 'antd';
import React, { FC, useEffect, useMemo, useState } from 'react';
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
  const useGetAll = apiSource === 'custom' ? useGet : useEntitiesGetAll;

  const { globalState } = useGlobalState();

  const getAllProps = apiSource === 'custom' ? { path: customApiUrl || '', lazy: true } : { lazy: true };
  const { refetch: fetchAllEntities, loading: isFetchingEntities, data } = useGetAll(getAllProps as any);

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
      typeof properties === 'string' ? `id ${properties}` : ['id', ...Array.from(new Set(properties || []))].join(' ');

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
          !!customApiUrl &&
          data?.result?.map(({ title, body, toPerson, actionDate }) => {
            return <TimelineItem title={title} toPerson={toPerson?._displayName} actionDate={actionDate} body={body} />;
          })}
      </Timeline>
    </Spin>
  );
};

export interface ITimelineItemProps {
  toPerson?: string;
  fromPerson?: string;
  body?: string;
  title?: string;
  description?: string;
  actionDate?: string;
  type?: string;
}

const TimelineItem: FC<ITimelineItemProps> = ({ title, type, toPerson, body, actionDate }) => {
  return (
    <Timeline.Item dot={<TimelineIcon type={type} />}>
      <Card
        extra={
          <small style={{ color: 'gray' }}>
            <ClockCircleOutlined />
            {actionDate}
          </small>
        }
        title={
          <div>
            <label>
              <strong style={{ textDecoration: 'underline' }}>{toPerson}</strong> {title}
            </label>
          </div>
        }
      >
        <p>{body}</p>
      </Card>
    </Timeline.Item>
  );
};

const TimelineIcon = ({ type }) => {
  const [icon, setIcon] = useState(<PlusCircleOutlined />);

  useEffect(() => {
    switch (type) {
      case 'phone':
      case 'call':
        setIcon(<PhoneOutlined />);
        break;
      case 'sms':
        setIcon(<InboxOutlined />);
        break;
      case 'message':
        setIcon(<MessageOutlined />);
        break;
      case 'email':
        setIcon(<MailOutlined />);
        break;
      case 'note':
        setIcon(<CommentOutlined />);
    }
  }, [type]);
  return icon;
};
