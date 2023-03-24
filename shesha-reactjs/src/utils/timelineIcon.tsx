import { CommentOutlined, InboxOutlined, MailOutlined, MessageOutlined, PhoneOutlined } from '@ant-design/icons';
import React from 'react';

export const getTimelineIcon = (type: string) => {
  switch (type) {
    case 'phone':
    case 'call':
      return <PhoneOutlined />;
      break;
    case 'sms':
      return <InboxOutlined />;
      break;
    case 'message':
      return <MessageOutlined />;
      break;
    case 'email':
      return <MailOutlined />;
      break;
    case 'note':
      return <CommentOutlined />;
    default:
      return null;
  }
};
