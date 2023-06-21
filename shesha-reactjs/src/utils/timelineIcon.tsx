import { CommentOutlined, InboxOutlined, MailOutlined, MessageOutlined } from '@ant-design/icons';
import { TimelineChannels } from 'components/timeline/timelineItem/timelineChannels';
import React from 'react';

export const getTimelineIcon = (channel: number) => {
  switch (channel) {
    case TimelineChannels.SMS:
      return <InboxOutlined />;
      break;
    case TimelineChannels.Message:
      return <MessageOutlined />;
      break;
    case TimelineChannels.Email:
      return <MailOutlined />;
      break;
    case TimelineChannels.Note:
      return <CommentOutlined />;
    default:
      return null;
  }
};
