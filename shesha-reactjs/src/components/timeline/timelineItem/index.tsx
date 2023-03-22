import { ClockCircleOutlined } from '@ant-design/icons';
import { Timeline, Card } from 'antd';
import React, { FC } from 'react';
import { getTimelineIcon } from '../../../utils/timelineIcon';
import { ITimelineItemProps } from '../models';

export const TimelineItem: FC<ITimelineItemProps> = ({ title, type, toPerson, body, actionDate }) => {
  return (
    <Timeline.Item dot={getTimelineIcon(type)}>
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
