/* Generated by restful-react */

import React from 'react';
import { Get, GetProps, useGet, UseGetProps, Mutate, MutateProps, useMutate, UseMutateProps } from 'restful-react';

import * as RestfulShesha from '../utils/fetchers';
export const SPEC_VERSION = 'v1';
export interface AjaxResponseBase {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
}

export interface ErrorInfo {
  code?: number;
  message?: string | null;
  details?: string | null;
  validationErrors?: ValidationErrorInfo[] | null;
}

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

export interface EventLogItemListAjaxResponse {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
  result?: EventLogItem[] | null;
}

export interface FileStreamResultAjaxResponse {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
  result?: string | null;
}

/**
 * Generic entity reference Dto
 */
export interface GuidNullableEntityReferenceDto {
  id?: string | null;
  /**
   * Entity display name
   */
  _displayName?: string | null;
  /**
   * Entity class name
   */
  _className?: string | null;
}

/**
 * Generic entity reference Dto
 */
export interface Int64NullableEntityReferenceDto {
  id?: number | null;
  /**
   * Entity display name
   */
  _displayName?: string | null;
  /**
   * Entity class name
   */
  _className?: string | null;
}

export type JToken = JToken[];

export interface MetaDto {
  className?: string | null;
}

export interface ProxyDynamicDtoScheduledJobExecutionGuid {
  id?: string;
  _jObject?: {
    [key: string]: JToken;
  } | null;
  startedBy?: number | null;
  lastModifierUserId?: number | null;
  deletionTime?: string | null;
  deleterUserId?: number | null;
  logFilePath?: string | null;
  status?: number | null;
  creationTime?: string | null;
  trigger?: string | null;
  errorMessage?: string | null;
  startedOn?: string | null;
  parentExecution?: string | null;
  creatorUserId?: number | null;
  job?: string | null;
  lastModificationTime?: string | null;
  isDeleted?: boolean | null;
  finishedOn?: string | null;
  _className?: MetaDto;
}

export interface ReferenceListItemValueDto {
  item?: string | null;
  itemValue?: number | null;
}

export interface ScheduledJobExecutionDto {
  id?: string;
  /**
   * Datetime of the execution start
   */
  startedOn?: string | null;
  /**
   * Datetime of the execution finish
   */
  finishedOn?: string | null;
  startedBy?: Int64NullableEntityReferenceDto;
  job?: GuidNullableEntityReferenceDto;
  trigger?: GuidNullableEntityReferenceDto;
  /**
   * Error message
   */
  errorMessage?: string | null;
  status?: ReferenceListItemValueDto;
}

export interface ScheduledJobExecutionDtoAjaxResponse {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
  result?: ScheduledJobExecutionDto;
}

export interface ScheduledJobExecutionDtoPagedResultDto {
  items?: ScheduledJobExecutionDto[] | null;
  totalCount?: number;
}

export interface ScheduledJobExecutionDtoPagedResultDtoAjaxResponse {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
  result?: ScheduledJobExecutionDtoPagedResultDto;
}

export interface ScheduledJobExecutionGraphQLDataResult {
  startedBy?: number | null;
  lastModifierUserId?: number | null;
  deletionTime?: string | null;
  deleterUserId?: number | null;
  logFilePath?: string;
  status?: number | null;
  creationTime?: string | null;
  trigger?: string | null;
  errorMessage?: string;
  startedOn?: string | null;
  parentExecution?: string | null;
  creatorUserId?: number | null;
  job?: string | null;
  lastModificationTime?: string | null;
  isDeleted?: boolean | null;
  finishedOn?: string | null;
  _className?: MetaDto;
  _jObject?: {
    [key: string]: JToken;
  };
  id?: string;
}

export interface ScheduledJobExecutionGraphQLDataResultAjaxResponse {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
  result?: ScheduledJobExecutionGraphQLDataResult;
}

/**
 * NOTE: shape of the response depends on the `properties` argument
 */
export interface ScheduledJobExecutionPagedResultDtoGraphQLDataResult {
  totalCount?: number;
  items?: ProxyDynamicDtoScheduledJobExecutionGuid[];
}

export interface ScheduledJobExecutionPagedResultDtoGraphQLDataResultAjaxResponse {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
  result?: ScheduledJobExecutionPagedResultDtoGraphQLDataResult;
}

export interface ValidationErrorInfo {
  message?: string | null;
  members?: string[] | null;
}

export interface ScheduledJobExecutionGetEventLogItemsQueryParams {
  id?: string;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type ScheduledJobExecutionGetEventLogItemsProps = Omit<
  GetProps<EventLogItemListAjaxResponse, AjaxResponseBase, ScheduledJobExecutionGetEventLogItemsQueryParams, void>,
  'path'
>;

/**
 * Get event log items for the specified job execution
 */
export const ScheduledJobExecutionGetEventLogItems = (props: ScheduledJobExecutionGetEventLogItemsProps) => (
  <Get<EventLogItemListAjaxResponse, AjaxResponseBase, ScheduledJobExecutionGetEventLogItemsQueryParams, void>
    path={`/api/services/Scheduler/ScheduledJobExecution/GetEventLogItems`}
    {...props}
  />
);

export type UseScheduledJobExecutionGetEventLogItemsProps = Omit<
  UseGetProps<EventLogItemListAjaxResponse, AjaxResponseBase, ScheduledJobExecutionGetEventLogItemsQueryParams, void>,
  'path'
>;

/**
 * Get event log items for the specified job execution
 */
export const useScheduledJobExecutionGetEventLogItems = (props: UseScheduledJobExecutionGetEventLogItemsProps) =>
  useGet<EventLogItemListAjaxResponse, AjaxResponseBase, ScheduledJobExecutionGetEventLogItemsQueryParams, void>(
    `/api/services/Scheduler/ScheduledJobExecution/GetEventLogItems`,
    props
  );

export type scheduledJobExecutionGetEventLogItemsProps = Omit<
  RestfulShesha.GetProps<
    EventLogItemListAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionGetEventLogItemsQueryParams,
    void
  >,
  'queryParams'
>;
/**
 * Get event log items for the specified job execution
 */
export const scheduledJobExecutionGetEventLogItems = (
  queryParams: ScheduledJobExecutionGetEventLogItemsQueryParams,
  props: scheduledJobExecutionGetEventLogItemsProps
) =>
  RestfulShesha.get<
    EventLogItemListAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionGetEventLogItemsQueryParams,
    void
  >(`/api/services/Scheduler/ScheduledJobExecution/GetEventLogItems`, queryParams, props);

export interface ScheduledJobExecutionDownloadLogFileQueryParams {
  /**
   * Id of the scheduled job execution
   */
  id?: string;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type ScheduledJobExecutionDownloadLogFileProps = Omit<
  GetProps<FileStreamResultAjaxResponse, AjaxResponseBase, ScheduledJobExecutionDownloadLogFileQueryParams, void>,
  'path'
>;

/**
 * Download log file of the job execution
 */
export const ScheduledJobExecutionDownloadLogFile = (props: ScheduledJobExecutionDownloadLogFileProps) => (
  <Get<FileStreamResultAjaxResponse, AjaxResponseBase, ScheduledJobExecutionDownloadLogFileQueryParams, void>
    path={`/api/services/Scheduler/ScheduledJobExecution/DownloadLogFile`}
    {...props}
  />
);

export type UseScheduledJobExecutionDownloadLogFileProps = Omit<
  UseGetProps<FileStreamResultAjaxResponse, AjaxResponseBase, ScheduledJobExecutionDownloadLogFileQueryParams, void>,
  'path'
>;

/**
 * Download log file of the job execution
 */
export const useScheduledJobExecutionDownloadLogFile = (props: UseScheduledJobExecutionDownloadLogFileProps) =>
  useGet<FileStreamResultAjaxResponse, AjaxResponseBase, ScheduledJobExecutionDownloadLogFileQueryParams, void>(
    `/api/services/Scheduler/ScheduledJobExecution/DownloadLogFile`,
    props
  );

export type scheduledJobExecutionDownloadLogFileProps = Omit<
  RestfulShesha.GetProps<
    FileStreamResultAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionDownloadLogFileQueryParams,
    void
  >,
  'queryParams'
>;
/**
 * Download log file of the job execution
 */
export const scheduledJobExecutionDownloadLogFile = (
  queryParams: ScheduledJobExecutionDownloadLogFileQueryParams,
  props: scheduledJobExecutionDownloadLogFileProps
) =>
  RestfulShesha.get<
    FileStreamResultAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionDownloadLogFileQueryParams,
    void
  >(`/api/services/Scheduler/ScheduledJobExecution/DownloadLogFile`, queryParams, props);

export interface ScheduledJobExecutionGetAllQueryParams {
  /**
   * Filter string in JsonLogic format
   */
  filter?: string;
  /**
   * Quick search string. Is used to search entities by text
   */
  quickSearch?: string;
  sorting?: string;
  skipCount?: number;
  maxResultCount?: number;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type ScheduledJobExecutionGetAllProps = Omit<
  GetProps<
    ScheduledJobExecutionDtoPagedResultDtoAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionGetAllQueryParams,
    void
  >,
  'path'
>;

export const ScheduledJobExecutionGetAll = (props: ScheduledJobExecutionGetAllProps) => (
  <Get<
    ScheduledJobExecutionDtoPagedResultDtoAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionGetAllQueryParams,
    void
  >
    path={`/api/services/Scheduler/ScheduledJobExecution/GetAll`}
    {...props}
  />
);

export type UseScheduledJobExecutionGetAllProps = Omit<
  UseGetProps<
    ScheduledJobExecutionDtoPagedResultDtoAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionGetAllQueryParams,
    void
  >,
  'path'
>;

export const useScheduledJobExecutionGetAll = (props: UseScheduledJobExecutionGetAllProps) =>
  useGet<
    ScheduledJobExecutionDtoPagedResultDtoAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionGetAllQueryParams,
    void
  >(`/api/services/Scheduler/ScheduledJobExecution/GetAll`, props);

export type scheduledJobExecutionGetAllProps = Omit<
  RestfulShesha.GetProps<
    ScheduledJobExecutionDtoPagedResultDtoAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionGetAllQueryParams,
    void
  >,
  'queryParams'
>;
export const scheduledJobExecutionGetAll = (
  queryParams: ScheduledJobExecutionGetAllQueryParams,
  props: scheduledJobExecutionGetAllProps
) =>
  RestfulShesha.get<
    ScheduledJobExecutionDtoPagedResultDtoAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionGetAllQueryParams,
    void
  >(`/api/services/Scheduler/ScheduledJobExecution/GetAll`, queryParams, props);

export interface ScheduledJobExecutionQueryQueryParams {
  /**
   * List of properties to fetch in GraphQL-like syntax. Supports nested properties
   */
  properties?: string;
  id?: string;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type ScheduledJobExecutionQueryProps = Omit<
  GetProps<
    ScheduledJobExecutionGraphQLDataResultAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionQueryQueryParams,
    void
  >,
  'path'
>;

/**
 * Query entity data.
 * NOTE: don't use on prod, will be merged with the `Get`endpoint soon
 */
export const ScheduledJobExecutionQuery = (props: ScheduledJobExecutionQueryProps) => (
  <Get<
    ScheduledJobExecutionGraphQLDataResultAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionQueryQueryParams,
    void
  >
    path={`/api/services/Scheduler/ScheduledJobExecution/Query`}
    {...props}
  />
);

export type UseScheduledJobExecutionQueryProps = Omit<
  UseGetProps<
    ScheduledJobExecutionGraphQLDataResultAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionQueryQueryParams,
    void
  >,
  'path'
>;

/**
 * Query entity data.
 * NOTE: don't use on prod, will be merged with the `Get`endpoint soon
 */
export const useScheduledJobExecutionQuery = (props: UseScheduledJobExecutionQueryProps) =>
  useGet<
    ScheduledJobExecutionGraphQLDataResultAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionQueryQueryParams,
    void
  >(`/api/services/Scheduler/ScheduledJobExecution/Query`, props);

export type scheduledJobExecutionQueryProps = Omit<
  RestfulShesha.GetProps<
    ScheduledJobExecutionGraphQLDataResultAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionQueryQueryParams,
    void
  >,
  'queryParams'
>;
/**
 * Query entity data.
 * NOTE: don't use on prod, will be merged with the `Get`endpoint soon
 */
export const scheduledJobExecutionQuery = (
  queryParams: ScheduledJobExecutionQueryQueryParams,
  props: scheduledJobExecutionQueryProps
) =>
  RestfulShesha.get<
    ScheduledJobExecutionGraphQLDataResultAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionQueryQueryParams,
    void
  >(`/api/services/Scheduler/ScheduledJobExecution/Query`, queryParams, props);

export interface ScheduledJobExecutionQueryAllQueryParams {
  /**
   * List of properties to fetch in GraphQL-like syntax. Supports nested properties
   */
  properties?: string;
  /**
   * Filter string in JsonLogic format
   */
  filter?: string;
  /**
   * Quick search string. Is used to search entities by text
   */
  quickSearch?: string;
  sorting?: string;
  skipCount?: number;
  maxResultCount?: number;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type ScheduledJobExecutionQueryAllProps = Omit<
  GetProps<
    ScheduledJobExecutionPagedResultDtoGraphQLDataResultAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionQueryAllQueryParams,
    void
  >,
  'path'
>;

/**
 * Query entities list
 * NOTE: don't use on prod, will be merged with the GetAll endpoint soon
 */
export const ScheduledJobExecutionQueryAll = (props: ScheduledJobExecutionQueryAllProps) => (
  <Get<
    ScheduledJobExecutionPagedResultDtoGraphQLDataResultAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionQueryAllQueryParams,
    void
  >
    path={`/api/services/Scheduler/ScheduledJobExecution/QueryAll`}
    {...props}
  />
);

export type UseScheduledJobExecutionQueryAllProps = Omit<
  UseGetProps<
    ScheduledJobExecutionPagedResultDtoGraphQLDataResultAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionQueryAllQueryParams,
    void
  >,
  'path'
>;

/**
 * Query entities list
 * NOTE: don't use on prod, will be merged with the GetAll endpoint soon
 */
export const useScheduledJobExecutionQueryAll = (props: UseScheduledJobExecutionQueryAllProps) =>
  useGet<
    ScheduledJobExecutionPagedResultDtoGraphQLDataResultAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionQueryAllQueryParams,
    void
  >(`/api/services/Scheduler/ScheduledJobExecution/QueryAll`, props);

export type scheduledJobExecutionQueryAllProps = Omit<
  RestfulShesha.GetProps<
    ScheduledJobExecutionPagedResultDtoGraphQLDataResultAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionQueryAllQueryParams,
    void
  >,
  'queryParams'
>;
/**
 * Query entities list
 * NOTE: don't use on prod, will be merged with the GetAll endpoint soon
 */
export const scheduledJobExecutionQueryAll = (
  queryParams: ScheduledJobExecutionQueryAllQueryParams,
  props: scheduledJobExecutionQueryAllProps
) =>
  RestfulShesha.get<
    ScheduledJobExecutionPagedResultDtoGraphQLDataResultAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionQueryAllQueryParams,
    void
  >(`/api/services/Scheduler/ScheduledJobExecution/QueryAll`, queryParams, props);

export interface ScheduledJobExecutionGetQueryParams {
  id?: string;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type ScheduledJobExecutionGetProps = Omit<
  GetProps<ScheduledJobExecutionDtoAjaxResponse, AjaxResponseBase, ScheduledJobExecutionGetQueryParams, void>,
  'path'
>;

export const ScheduledJobExecutionGet = (props: ScheduledJobExecutionGetProps) => (
  <Get<ScheduledJobExecutionDtoAjaxResponse, AjaxResponseBase, ScheduledJobExecutionGetQueryParams, void>
    path={`/api/services/Scheduler/ScheduledJobExecution/Get`}
    {...props}
  />
);

export type UseScheduledJobExecutionGetProps = Omit<
  UseGetProps<ScheduledJobExecutionDtoAjaxResponse, AjaxResponseBase, ScheduledJobExecutionGetQueryParams, void>,
  'path'
>;

export const useScheduledJobExecutionGet = (props: UseScheduledJobExecutionGetProps) =>
  useGet<ScheduledJobExecutionDtoAjaxResponse, AjaxResponseBase, ScheduledJobExecutionGetQueryParams, void>(
    `/api/services/Scheduler/ScheduledJobExecution/Get`,
    props
  );

export type scheduledJobExecutionGetProps = Omit<
  RestfulShesha.GetProps<
    ScheduledJobExecutionDtoAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionGetQueryParams,
    void
  >,
  'queryParams'
>;
export const scheduledJobExecutionGet = (
  queryParams: ScheduledJobExecutionGetQueryParams,
  props: scheduledJobExecutionGetProps
) =>
  RestfulShesha.get<ScheduledJobExecutionDtoAjaxResponse, AjaxResponseBase, ScheduledJobExecutionGetQueryParams, void>(
    `/api/services/Scheduler/ScheduledJobExecution/Get`,
    queryParams,
    props
  );

export interface ScheduledJobExecutionCreateQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type ScheduledJobExecutionCreateProps = Omit<
  MutateProps<
    ScheduledJobExecutionDtoAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionCreateQueryParams,
    ScheduledJobExecutionDto,
    void
  >,
  'path' | 'verb'
>;

export const ScheduledJobExecutionCreate = (props: ScheduledJobExecutionCreateProps) => (
  <Mutate<
    ScheduledJobExecutionDtoAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionCreateQueryParams,
    ScheduledJobExecutionDto,
    void
  >
    verb="POST"
    path={`/api/services/Scheduler/ScheduledJobExecution/Create`}
    {...props}
  />
);

export type UseScheduledJobExecutionCreateProps = Omit<
  UseMutateProps<
    ScheduledJobExecutionDtoAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionCreateQueryParams,
    ScheduledJobExecutionDto,
    void
  >,
  'path' | 'verb'
>;

export const useScheduledJobExecutionCreate = (props: UseScheduledJobExecutionCreateProps) =>
  useMutate<
    ScheduledJobExecutionDtoAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionCreateQueryParams,
    ScheduledJobExecutionDto,
    void
  >('POST', `/api/services/Scheduler/ScheduledJobExecution/Create`, props);

export type scheduledJobExecutionCreateProps = Omit<
  RestfulShesha.MutateProps<
    ScheduledJobExecutionDtoAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionCreateQueryParams,
    ScheduledJobExecutionDto,
    void
  >,
  'data'
>;
export const scheduledJobExecutionCreate = (data: ScheduledJobExecutionDto, props: scheduledJobExecutionCreateProps) =>
  RestfulShesha.mutate<
    ScheduledJobExecutionDtoAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionCreateQueryParams,
    ScheduledJobExecutionDto,
    void
  >('POST', `/api/services/Scheduler/ScheduledJobExecution/Create`, data, props);

export interface ScheduledJobExecutionUpdateQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type ScheduledJobExecutionUpdateProps = Omit<
  MutateProps<
    ScheduledJobExecutionDtoAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionUpdateQueryParams,
    ScheduledJobExecutionDto,
    void
  >,
  'path' | 'verb'
>;

export const ScheduledJobExecutionUpdate = (props: ScheduledJobExecutionUpdateProps) => (
  <Mutate<
    ScheduledJobExecutionDtoAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionUpdateQueryParams,
    ScheduledJobExecutionDto,
    void
  >
    verb="PUT"
    path={`/api/services/Scheduler/ScheduledJobExecution/Update`}
    {...props}
  />
);

export type UseScheduledJobExecutionUpdateProps = Omit<
  UseMutateProps<
    ScheduledJobExecutionDtoAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionUpdateQueryParams,
    ScheduledJobExecutionDto,
    void
  >,
  'path' | 'verb'
>;

export const useScheduledJobExecutionUpdate = (props: UseScheduledJobExecutionUpdateProps) =>
  useMutate<
    ScheduledJobExecutionDtoAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionUpdateQueryParams,
    ScheduledJobExecutionDto,
    void
  >('PUT', `/api/services/Scheduler/ScheduledJobExecution/Update`, props);

export type scheduledJobExecutionUpdateProps = Omit<
  RestfulShesha.MutateProps<
    ScheduledJobExecutionDtoAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionUpdateQueryParams,
    ScheduledJobExecutionDto,
    void
  >,
  'data'
>;
export const scheduledJobExecutionUpdate = (data: ScheduledJobExecutionDto, props: scheduledJobExecutionUpdateProps) =>
  RestfulShesha.mutate<
    ScheduledJobExecutionDtoAjaxResponse,
    AjaxResponseBase,
    ScheduledJobExecutionUpdateQueryParams,
    ScheduledJobExecutionDto,
    void
  >('PUT', `/api/services/Scheduler/ScheduledJobExecution/Update`, data, props);

export interface ScheduledJobExecutionDeleteQueryParams {
  id?: string;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type ScheduledJobExecutionDeleteProps = Omit<
  MutateProps<void, unknown, ScheduledJobExecutionDeleteQueryParams, void, void>,
  'path' | 'verb'
>;

export const ScheduledJobExecutionDelete = (props: ScheduledJobExecutionDeleteProps) => (
  <Mutate<void, unknown, ScheduledJobExecutionDeleteQueryParams, void, void>
    verb="DELETE"
    path={`/api/services/Scheduler/ScheduledJobExecution/Delete`}
    {...props}
  />
);

export type UseScheduledJobExecutionDeleteProps = Omit<
  UseMutateProps<void, unknown, ScheduledJobExecutionDeleteQueryParams, void, void>,
  'path' | 'verb'
>;

export const useScheduledJobExecutionDelete = (props: UseScheduledJobExecutionDeleteProps) =>
  useMutate<void, unknown, ScheduledJobExecutionDeleteQueryParams, void, void>(
    'DELETE',
    `/api/services/Scheduler/ScheduledJobExecution/Delete`,
    { ...props }
  );

export type scheduledJobExecutionDeleteProps = Omit<
  RestfulShesha.MutateProps<void, unknown, ScheduledJobExecutionDeleteQueryParams, void, void>,
  'data'
>;
export const scheduledJobExecutionDelete = (props: scheduledJobExecutionDeleteProps) =>
  RestfulShesha.mutate<void, unknown, ScheduledJobExecutionDeleteQueryParams, void, void>(
    'DELETE',
    `/api/services/Scheduler/ScheduledJobExecution/Delete`,
    undefined,
    props
  );
