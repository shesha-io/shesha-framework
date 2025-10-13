import { HubConnection } from '@microsoft/signalr';
import { Moment } from 'moment';
import { IFlagsSetters, IFlagsState } from '@/interfaces';
import { createNamedContext } from '@/utils/react';

export type IFlagProgressFlags = 'getExecutionLog';
/* NEW_IN_PROGRESS_FLAG_GOES_HERE */
export type IFlagSucceededFlags = 'getExecutionLog';
/* NEW_SUCCEEDED_FLAG_GOES_HERE */
export type IFlagErrorFlags = 'getExecutionLog';
/* NEW_ERROR_FLAG_GOES_HERE */
export type IFlagActionedFlags = '__DEFAULT__';

export interface IExecutionLogEvent {
  message?: string | null;
  timeStamp?: Moment;
  level?: string | null;
}

export interface IScheduledJobExecutionStateContext
  extends IFlagsState<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
  id?: string;
  executionLogEvents?: IExecutionLogEvent[];
  eventToAdd?: IExecutionLogEvent;
  hubConnection?: HubConnection;
}

export interface IScheduledJobExecutionActionsContext
  extends IFlagsSetters<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
  getExecutionLogRequest: () => void;
  getExecutionLogSuccess: (events: IExecutionLogEvent[]) => void;
  getExecutionLogError: () => void;

  downloadLogFileRequest: () => void;
  downloadLogFileSuccess: () => void;
  downloadLogFileError: () => void;
}

export const SCHEDULED_JOB_EXECUTION_CONTEXT_INITIAL_STATE: IScheduledJobExecutionStateContext = {
  isInProgress: {},
  succeeded: {},
  error: {},
  actioned: {},
  executionLogEvents: [],
};

export const ScheduledJobExecutionStateContext = createNamedContext<IScheduledJobExecutionStateContext>(
  SCHEDULED_JOB_EXECUTION_CONTEXT_INITIAL_STATE,
  "ScheduledJobExecutionStateContext",
);

export const ScheduledJobExecutionActionsContext = createNamedContext<IScheduledJobExecutionActionsContext>(undefined, "ScheduledJobExecutionActionsContext");
