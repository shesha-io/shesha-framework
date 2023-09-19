import { HubConnection } from '@microsoft/signalr';
import { createAction } from 'redux-actions';
import { IExecutionLogEvent, IScheduledJobExecutionStateContext } from './contexts';

export enum ScheduledJobExecutionActionEnums {
  GetExecutionLogRequest = 'GET_EXECUTION_LOG_REQUEST',
  GetExecutionLogSuccess = 'GET_EXECUTION_LOG_SUCCESS',
  GetExecutionLogError = 'GET_EXECUTION_LOG_ERROR',
  AddExecutionLogEvent = 'ADD_EXECUTION_LOG_EVENT',
  SetHubConnection = 'SET_HUB_CONNECTION',
  DownloadLogFileRequest = 'DOWNLOAD_LOG_FILE_REQUEST',
  DownloadLogFileSuccess = 'DOWNLOAD_LOG_FILE_SUCCESS',
  DownloadLogFileError = 'DOWNLOAD_LOG_FILE_ERROR',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const getExecutionLogRequestAction = createAction<IScheduledJobExecutionStateContext>(
  ScheduledJobExecutionActionEnums.GetExecutionLogRequest,
  () => ({})
);
export const getExecutionLogSuccessAction = createAction<IScheduledJobExecutionStateContext, IExecutionLogEvent[]>(
  ScheduledJobExecutionActionEnums.GetExecutionLogSuccess,
  (executionLogEvents) => ({ executionLogEvents })
);
export const getExecutionLogErrorAction = createAction<IScheduledJobExecutionStateContext>(
  ScheduledJobExecutionActionEnums.GetExecutionLogError,
  () => ({})
);
export const addExecutionLogEventAction = createAction<IScheduledJobExecutionStateContext, IExecutionLogEvent>(
  ScheduledJobExecutionActionEnums.AddExecutionLogEvent,
  (eventToAdd) => ({ eventToAdd })
);
export const setHubConnectionAction = createAction<IScheduledJobExecutionStateContext, HubConnection>(
  ScheduledJobExecutionActionEnums.SetHubConnection,
  (hubConnection) => ({ hubConnection })
);

export const downloadLogFileRequestAction = createAction<IScheduledJobExecutionStateContext>(
  ScheduledJobExecutionActionEnums.DownloadLogFileRequest,
  () => ({})
);
export const downloadLogFileSuccessAction = createAction<IScheduledJobExecutionStateContext>(
  ScheduledJobExecutionActionEnums.DownloadLogFileSuccess,
  () => ({})
);
export const downloadLogFileErrorAction = createAction<IScheduledJobExecutionStateContext>(
  ScheduledJobExecutionActionEnums.DownloadLogFileError,
  () => ({})
);
/* NEW_ACTION_GOES_HERE */
