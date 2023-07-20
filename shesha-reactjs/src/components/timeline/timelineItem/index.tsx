import { ClockCircleOutlined } from '@ant-design/icons';
import { Timeline, Card } from 'antd';
import React, { FC } from 'react';
import { getTimelineIcon } from '../../../utils/timelineIcon';
import { ITimelineItemProps } from '../models';
import { getTimelineTitle } from 'utils/timelinetitle';

import '../styles/styles.less';

export const TimelineItem: FC<ITimelineItemProps> = ({ title, channel, toPerson, body, actionDate }) => {
  return (
    <Timeline.Item className="sha-timeline-item" dot={getTimelineIcon(channel)}>
      <Card
        extra={
          <small className="sha-timeline-extra">
            <ClockCircleOutlined /> {' ' + actionDate}
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
        <div className="timeline-body">{body}</div>
      </Card>
    </Timeline.Item>
  );
};
