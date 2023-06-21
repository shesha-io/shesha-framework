import { ClockCircleOutlined } from '@ant-design/icons';
import { Timeline, Card } from 'antd';
import React, { FC } from 'react';
import { getTimelineIcon } from '../../../utils/timelineIcon';
import { ITimelineItemProps } from '../models';
import { getTimelineTitle } from 'utils/timelinetitle';

export const TimelineItem: FC<ITimelineItemProps> = ({ title, channel, toPerson, body, actionDate }) => {
  return (
    <Timeline.Item dot={getTimelineIcon(channel)}>
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
              <strong style={{ textDecoration: 'underline' }}>{toPerson}</strong>{' '}
              {!!channel ? getTimelineTitle(channel) : title}
            </label>
          </div>
        }
      >
        <p>{body}</p>
      </Card>
    </Timeline.Item>
  );
};
