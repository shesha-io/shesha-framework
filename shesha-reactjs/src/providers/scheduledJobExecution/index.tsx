import React, { FC, useReducer, useContext, PropsWithChildren, useEffect } from 'react';
import { scheduledJobExecutionReducer } from './reducer';
import {
  ScheduledJobExecutionActionsContext,
  ScheduledJobExecutionStateContext,
  SCHEDULED_JOB_EXECUTION_CONTEXT_INITIAL_STATE,
  IExecutionLogEvent,
} from './contexts';
import { getFlagSetters } from '../utils/flagsSetters';
import {
  getExecutionLogRequestAction,
  getExecutionLogSuccessAction,
  getExecutionLogErrorAction,
  addExecutionLogEventAction,
  setHubConnectionAction,
  downloadLogFileRequestAction,
  downloadLogFileSuccessAction,
  downloadLogFileErrorAction,
  /* NEW_ACTION_IMPORT_GOES_HERE */
} from './actions';
import { useScheduledJobExecutionGetEventLogItems } from '../../apis/scheduledJobExecution';
import moment from 'moment';
import { HubConnectionBuilder } from '@microsoft/signalr';
import axios from 'axios';
import FileSaver from 'file-saver';
import { useSheshaApplication } from '../sheshaApplication';
import { getFileNameFromResponse } from '../../utils/fetchers';

export interface IScheduledJobExecutionProviderProps {
  id: string;
  baseUrl?: string;
}

const idIsEmpty = id => !Boolean(id) && id !== '00000000-0000-0000-0000-000000000000';

const ScheduledJobExecutionProvider: FC<PropsWithChildren<IScheduledJobExecutionProviderProps>> = ({
  children,
  id,
}) => {
  const [state, dispatch] = useReducer(scheduledJobExecutionReducer, {
    ...SCHEDULED_JOB_EXECUTION_CONTEXT_INITIAL_STATE,
    id,
  });
  const { backendUrl } = useSheshaApplication();
  const { httpHeaders: headers } = useSheshaApplication();

  const {
    loading: isFetchingExecutionLog,
    refetch: fetchExecutionLogHttp,
    data: executionLogResponse,
  } = useScheduledJobExecutionGetEventLogItems({
    lazy: true,
    queryParams: {
      id,
    },
  });

  useEffect(() => {
    if (!isFetchingExecutionLog && !idIsEmpty(id)) {
      fetchExecutionLogHttp();
    }
  }, [id]);

  useEffect(() => {
    if (!isFetchingExecutionLog) {
      if (executionLogResponse) {
        // @ts-ignore
        const { result } = executionLogResponse;
        const events = result.map(
          e => ({ message: e.message, timeStamp: moment(e.timeStamp), level: e.level } as IExecutionLogEvent)
        );

        dispatch(getExecutionLogSuccessAction(events));
      }
    }
  }, [isFetchingExecutionLog]);

  // Set the Hub Connection on mount.
  useEffect(() => {
    if (idIsEmpty(id)) return;
    // Set the initial SignalR Hub Connection.
    const createHubConnection = async () => {
      // Build new Hub Connection, url is currently hard coded.
      const connection = new HubConnectionBuilder().withUrl(`${backendUrl}/signalr-appender`).build();
      try {
        connection.on('LogEvent', (data: IExecutionLogEvent) => {
          const event = { ...data, timeStamp: moment(data.timeStamp) } as IExecutionLogEvent;
          dispatch(addExecutionLogEventAction(event));
        });
        connection.on('JobStarted', () => {
          //setJobStarted(true);
        });
        connection.on('JobFinished', () => {
          //setJobFinished(true);
        });

        await connection.start().then(() => connection.invoke('JoinGroup', id));
      } catch (err) {
        console.error(err);
      }

      dispatch(setHubConnectionAction(connection));
    };

    createHubConnection();
  }, [id]);

  const getExecutionLogRequest = () => {
    dispatch(getExecutionLogRequestAction());
  };

  const getExecutionLogSuccess = (events: IExecutionLogEvent[]) => {
    dispatch(getExecutionLogSuccessAction(events));
  };

  const getExecutionLogError = () => {
    dispatch(getExecutionLogErrorAction());
  };

  const downloadLogFileRequest = () => {
    dispatch(downloadLogFileRequestAction());

    axios({
      url: `${backendUrl}/api/services/Scheduler/ScheduledJobExecution/DownloadLogFile?id=${id}`,
      method: 'GET',
      responseType: 'blob',
      headers,
    })
      .then(response => {
        dispatch(downloadLogFileSuccessAction());
        const fileName = getFileNameFromResponse(response) ?? 'logfile.log';
        FileSaver.saveAs(new Blob([response.data]), fileName);
      })
      .catch(() => {
        dispatch(downloadLogFileErrorAction());
      });
  };

  const downloadLogFileSuccess = () => {
    dispatch(downloadLogFileSuccessAction());
  };

  const downloadLogFileError = () => {
    dispatch(downloadLogFileErrorAction());
  };

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  return (
    <ScheduledJobExecutionStateContext.Provider value={state}>
      <ScheduledJobExecutionActionsContext.Provider
        value={{
          ...getFlagSetters(dispatch),
          getExecutionLogRequest,
          getExecutionLogSuccess,
          getExecutionLogError,
          downloadLogFileRequest,
          downloadLogFileSuccess,
          downloadLogFileError,
          /* NEW_ACTION_GOES_HERE */
        }}
      >
        {children}
      </ScheduledJobExecutionActionsContext.Provider>
    </ScheduledJobExecutionStateContext.Provider>
  );
};

function useScheduledJobExecutionState() {
  const context = useContext(ScheduledJobExecutionStateContext);

  if (context === undefined) {
    throw new Error('useScheduledJobExecutionState must be used within a ScheduledJobExecutionProvider');
  }

  return context;
}

function useScheduledJobExecutionActions() {
  const context = useContext(ScheduledJobExecutionActionsContext);

  if (context === undefined) {
    throw new Error('useScheduledJobExecutionActions must be used within a ScheduledJobExecutionProvider');
  }

  return context;
}

function useScheduledJobExecution() {
  return { ...useScheduledJobExecutionState(), ...useScheduledJobExecutionActions() };
}

export {
  ScheduledJobExecutionProvider,
  useScheduledJobExecutionState,
  useScheduledJobExecutionActions,
  useScheduledJobExecution,
};
