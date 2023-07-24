import { TimelineChannels } from 'components/timeline/timelineItem/timelineChannels';

export const getTimelineTitle = (channel: number) => {
  switch (channel) {
    case TimelineChannels.SMS:
      return 'sent a sms';
    case TimelineChannels.Message:
      return 'Sent a direct message';
    case TimelineChannels.Email:
      return 'sent an email';
    case TimelineChannels.Note:
      return 'Commented on this Service Request';
    default:
      return '';
  }
};
