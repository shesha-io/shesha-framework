import { CommentOutlined, MailOutlined, MessageOutlined, PhoneOutlined } from '@ant-design/icons';
import React from 'react';
import { TimelineChannels } from '../components/timeline/timelineItem/timelineChannels';

export const getTimelineIcon = (channel: number) => {
  switch (channel) {
    case TimelineChannels.SMS:
      return <MessageOutlined style={{ fontSize: '24px' }} />;
      break;
    case TimelineChannels.Call:
      return <PhoneOutlined style={{ fontSize: '24px' }} />;
      break;
    case TimelineChannels.Message:
      return <MessageOutlined style={{ fontSize: '24px' }} />;
      break;
    case TimelineChannels.Email:
      return <MailOutlined style={{ fontSize: '24px' }} />;
      break;
    case TimelineChannels.Note:
      return <CommentOutlined style={{ fontSize: '24px' }} />;
    default:
      return null;
  }
};
