/* Generated by restful-react */

import React from 'react';
import { Get, GetProps, useGet, UseGetProps, Mutate, MutateProps, useMutate, UseMutateProps } from 'restful-react';
export const SPEC_VERSION = 'v1';
export interface Xml2SmsSettingDto {
  xml2SmsHost?: string | null;
  xml2SmsUsername?: string | null;
  xml2SmsPassword?: string | null;
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

export interface Xml2SmsSettingDtoAjaxResponse {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
  result?: Xml2SmsSettingDto;
}

export interface Xml2SmsUpdateSettingsQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type Xml2SmsUpdateSettingsProps = Omit<
  MutateProps<BooleanAjaxResponse, AjaxResponseBase, Xml2SmsUpdateSettingsQueryParams, Xml2SmsSettingDto, void>,
  'path' | 'verb'
>;

export const Xml2SmsUpdateSettings = (props: Xml2SmsUpdateSettingsProps) => (
  <Mutate<BooleanAjaxResponse, AjaxResponseBase, Xml2SmsUpdateSettingsQueryParams, Xml2SmsSettingDto, void>
    verb="PUT"
    path={`/api/Xml2Sms/Settings`}
    {...props}
  />
);

export type UseXml2SmsUpdateSettingsProps = Omit<
  UseMutateProps<BooleanAjaxResponse, AjaxResponseBase, Xml2SmsUpdateSettingsQueryParams, Xml2SmsSettingDto, void>,
  'path' | 'verb'
>;

export const useXml2SmsUpdateSettings = (props: UseXml2SmsUpdateSettingsProps) =>
  useMutate<BooleanAjaxResponse, AjaxResponseBase, Xml2SmsUpdateSettingsQueryParams, Xml2SmsSettingDto, void>(
    'PUT',
    `/api/Xml2Sms/Settings`,
    props
  );

export interface Xml2SmsGetSettingsQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type Xml2SmsGetSettingsProps = Omit<
  GetProps<Xml2SmsSettingDtoAjaxResponse, AjaxResponseBase, Xml2SmsGetSettingsQueryParams, void>,
  'path'
>;

export const Xml2SmsGetSettings = (props: Xml2SmsGetSettingsProps) => (
  <Get<Xml2SmsSettingDtoAjaxResponse, AjaxResponseBase, Xml2SmsGetSettingsQueryParams, void>
    path={`/api/Xml2Sms/Settings`}
    {...props}
  />
);

export type UseXml2SmsGetSettingsProps = Omit<
  UseGetProps<Xml2SmsSettingDtoAjaxResponse, AjaxResponseBase, Xml2SmsGetSettingsQueryParams, void>,
  'path'
>;

export const useXml2SmsGetSettings = (props: UseXml2SmsGetSettingsProps) =>
  useGet<Xml2SmsSettingDtoAjaxResponse, AjaxResponseBase, Xml2SmsGetSettingsQueryParams, void>(
    `/api/Xml2Sms/Settings`,
    props
  );

export interface Xml2SmsTestSmsQueryParams {
  mobileNumber?: string | null;
  body?: string | null;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type Xml2SmsTestSmsProps = Omit<
  MutateProps<void, unknown, Xml2SmsTestSmsQueryParams, void, void>,
  'path' | 'verb'
>;

export const Xml2SmsTestSms = (props: Xml2SmsTestSmsProps) => (
  <Mutate<void, unknown, Xml2SmsTestSmsQueryParams, void, void>
    verb="POST"
    path={`/api/services/SheshaXml2Sms/Xml2Sms/TestSms`}
    {...props}
  />
);

export type UseXml2SmsTestSmsProps = Omit<
  UseMutateProps<void, unknown, Xml2SmsTestSmsQueryParams, void, void>,
  'path' | 'verb'
>;

export const useXml2SmsTestSms = (props: UseXml2SmsTestSmsProps) =>
  useMutate<void, unknown, Xml2SmsTestSmsQueryParams, void, void>(
    'POST',
    `/api/services/SheshaXml2Sms/Xml2Sms/TestSms`,
    props
  );
