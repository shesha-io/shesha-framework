/* Generated by restful-react */

import React from 'react';
import { Get, GetProps, useGet, UseGetProps, Mutate, MutateProps, useMutate, UseMutateProps } from 'restful-react';
export const SPEC_VERSION = 'v1';
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

export interface BooleanAjaxResponse {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
  result?: boolean;
}

export interface AjaxResponseBase {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
}

export interface GuidNullableEntityWithDisplayNameDto {
  id?: string | null;
  displayText?: string | null;
}

export interface ReferenceListItemValueDto {
  item?: string | null;
  itemValue?: number | null;
}

export interface NotificationAttachmentDto {
  fileName?: string | null;
  storedFileId?: string;
}

export interface NotificationMessageDto {
  id?: string;
  sender?: GuidNullableEntityWithDisplayNameDto;
  recipient?: GuidNullableEntityWithDisplayNameDto;
  sendType?: ReferenceListItemValueDto;
  recipientText?: string | null;
  subject?: string | null;
  body?: string | null;
  template?: GuidNullableEntityWithDisplayNameDto;
  notification?: GuidNullableEntityWithDisplayNameDto;
  attachments?: NotificationAttachmentDto[] | null;
  sendDate?: string | null;
  tryCount?: number;
  status?: ReferenceListItemValueDto;
  errorMessage?: string | null;
}

export interface NotificationMessageDtoAjaxResponse {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
  result?: NotificationMessageDto;
}

export interface NotificationMessageDtoPagedResultDto {
  items?: NotificationMessageDto[] | null;
  totalCount?: number;
}

export interface NotificationMessageDtoPagedResultDtoAjaxResponse {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
  result?: NotificationMessageDtoPagedResultDto;
}

export interface NotificationMessageResendQueryParams {
  id?: string;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type NotificationMessageResendProps = Omit<
  MutateProps<BooleanAjaxResponse, AjaxResponseBase, NotificationMessageResendQueryParams, void, void>,
  'path' | 'verb'
>;

export const NotificationMessageResend = (props: NotificationMessageResendProps) => (
  <Mutate<BooleanAjaxResponse, AjaxResponseBase, NotificationMessageResendQueryParams, void, void>
    verb="POST"
    path={`/api/services/app/NotificationMessage/Resend`}
    {...props}
  />
);

export type UseNotificationMessageResendProps = Omit<
  UseMutateProps<BooleanAjaxResponse, AjaxResponseBase, NotificationMessageResendQueryParams, void, void>,
  'path' | 'verb'
>;

export const useNotificationMessageResend = (props: UseNotificationMessageResendProps) =>
  useMutate<BooleanAjaxResponse, AjaxResponseBase, NotificationMessageResendQueryParams, void, void>(
    'POST',
    `/api/services/app/NotificationMessage/Resend`,
    props
  );

export interface NotificationMessageGetQueryParams {
  id?: string;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type NotificationMessageGetProps = Omit<
  GetProps<NotificationMessageDtoAjaxResponse, AjaxResponseBase, NotificationMessageGetQueryParams, void>,
  'path'
>;

export const NotificationMessageGet = (props: NotificationMessageGetProps) => (
  <Get<NotificationMessageDtoAjaxResponse, AjaxResponseBase, NotificationMessageGetQueryParams, void>
    path={`/api/services/app/NotificationMessage/Get`}
    {...props}
  />
);

export type UseNotificationMessageGetProps = Omit<
  UseGetProps<NotificationMessageDtoAjaxResponse, AjaxResponseBase, NotificationMessageGetQueryParams, void>,
  'path'
>;

export const useNotificationMessageGet = (props: UseNotificationMessageGetProps) =>
  useGet<NotificationMessageDtoAjaxResponse, AjaxResponseBase, NotificationMessageGetQueryParams, void>(
    `/api/services/app/NotificationMessage/Get`,
    props
  );

export interface NotificationMessageGetAllQueryParams {
  sorting?: string | null;
  skipCount?: number;
  maxResultCount?: number;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type NotificationMessageGetAllProps = Omit<
  GetProps<
    NotificationMessageDtoPagedResultDtoAjaxResponse,
    AjaxResponseBase,
    NotificationMessageGetAllQueryParams,
    void
  >,
  'path'
>;

export const NotificationMessageGetAll = (props: NotificationMessageGetAllProps) => (
  <Get<NotificationMessageDtoPagedResultDtoAjaxResponse, AjaxResponseBase, NotificationMessageGetAllQueryParams, void>
    path={`/api/services/app/NotificationMessage/GetAll`}
    {...props}
  />
);

export type UseNotificationMessageGetAllProps = Omit<
  UseGetProps<
    NotificationMessageDtoPagedResultDtoAjaxResponse,
    AjaxResponseBase,
    NotificationMessageGetAllQueryParams,
    void
  >,
  'path'
>;

export const useNotificationMessageGetAll = (props: UseNotificationMessageGetAllProps) =>
  useGet<
    NotificationMessageDtoPagedResultDtoAjaxResponse,
    AjaxResponseBase,
    NotificationMessageGetAllQueryParams,
    void
  >(`/api/services/app/NotificationMessage/GetAll`, props);

export interface NotificationMessageCreateQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type NotificationMessageCreateProps = Omit<
  MutateProps<
    NotificationMessageDtoAjaxResponse,
    AjaxResponseBase,
    NotificationMessageCreateQueryParams,
    NotificationMessageDto,
    void
  >,
  'path' | 'verb'
>;

export const NotificationMessageCreate = (props: NotificationMessageCreateProps) => (
  <Mutate<
    NotificationMessageDtoAjaxResponse,
    AjaxResponseBase,
    NotificationMessageCreateQueryParams,
    NotificationMessageDto,
    void
  >
    verb="POST"
    path={`/api/services/app/NotificationMessage/Create`}
    {...props}
  />
);

export type UseNotificationMessageCreateProps = Omit<
  UseMutateProps<
    NotificationMessageDtoAjaxResponse,
    AjaxResponseBase,
    NotificationMessageCreateQueryParams,
    NotificationMessageDto,
    void
  >,
  'path' | 'verb'
>;

export const useNotificationMessageCreate = (props: UseNotificationMessageCreateProps) =>
  useMutate<
    NotificationMessageDtoAjaxResponse,
    AjaxResponseBase,
    NotificationMessageCreateQueryParams,
    NotificationMessageDto,
    void
  >('POST', `/api/services/app/NotificationMessage/Create`, props);

export interface NotificationMessageUpdateQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type NotificationMessageUpdateProps = Omit<
  MutateProps<
    NotificationMessageDtoAjaxResponse,
    AjaxResponseBase,
    NotificationMessageUpdateQueryParams,
    NotificationMessageDto,
    void
  >,
  'path' | 'verb'
>;

export const NotificationMessageUpdate = (props: NotificationMessageUpdateProps) => (
  <Mutate<
    NotificationMessageDtoAjaxResponse,
    AjaxResponseBase,
    NotificationMessageUpdateQueryParams,
    NotificationMessageDto,
    void
  >
    verb="PUT"
    path={`/api/services/app/NotificationMessage/Update`}
    {...props}
  />
);

export type UseNotificationMessageUpdateProps = Omit<
  UseMutateProps<
    NotificationMessageDtoAjaxResponse,
    AjaxResponseBase,
    NotificationMessageUpdateQueryParams,
    NotificationMessageDto,
    void
  >,
  'path' | 'verb'
>;

export const useNotificationMessageUpdate = (props: UseNotificationMessageUpdateProps) =>
  useMutate<
    NotificationMessageDtoAjaxResponse,
    AjaxResponseBase,
    NotificationMessageUpdateQueryParams,
    NotificationMessageDto,
    void
  >('PUT', `/api/services/app/NotificationMessage/Update`, props);

export interface NotificationMessageDeleteQueryParams {
  id?: string;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type NotificationMessageDeleteProps = Omit<
  MutateProps<void, unknown, NotificationMessageDeleteQueryParams, void, void>,
  'path' | 'verb'
>;

export const NotificationMessageDelete = (props: NotificationMessageDeleteProps) => (
  <Mutate<void, unknown, NotificationMessageDeleteQueryParams, void, void>
    verb="DELETE"
    path={`/api/services/app/NotificationMessage/Delete`}
    {...props}
  />
);

export type UseNotificationMessageDeleteProps = Omit<
  UseMutateProps<void, unknown, NotificationMessageDeleteQueryParams, void, void>,
  'path' | 'verb'
>;

export const useNotificationMessageDelete = (props: UseNotificationMessageDeleteProps) =>
  useMutate<void, unknown, NotificationMessageDeleteQueryParams, void, void>(
    'DELETE',
    `/api/services/app/NotificationMessage/Delete`,
    { ...props }
  );
