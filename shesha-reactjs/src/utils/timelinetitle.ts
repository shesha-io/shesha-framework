import { TimelineChannels } from 'components/timeline/timelineItem/timelineChannels';

export const getTimelineTitle = (channel: number, extra: String = '') => {
  switch (channel) {
    case TimelineChannels.SMS:
      return 'sent a sms';
    case TimelineChannels.Call:
      return 'recieved a call';
    case TimelineChannels.Message:
      return 'Sent a direct message';
    case TimelineChannels.Email:
      return 'sent an email';
    case TimelineChannels.Note:
      return 'commented on this Service Request';
    case TimelineChannels.Asign:
      return 'has assigned case to ' + extra;
    default:
      return '';
  }
};
