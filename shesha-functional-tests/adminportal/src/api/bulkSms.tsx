/* Generated by restful-react */

import React from 'react';
import { Get, GetProps, useGet, UseGetProps, Mutate, MutateProps, useMutate, UseMutateProps } from 'restful-react';
export const SPEC_VERSION = 'v1';
export interface BulkSmsSettingsDto {
  apiUrl?: string | null;
  apiUsername?: string | null;
  apiPassword?: string | null;
  useProxy?: boolean;
  webProxyAddress?: string | null;
  useDefaultProxyCredentials?: boolean;
  webProxyUsername?: string | null;
  webProxyPassword?: string | null;
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

export interface BulkSmsSettingsDtoAjaxResponse {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
  result?: BulkSmsSettingsDto;
}

export interface AjaxResponseBase {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
}

export interface BulkSmsGetSettingsQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type BulkSmsGetSettingsProps = Omit<
  GetProps<BulkSmsSettingsDtoAjaxResponse, AjaxResponseBase, BulkSmsGetSettingsQueryParams, void>,
  'path'
>;

export const BulkSmsGetSettings = (props: BulkSmsGetSettingsProps) => (
  <Get<BulkSmsSettingsDtoAjaxResponse, AjaxResponseBase, BulkSmsGetSettingsQueryParams, void>
    path={`/api/BulkSmsGateway/Settings`}
    {...props}
  />
);

export type UseBulkSmsGetSettingsProps = Omit<
  UseGetProps<BulkSmsSettingsDtoAjaxResponse, AjaxResponseBase, BulkSmsGetSettingsQueryParams, void>,
  'path'
>;

export const useBulkSmsGetSettings = (props: UseBulkSmsGetSettingsProps) =>
  useGet<BulkSmsSettingsDtoAjaxResponse, AjaxResponseBase, BulkSmsGetSettingsQueryParams, void>(
    `/api/BulkSmsGateway/Settings`,
    props
  );

export interface BulkSmsUpdateSettingsQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type BulkSmsUpdateSettingsProps = Omit<
  MutateProps<void, unknown, BulkSmsUpdateSettingsQueryParams, BulkSmsSettingsDto, void>,
  'path' | 'verb'
>;

export const BulkSmsUpdateSettings = (props: BulkSmsUpdateSettingsProps) => (
  <Mutate<void, unknown, BulkSmsUpdateSettingsQueryParams, BulkSmsSettingsDto, void>
    verb="PUT"
    path={`/api/BulkSmsGateway/Settings`}
    {...props}
  />
);

export type UseBulkSmsUpdateSettingsProps = Omit<
  UseMutateProps<void, unknown, BulkSmsUpdateSettingsQueryParams, BulkSmsSettingsDto, void>,
  'path' | 'verb'
>;

export const useBulkSmsUpdateSettings = (props: UseBulkSmsUpdateSettingsProps) =>
  useMutate<void, unknown, BulkSmsUpdateSettingsQueryParams, BulkSmsSettingsDto, void>(
    'PUT',
    `/api/BulkSmsGateway/Settings`,
    props
  );
