import { Moment } from "moment";

export type ProcessStatus = 'idle' | 'running' | 'success' | 'failed' | 'cancelled';

export type ProcessMonitorSubscriptionType = 'events' | 'status';

export type ProcessMonitorSubscriptionCallback = () => void;

export interface IProcessMonitor {
    readonly status: ProcessStatus;
    readonly events: ILogEvent[];
    startAsync: () => Promise<void>;
    stopAsync: () => Promise<void>;
    downloadLogAsync: () => Promise<void>;
    subscribe(type: ProcessMonitorSubscriptionType, callback: ProcessMonitorSubscriptionCallback): () => void;
    clearLog: () => void;
}

export interface EventLogItemDto {
  /**
   * Logged message
   */
  message?: string | null;
  /**
   * Event timestamp
   */
  timeStamp?: string;
  /**
   * Level (info/warn/error)
   */
  level?: string | null;
}

export enum LogLevel {
    INFO = 'info',
    ERROR = 'error',
    WARNING = 'warning',
    SUCCESS = 'success',
    SECTION = 'section',
    GROUP = 'group',
    DEBUG = 'debug',
    COMMAND = 'command'
}

export interface ILogEvent {
  id: string | number;
  message: string | null;
  timeStamp?: Moment;
  level: LogLevel;
}

export interface SignalLogEventDto {
  message: string | null;
  timeStamp?: string;
  level: string;
}

export interface ProcessStateDto {
  status: ProcessStatus;
  log: string | null;
}