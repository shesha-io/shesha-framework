import { createContext } from 'react';
import { IFlagsState, IFlagsSetters } from 'models';
import { HubConnection } from '@microsoft/signalr';
import { Moment } from 'moment';

export type IFlagProgressFlags = 'getExecutionLog';
/* NEW_IN_PROGRESS_FLAG_GOES_HERE */
export type IFlagSucceededFlags = 'getExecutionLog';
/* NEW_SUCCEEDED_FLAG_GOES_HERE */
export type IFlagErrorFlags = 'getExecutionLog';
/* NEW_ERROR_FLAG_GOES_HERE */
export type IFlagActionedFlags = '__DEFAULT__' /* NEW_ACTIONED_FLAG_GOES_HERE */;

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

  /* NEW_ACTION_ACTION_DECLARATION_GOES_HERE */
}

export const SCHEDULED_JOB_EXECUTION_CONTEXT_INITIAL_STATE: IScheduledJobExecutionStateContext = {
  isInProgress: {},
  succeeded: {},
  error: {},
  actioned: {},
  executionLogEvents: [],
};

export const ScheduledJobExecutionStateContext = createContext<IScheduledJobExecutionStateContext>(
  SCHEDULED_JOB_EXECUTION_CONTEXT_INITIAL_STATE
);

export const ScheduledJobExecutionActionsContext = createContext<IScheduledJobExecutionActionsContext>(undefined);
