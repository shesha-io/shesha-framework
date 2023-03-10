/* Generated by restful-react */

import React from 'react';
import { Get, GetProps, useGet, UseGetProps, Mutate, MutateProps, useMutate, UseMutateProps } from 'restful-react';
export const SPEC_VERSION = 'v1';
export interface SmsSettingsDto {
  gateway?: string | null;
  redirectAllMessagesTo?: string | null;
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

export interface SmsSettingsDtoAjaxResponse {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
  result?: SmsSettingsDto;
}

export interface AjaxResponseBase {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
}

export interface SmsSettingsGetSettingsQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type SmsSettingsGetSettingsProps = Omit<
  GetProps<SmsSettingsDtoAjaxResponse, AjaxResponseBase, SmsSettingsGetSettingsQueryParams, void>,
  'path'
>;

export const SmsSettingsGetSettings = (props: SmsSettingsGetSettingsProps) => (
  <Get<SmsSettingsDtoAjaxResponse, AjaxResponseBase, SmsSettingsGetSettingsQueryParams, void>
    path={`/api/Sms/Settings`}
    {...props}
  />
);

export type UseSmsSettingsGetSettingsProps = Omit<
  UseGetProps<SmsSettingsDtoAjaxResponse, AjaxResponseBase, SmsSettingsGetSettingsQueryParams, void>,
  'path'
>;

export const useSmsSettingsGetSettings = (props: UseSmsSettingsGetSettingsProps) =>
  useGet<SmsSettingsDtoAjaxResponse, AjaxResponseBase, SmsSettingsGetSettingsQueryParams, void>(
    `/api/Sms/Settings`,
    props
  );

export interface SmsSettingsUpdateSettingsQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type SmsSettingsUpdateSettingsProps = Omit<
  MutateProps<void, unknown, SmsSettingsUpdateSettingsQueryParams, SmsSettingsDto, void>,
  'path' | 'verb'
>;

export const SmsSettingsUpdateSettings = (props: SmsSettingsUpdateSettingsProps) => (
  <Mutate<void, unknown, SmsSettingsUpdateSettingsQueryParams, SmsSettingsDto, void>
    verb="PUT"
    path={`/api/Sms/Settings`}
    {...props}
  />
);

export type UseSmsSettingsUpdateSettingsProps = Omit<
  UseMutateProps<void, unknown, SmsSettingsUpdateSettingsQueryParams, SmsSettingsDto, void>,
  'path' | 'verb'
>;

export const useSmsSettingsUpdateSettings = (props: UseSmsSettingsUpdateSettingsProps) =>
  useMutate<void, unknown, SmsSettingsUpdateSettingsQueryParams, SmsSettingsDto, void>(
    'PUT',
    `/api/Sms/Settings`,
    props
  );
