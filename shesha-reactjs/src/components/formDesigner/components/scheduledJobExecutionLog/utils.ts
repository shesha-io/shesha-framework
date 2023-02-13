import { IExecutionLogEvent } from '../../../../providers/scheduledJobExecution/contexts';

export interface IScheduledJobExecutionLog {
  id: string;
}

export interface IJobExecutionContext {
  hubEvents: string[];
}

export interface IHubEvent {
  formattedEvent: string;
  message: string;
  level: string;
  timeStamp: string;
}

export interface IScheduledJobExecutionLogDisplay {
  hubEvents: IExecutionLogEvent[];
}

export const getLogText = (hubEvents: IExecutionLogEvent[]) =>
  hubEvents.length > 0
    ? hubEvents.map(e => `${e.timeStamp.format('DD/MM/YYYY HH:mm:ss.SSS')}: ${e.message}`).join('\r')
    : ' ';
