import { ClockCircleOutlined, FileOutlined } from '@ant-design/icons';
import { Timeline, Card } from 'antd';
import React, { FC } from 'react';
import { getTimelineIcon } from '../../../utils/timelineIcon';
import { ITimelineItemProps } from '../models';
import { getTimelineTitle } from 'utils/timelinetitle';

import '../styles/styles.less';
import { FileUpload, StoredFileProvider } from 'index';

export const TimelineItem: FC<ITimelineItemProps> = ({
  title,
  channel,
  toPerson,
  body,
  actionDate,
  attachments,
  ownerId,
}) => {
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
        <div className="sha-timeline-body">{body}</div>
        <div className="sha-timeline-attachment">
          {!!attachments &&
            attachments?.map((attachment) => (
              <StoredFileProvider baseUrl="" ownerId={ownerId} fileId={attachment.storedFileId}>
                <FileOutlined className="attachment-icon" />
                <FileUpload allowUpload={false} allowDelete={false} allowReplace={false} />
              </StoredFileProvider>
            ))}
        </div>
      </Card>
    </Timeline.Item>
  );
};
