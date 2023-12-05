import { useGet, UseGetProps } from '@/hooks/useGet';
import { IAjaxResponse, IAjaxResponseBase } from '@/interfaces/ajaxResponse';

/**
 * Represents event log item logged by Shesha.Scheduler.SignalR.SignalrAppender
 */
export interface EventLogItem {
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

export interface ScheduledJobExecutionGetEventLogItemsQueryParams {
  id?: string;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type EventLogItemListAjaxResponse = IAjaxResponse<EventLogItem[] | null>;

export type UseScheduledJobExecutionGetEventLogItemsProps = Omit<
  UseGetProps<EventLogItemListAjaxResponse, ScheduledJobExecutionGetEventLogItemsQueryParams, void>,
  'path'
>;

/**
 * Get event log items for the specified job execution
 */
export const useScheduledJobExecutionGetEventLogItems = (props: UseScheduledJobExecutionGetEventLogItemsProps) =>
  useGet<EventLogItemListAjaxResponse, IAjaxResponseBase, ScheduledJobExecutionGetEventLogItemsQueryParams, void>(
    `/api/services/Scheduler/ScheduledJobExecution/GetEventLogItems`,
    props
  );
