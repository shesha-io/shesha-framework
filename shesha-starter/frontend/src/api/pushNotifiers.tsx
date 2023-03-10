/* Generated by restful-react */

import React from 'react';
import { Get, GetProps, useGet, UseGetProps } from 'restful-react';
export const SPEC_VERSION = 'v1';
export interface PushNotifierDto {
  name?: string | null;
  description?: string | null;
  uid?: string | null;
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

export interface PushNotifierDtoListAjaxResponse {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
  result?: PushNotifierDto[] | null;
}

export interface AjaxResponseBase {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
}

export interface PushNotifiersGetAllQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type PushNotifiersGetAllProps = Omit<
  GetProps<PushNotifierDtoListAjaxResponse, AjaxResponseBase, PushNotifiersGetAllQueryParams, void>,
  'path'
>;

export const PushNotifiersGetAll = (props: PushNotifiersGetAllProps) => (
  <Get<PushNotifierDtoListAjaxResponse, AjaxResponseBase, PushNotifiersGetAllQueryParams, void>
    path={`/api/Push/Notifiers`}
    {...props}
  />
);

export type UsePushNotifiersGetAllProps = Omit<
  UseGetProps<PushNotifierDtoListAjaxResponse, AjaxResponseBase, PushNotifiersGetAllQueryParams, void>,
  'path'
>;

export const usePushNotifiersGetAll = (props: UsePushNotifiersGetAllProps) =>
  useGet<PushNotifierDtoListAjaxResponse, AjaxResponseBase, PushNotifiersGetAllQueryParams, void>(
    `/api/Push/Notifiers`,
    props
  );
