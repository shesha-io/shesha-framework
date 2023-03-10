/* Generated by restful-react */

import React from 'react';
import { Get, GetProps, useGet, UseGetProps, Mutate, MutateProps, useMutate, UseMutateProps } from 'restful-react';
export const SPEC_VERSION = 'v1';
export interface NotificationData {
  type?: string | null;
  properties?: { [key: string]: any } | null;
}

export interface AutocompleteItemDto {
  value?: string | null;
  displayText?: string | null;
}

export interface ValidationErrorInfo {
  message?: string | null;
  members?: string[] | null;
}

export interface ErrorInfo {
  code?: number;
  message?: string | null;
  details?: string | null;
  validationErrors?: ValidationErrorInfo[] | null;
}

export interface AutocompleteItemDtoListAjaxResponse {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
  result?: AutocompleteItemDto[] | null;
}

export interface AjaxResponseBase {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
}

export interface Stream {
  canRead?: boolean;
  canSeek?: boolean;
  canTimeout?: boolean;
  canWrite?: boolean;
  length?: number;
  position?: number;
  readTimeout?: number;
  writeTimeout?: number;
}

export interface NotificationAttachmentDto {
  fileName?: string | null;
  storedFileId?: string;
}

export interface NotificationAttachmentDtoAjaxResponse {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
  result?: NotificationAttachmentDto;
}

export interface NotificationDto {
  id?: string;
  name?: string | null;
  namespace?: string | null;
  description?: string | null;
}

export interface NotificationDtoAjaxResponse {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
  result?: NotificationDto;
}

export interface NotificationDtoPagedResultDto {
  items?: NotificationDto[] | null;
  totalCount?: number;
}

export interface NotificationDtoPagedResultDtoAjaxResponse {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
  result?: NotificationDtoPagedResultDto;
}

export interface NotificationPublishQueryParams {
  notificationName?: string | null;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type NotificationPublishProps = Omit<
  MutateProps<void, unknown, NotificationPublishQueryParams, NotificationData, void>,
  'path' | 'verb'
>;

export const NotificationPublish = (props: NotificationPublishProps) => (
  <Mutate<void, unknown, NotificationPublishQueryParams, NotificationData, void>
    verb="POST"
    path={`/api/services/app/Notification/Publish`}
    {...props}
  />
);

export type UseNotificationPublishProps = Omit<
  UseMutateProps<void, unknown, NotificationPublishQueryParams, NotificationData, void>,
  'path' | 'verb'
>;

export const useNotificationPublish = (props: UseNotificationPublishProps) =>
  useMutate<void, unknown, NotificationPublishQueryParams, NotificationData, void>(
    'POST',
    `/api/services/app/Notification/Publish`,
    props
  );

export interface NotificationAutocompleteQueryParams {
  term?: string | null;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type NotificationAutocompleteProps = Omit<
  GetProps<AutocompleteItemDtoListAjaxResponse, AjaxResponseBase, NotificationAutocompleteQueryParams, void>,
  'path'
>;

export const NotificationAutocomplete = (props: NotificationAutocompleteProps) => (
  <Get<AutocompleteItemDtoListAjaxResponse, AjaxResponseBase, NotificationAutocompleteQueryParams, void>
    path={`/api/services/app/Notification/Autocomplete`}
    {...props}
  />
);

export type UseNotificationAutocompleteProps = Omit<
  UseGetProps<AutocompleteItemDtoListAjaxResponse, AjaxResponseBase, NotificationAutocompleteQueryParams, void>,
  'path'
>;

export const useNotificationAutocomplete = (props: UseNotificationAutocompleteProps) =>
  useGet<AutocompleteItemDtoListAjaxResponse, AjaxResponseBase, NotificationAutocompleteQueryParams, void>(
    `/api/services/app/Notification/Autocomplete`,
    props
  );

export interface NotificationReSendAbpNotificationQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type NotificationReSendAbpNotificationProps = Omit<
  MutateProps<void, unknown, NotificationReSendAbpNotificationQueryParams, string[] | null, void>,
  'path' | 'verb'
>;

export const NotificationReSendAbpNotification = (props: NotificationReSendAbpNotificationProps) => (
  <Mutate<void, unknown, NotificationReSendAbpNotificationQueryParams, string[] | null, void>
    verb="POST"
    path={`/api/services/app/Notification/ReSendAbpNotification`}
    {...props}
  />
);

export type UseNotificationReSendAbpNotificationProps = Omit<
  UseMutateProps<void, unknown, NotificationReSendAbpNotificationQueryParams, string[] | null, void>,
  'path' | 'verb'
>;

export const useNotificationReSendAbpNotification = (props: UseNotificationReSendAbpNotificationProps) =>
  useMutate<void, unknown, NotificationReSendAbpNotificationQueryParams, string[] | null, void>(
    'POST',
    `/api/services/app/Notification/ReSendAbpNotification`,
    props
  );

export interface NotificationSaveAttachmentQueryParams {
  fileName?: string | null;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type NotificationSaveAttachmentProps = Omit<
  MutateProps<
    NotificationAttachmentDtoAjaxResponse,
    AjaxResponseBase,
    NotificationSaveAttachmentQueryParams,
    Stream,
    void
  >,
  'path' | 'verb'
>;

export const NotificationSaveAttachment = (props: NotificationSaveAttachmentProps) => (
  <Mutate<NotificationAttachmentDtoAjaxResponse, AjaxResponseBase, NotificationSaveAttachmentQueryParams, Stream, void>
    verb="POST"
    path={`/api/services/app/Notification/SaveAttachment`}
    {...props}
  />
);

export type UseNotificationSaveAttachmentProps = Omit<
  UseMutateProps<
    NotificationAttachmentDtoAjaxResponse,
    AjaxResponseBase,
    NotificationSaveAttachmentQueryParams,
    Stream,
    void
  >,
  'path' | 'verb'
>;

export const useNotificationSaveAttachment = (props: UseNotificationSaveAttachmentProps) =>
  useMutate<
    NotificationAttachmentDtoAjaxResponse,
    AjaxResponseBase,
    NotificationSaveAttachmentQueryParams,
    Stream,
    void
  >('POST', `/api/services/app/Notification/SaveAttachment`, props);

export interface NotificationGetQueryParams {
  id?: string;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type NotificationGetProps = Omit<
  GetProps<NotificationDtoAjaxResponse, AjaxResponseBase, NotificationGetQueryParams, void>,
  'path'
>;

export const NotificationGet = (props: NotificationGetProps) => (
  <Get<NotificationDtoAjaxResponse, AjaxResponseBase, NotificationGetQueryParams, void>
    path={`/api/services/app/Notification/Get`}
    {...props}
  />
);

export type UseNotificationGetProps = Omit<
  UseGetProps<NotificationDtoAjaxResponse, AjaxResponseBase, NotificationGetQueryParams, void>,
  'path'
>;

export const useNotificationGet = (props: UseNotificationGetProps) =>
  useGet<NotificationDtoAjaxResponse, AjaxResponseBase, NotificationGetQueryParams, void>(
    `/api/services/app/Notification/Get`,
    props
  );

export interface NotificationGetAllQueryParams {
  sorting?: string | null;
  skipCount?: number;
  maxResultCount?: number;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type NotificationGetAllProps = Omit<
  GetProps<NotificationDtoPagedResultDtoAjaxResponse, AjaxResponseBase, NotificationGetAllQueryParams, void>,
  'path'
>;

export const NotificationGetAll = (props: NotificationGetAllProps) => (
  <Get<NotificationDtoPagedResultDtoAjaxResponse, AjaxResponseBase, NotificationGetAllQueryParams, void>
    path={`/api/services/app/Notification/GetAll`}
    {...props}
  />
);

export type UseNotificationGetAllProps = Omit<
  UseGetProps<NotificationDtoPagedResultDtoAjaxResponse, AjaxResponseBase, NotificationGetAllQueryParams, void>,
  'path'
>;

export const useNotificationGetAll = (props: UseNotificationGetAllProps) =>
  useGet<NotificationDtoPagedResultDtoAjaxResponse, AjaxResponseBase, NotificationGetAllQueryParams, void>(
    `/api/services/app/Notification/GetAll`,
    props
  );

export interface NotificationCreateQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type NotificationCreateProps = Omit<
  MutateProps<NotificationDtoAjaxResponse, AjaxResponseBase, NotificationCreateQueryParams, NotificationDto, void>,
  'path' | 'verb'
>;

export const NotificationCreate = (props: NotificationCreateProps) => (
  <Mutate<NotificationDtoAjaxResponse, AjaxResponseBase, NotificationCreateQueryParams, NotificationDto, void>
    verb="POST"
    path={`/api/services/app/Notification/Create`}
    {...props}
  />
);

export type UseNotificationCreateProps = Omit<
  UseMutateProps<NotificationDtoAjaxResponse, AjaxResponseBase, NotificationCreateQueryParams, NotificationDto, void>,
  'path' | 'verb'
>;

export const useNotificationCreate = (props: UseNotificationCreateProps) =>
  useMutate<NotificationDtoAjaxResponse, AjaxResponseBase, NotificationCreateQueryParams, NotificationDto, void>(
    'POST',
    `/api/services/app/Notification/Create`,
    props
  );

export interface NotificationUpdateQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type NotificationUpdateProps = Omit<
  MutateProps<NotificationDtoAjaxResponse, AjaxResponseBase, NotificationUpdateQueryParams, NotificationDto, void>,
  'path' | 'verb'
>;

export const NotificationUpdate = (props: NotificationUpdateProps) => (
  <Mutate<NotificationDtoAjaxResponse, AjaxResponseBase, NotificationUpdateQueryParams, NotificationDto, void>
    verb="PUT"
    path={`/api/services/app/Notification/Update`}
    {...props}
  />
);

export type UseNotificationUpdateProps = Omit<
  UseMutateProps<NotificationDtoAjaxResponse, AjaxResponseBase, NotificationUpdateQueryParams, NotificationDto, void>,
  'path' | 'verb'
>;

export const useNotificationUpdate = (props: UseNotificationUpdateProps) =>
  useMutate<NotificationDtoAjaxResponse, AjaxResponseBase, NotificationUpdateQueryParams, NotificationDto, void>(
    'PUT',
    `/api/services/app/Notification/Update`,
    props
  );

export interface NotificationDeleteQueryParams {
  id?: string;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type NotificationDeleteProps = Omit<
  MutateProps<void, unknown, NotificationDeleteQueryParams, void, void>,
  'path' | 'verb'
>;

export const NotificationDelete = (props: NotificationDeleteProps) => (
  <Mutate<void, unknown, NotificationDeleteQueryParams, void, void>
    verb="DELETE"
    path={`/api/services/app/Notification/Delete`}
    {...props}
  />
);

export type UseNotificationDeleteProps = Omit<
  UseMutateProps<void, unknown, NotificationDeleteQueryParams, void, void>,
  'path' | 'verb'
>;

export const useNotificationDelete = (props: UseNotificationDeleteProps) =>
  useMutate<void, unknown, NotificationDeleteQueryParams, void, void>(
    'DELETE',
    `/api/services/app/Notification/Delete`,
    { ...props }
  );
