import { HubConnectionBuilder } from '@microsoft/signalr';
import { useScheduledJobExecutionGetEventLogItems } from 'api/scheduledJobExecution';
import { BASE_URL } from 'api/utils/constants';
import axios from 'axios';
import FileSaver from 'file-saver';
import moment from 'moment';
import React, { FC, PropsWithChildren, useContext, useEffect, useReducer } from 'react';
import { getFlagSetters } from '../utils/flagsSetters';
import {
  addExecutionLogEventAction,
  downloadLogFileErrorAction,
  downloadLogFileRequestAction,
  downloadLogFileSuccessAction,
  getExecutionLogErrorAction,
  getExecutionLogRequestAction,
  getExecutionLogSuccessAction,
  setHubConnectionAction,
  /* NEW_ACTION_IMPORT_GOES_HERE */
} from './actions';
import {
  IExecutionLogEvent,
  ScheduledJobExecutionActionsContext,
  ScheduledJobExecutionStateContext,
  SCHEDULED_JOB_EXECUTION_CONTEXT_INITIAL_STATE,
} from './contexts';
import { scheduledJobExecutionReducer } from './reducer';

export interface IScheduledJobExecutionProviderProps {
  id: string;
  baseUrl?: string;
}

const idIsEmpty = (id) => !id && id !== '00000000-0000-0000-0000-000000000000';

const ScheduledJobExecutionProvider: FC<PropsWithChildren<IScheduledJobExecutionProviderProps>> = ({
  children,
  id,
  //baseUrl = 'http://sheshabackend.boxfusion.co.za',
}) => {
  const [state, dispatch] = useReducer(scheduledJobExecutionReducer, {
    ...SCHEDULED_JOB_EXECUTION_CONTEXT_INITIAL_STATE,
    id,
  });

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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const { result } = executionLogResponse;
        const events = result.map(
          (e) => ({ message: e.message, timeStamp: moment(e.timeStamp), level: e.level } as IExecutionLogEvent)
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
      const connection = new HubConnectionBuilder().withUrl(`${BASE_URL}/signalr-appender`).build();
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
        alert(err);
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
      url: `${BASE_URL}/api/services/Scheduler/ScheduledJobExecution/DownloadLogFile?id=${id}`,
      method: 'GET',
      responseType: 'blob',
    })
      .then((response) => {
        dispatch(downloadLogFileSuccessAction());
        const fileName = response.headers['content-disposition']?.split('filename=')[1] ?? 'logfile.log';
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
