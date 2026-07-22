export type ProcessStatus = 'idle' | 'running' | 'success' | 'failed' | 'cancelled';

export enum LogLevel {
  INFO = 'info',
  ERROR = 'error',
  WARNING = 'warning',
  SUCCESS = 'success',
  DEBUG = 'debug',
}

export interface ILogEvent {
  id: string | number;
  message: string | null;
  timeStamp?: Date;
  level: LogLevel;
}

export interface IProcessMonitorApi {
  readonly status: ProcessStatus;
  readonly events: ILogEvent[];
  clearLog: () => void;
}
