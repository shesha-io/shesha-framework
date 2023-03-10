/* Generated by restful-react */

import React from 'react';
import { Get, GetProps, useGet, UseGetProps, Mutate, MutateProps, useMutate, UseMutateProps } from 'restful-react';
export const SPEC_VERSION = 'v1';
export interface CreateUserDto {
  userName: string;
  name: string;
  surname: string;
  emailAddress: string;
  isActive?: boolean;
  roleNames?: string[] | null;
  password: string;
}

export interface UserDto {
  id?: number;
  userName: string;
  name: string;
  surname: string;
  emailAddress: string;
  isActive?: boolean;
  fullName?: string | null;
  lastLoginTime?: string | null;
  creationTime?: string;
  roleNames?: string[] | null;
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

export interface UserDtoAjaxResponse {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
  result?: UserDto;
}

export interface AjaxResponseBase {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
}

export interface RoleDto {
  id?: number;
  name: string;
  displayName: string;
  normalizedName?: string | null;
  description?: string | null;
  grantedPermissions?: string[] | null;
}

export interface RoleDtoListResultDto {
  items?: RoleDto[] | null;
}

export interface RoleDtoListResultDtoAjaxResponse {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
  result?: RoleDtoListResultDto;
}

export interface ChangeUserLanguageDto {
  languageName: string;
}

export interface ResetPasswordSendOtpResponse {
  operationId?: string;
}

export interface ResetPasswordSendOtpResponseAjaxResponse {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
  result?: ResetPasswordSendOtpResponse;
}

export interface ResetPasswordVerifyOtpInput {
  operationId?: string;
  pin?: string | null;
  mobileNo: string;
}

export interface ResetPasswordVerifyOtpResponse {
  isSuccess?: boolean;
  errorMessage?: string | null;
  token?: string | null;
  username?: string | null;
}

export interface ResetPasswordVerifyOtpResponseAjaxResponse {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
  result?: ResetPasswordVerifyOtpResponse;
}

export interface ResetPasswordUsingTokenInput {
  username: string;
  token: string;
  newPassword: string;
}

export interface BooleanAjaxResponse {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
  result?: boolean;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordDto {
  adminPassword: string;
  userId: number;
  newPassword: string;
}

export interface AbpUserAuthConfigDto {
  allPermissions?: {
    [key: string]: string;
  } | null;
  grantedPermissions?: {
    [key: string]: string;
  } | null;
}

export interface AbpUserAuthConfigDtoAjaxResponse {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
  result?: AbpUserAuthConfigDto;
}

export interface UserDtoPagedResultDto {
  items?: UserDto[] | null;
  totalCount?: number;
}

export interface UserDtoPagedResultDtoAjaxResponse {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
  result?: UserDtoPagedResultDto;
}

export interface UserCreateQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type UserCreateProps = Omit<
  MutateProps<UserDtoAjaxResponse, AjaxResponseBase, UserCreateQueryParams, CreateUserDto, void>,
  'path' | 'verb'
>;

export const UserCreate = (props: UserCreateProps) => (
  <Mutate<UserDtoAjaxResponse, AjaxResponseBase, UserCreateQueryParams, CreateUserDto, void>
    verb="POST"
    path={`/api/services/app/User/Create`}
    {...props}
  />
);

export type UseUserCreateProps = Omit<
  UseMutateProps<UserDtoAjaxResponse, AjaxResponseBase, UserCreateQueryParams, CreateUserDto, void>,
  'path' | 'verb'
>;

export const useUserCreate = (props: UseUserCreateProps) =>
  useMutate<UserDtoAjaxResponse, AjaxResponseBase, UserCreateQueryParams, CreateUserDto, void>(
    'POST',
    `/api/services/app/User/Create`,
    props
  );

export interface UserUpdateQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type UserUpdateProps = Omit<
  MutateProps<UserDtoAjaxResponse, AjaxResponseBase, UserUpdateQueryParams, UserDto, void>,
  'path' | 'verb'
>;

export const UserUpdate = (props: UserUpdateProps) => (
  <Mutate<UserDtoAjaxResponse, AjaxResponseBase, UserUpdateQueryParams, UserDto, void>
    verb="PUT"
    path={`/api/services/app/User/Update`}
    {...props}
  />
);

export type UseUserUpdateProps = Omit<
  UseMutateProps<UserDtoAjaxResponse, AjaxResponseBase, UserUpdateQueryParams, UserDto, void>,
  'path' | 'verb'
>;

export const useUserUpdate = (props: UseUserUpdateProps) =>
  useMutate<UserDtoAjaxResponse, AjaxResponseBase, UserUpdateQueryParams, UserDto, void>(
    'PUT',
    `/api/services/app/User/Update`,
    props
  );

export interface UserDeleteQueryParams {
  id?: number;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type UserDeleteProps = Omit<MutateProps<void, unknown, UserDeleteQueryParams, void, void>, 'path' | 'verb'>;

export const UserDelete = (props: UserDeleteProps) => (
  <Mutate<void, unknown, UserDeleteQueryParams, void, void>
    verb="DELETE"
    path={`/api/services/app/User/Delete`}
    {...props}
  />
);

export type UseUserDeleteProps = Omit<
  UseMutateProps<void, unknown, UserDeleteQueryParams, void, void>,
  'path' | 'verb'
>;

export const useUserDelete = (props: UseUserDeleteProps) =>
  useMutate<void, unknown, UserDeleteQueryParams, void, void>('DELETE', `/api/services/app/User/Delete`, { ...props });

export interface UserGetRolesQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type UserGetRolesProps = Omit<
  GetProps<RoleDtoListResultDtoAjaxResponse, AjaxResponseBase, UserGetRolesQueryParams, void>,
  'path'
>;

export const UserGetRoles = (props: UserGetRolesProps) => (
  <Get<RoleDtoListResultDtoAjaxResponse, AjaxResponseBase, UserGetRolesQueryParams, void>
    path={`/api/services/app/User/GetRoles`}
    {...props}
  />
);

export type UseUserGetRolesProps = Omit<
  UseGetProps<RoleDtoListResultDtoAjaxResponse, AjaxResponseBase, UserGetRolesQueryParams, void>,
  'path'
>;

export const useUserGetRoles = (props: UseUserGetRolesProps) =>
  useGet<RoleDtoListResultDtoAjaxResponse, AjaxResponseBase, UserGetRolesQueryParams, void>(
    `/api/services/app/User/GetRoles`,
    props
  );

export interface UserChangeLanguageQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type UserChangeLanguageProps = Omit<
  MutateProps<void, unknown, UserChangeLanguageQueryParams, ChangeUserLanguageDto, void>,
  'path' | 'verb'
>;

export const UserChangeLanguage = (props: UserChangeLanguageProps) => (
  <Mutate<void, unknown, UserChangeLanguageQueryParams, ChangeUserLanguageDto, void>
    verb="POST"
    path={`/api/services/app/User/ChangeLanguage`}
    {...props}
  />
);

export type UseUserChangeLanguageProps = Omit<
  UseMutateProps<void, unknown, UserChangeLanguageQueryParams, ChangeUserLanguageDto, void>,
  'path' | 'verb'
>;

export const useUserChangeLanguage = (props: UseUserChangeLanguageProps) =>
  useMutate<void, unknown, UserChangeLanguageQueryParams, ChangeUserLanguageDto, void>(
    'POST',
    `/api/services/app/User/ChangeLanguage`,
    props
  );

export interface UserResetPasswordSendOtpQueryParams {
  mobileNo?: string | null;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type UserResetPasswordSendOtpProps = Omit<
  MutateProps<
    ResetPasswordSendOtpResponseAjaxResponse,
    AjaxResponseBase,
    UserResetPasswordSendOtpQueryParams,
    void,
    void
  >,
  'path' | 'verb'
>;

export const UserResetPasswordSendOtp = (props: UserResetPasswordSendOtpProps) => (
  <Mutate<ResetPasswordSendOtpResponseAjaxResponse, AjaxResponseBase, UserResetPasswordSendOtpQueryParams, void, void>
    verb="POST"
    path={`/api/services/app/User/ResetPasswordSendOtp`}
    {...props}
  />
);

export type UseUserResetPasswordSendOtpProps = Omit<
  UseMutateProps<
    ResetPasswordSendOtpResponseAjaxResponse,
    AjaxResponseBase,
    UserResetPasswordSendOtpQueryParams,
    void,
    void
  >,
  'path' | 'verb'
>;

export const useUserResetPasswordSendOtp = (props: UseUserResetPasswordSendOtpProps) =>
  useMutate<
    ResetPasswordSendOtpResponseAjaxResponse,
    AjaxResponseBase,
    UserResetPasswordSendOtpQueryParams,
    void,
    void
  >('POST', `/api/services/app/User/ResetPasswordSendOtp`, props);

export interface UserResetPasswordVerifyOtpQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type UserResetPasswordVerifyOtpProps = Omit<
  MutateProps<
    ResetPasswordVerifyOtpResponseAjaxResponse,
    AjaxResponseBase,
    UserResetPasswordVerifyOtpQueryParams,
    ResetPasswordVerifyOtpInput,
    void
  >,
  'path' | 'verb'
>;

export const UserResetPasswordVerifyOtp = (props: UserResetPasswordVerifyOtpProps) => (
  <Mutate<
    ResetPasswordVerifyOtpResponseAjaxResponse,
    AjaxResponseBase,
    UserResetPasswordVerifyOtpQueryParams,
    ResetPasswordVerifyOtpInput,
    void
  >
    verb="POST"
    path={`/api/services/app/User/ResetPasswordVerifyOtp`}
    {...props}
  />
);

export type UseUserResetPasswordVerifyOtpProps = Omit<
  UseMutateProps<
    ResetPasswordVerifyOtpResponseAjaxResponse,
    AjaxResponseBase,
    UserResetPasswordVerifyOtpQueryParams,
    ResetPasswordVerifyOtpInput,
    void
  >,
  'path' | 'verb'
>;

export const useUserResetPasswordVerifyOtp = (props: UseUserResetPasswordVerifyOtpProps) =>
  useMutate<
    ResetPasswordVerifyOtpResponseAjaxResponse,
    AjaxResponseBase,
    UserResetPasswordVerifyOtpQueryParams,
    ResetPasswordVerifyOtpInput,
    void
  >('POST', `/api/services/app/User/ResetPasswordVerifyOtp`, props);

export interface UserResetPasswordUsingTokenQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type UserResetPasswordUsingTokenProps = Omit<
  MutateProps<
    BooleanAjaxResponse,
    AjaxResponseBase,
    UserResetPasswordUsingTokenQueryParams,
    ResetPasswordUsingTokenInput,
    void
  >,
  'path' | 'verb'
>;

export const UserResetPasswordUsingToken = (props: UserResetPasswordUsingTokenProps) => (
  <Mutate<
    BooleanAjaxResponse,
    AjaxResponseBase,
    UserResetPasswordUsingTokenQueryParams,
    ResetPasswordUsingTokenInput,
    void
  >
    verb="POST"
    path={`/api/services/app/User/ResetPasswordUsingToken`}
    {...props}
  />
);

export type UseUserResetPasswordUsingTokenProps = Omit<
  UseMutateProps<
    BooleanAjaxResponse,
    AjaxResponseBase,
    UserResetPasswordUsingTokenQueryParams,
    ResetPasswordUsingTokenInput,
    void
  >,
  'path' | 'verb'
>;

export const useUserResetPasswordUsingToken = (props: UseUserResetPasswordUsingTokenProps) =>
  useMutate<
    BooleanAjaxResponse,
    AjaxResponseBase,
    UserResetPasswordUsingTokenQueryParams,
    ResetPasswordUsingTokenInput,
    void
  >('POST', `/api/services/app/User/ResetPasswordUsingToken`, props);

export interface UserChangePasswordQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type UserChangePasswordProps = Omit<
  MutateProps<BooleanAjaxResponse, AjaxResponseBase, UserChangePasswordQueryParams, ChangePasswordDto, void>,
  'path' | 'verb'
>;

export const UserChangePassword = (props: UserChangePasswordProps) => (
  <Mutate<BooleanAjaxResponse, AjaxResponseBase, UserChangePasswordQueryParams, ChangePasswordDto, void>
    verb="POST"
    path={`/api/services/app/User/ChangePassword`}
    {...props}
  />
);

export type UseUserChangePasswordProps = Omit<
  UseMutateProps<BooleanAjaxResponse, AjaxResponseBase, UserChangePasswordQueryParams, ChangePasswordDto, void>,
  'path' | 'verb'
>;

export const useUserChangePassword = (props: UseUserChangePasswordProps) =>
  useMutate<BooleanAjaxResponse, AjaxResponseBase, UserChangePasswordQueryParams, ChangePasswordDto, void>(
    'POST',
    `/api/services/app/User/ChangePassword`,
    props
  );

export interface UserResetPasswordQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type UserResetPasswordProps = Omit<
  MutateProps<BooleanAjaxResponse, AjaxResponseBase, UserResetPasswordQueryParams, ResetPasswordDto, void>,
  'path' | 'verb'
>;

export const UserResetPassword = (props: UserResetPasswordProps) => (
  <Mutate<BooleanAjaxResponse, AjaxResponseBase, UserResetPasswordQueryParams, ResetPasswordDto, void>
    verb="POST"
    path={`/api/services/app/User/ResetPassword`}
    {...props}
  />
);

export type UseUserResetPasswordProps = Omit<
  UseMutateProps<BooleanAjaxResponse, AjaxResponseBase, UserResetPasswordQueryParams, ResetPasswordDto, void>,
  'path' | 'verb'
>;

export const useUserResetPassword = (props: UseUserResetPasswordProps) =>
  useMutate<BooleanAjaxResponse, AjaxResponseBase, UserResetPasswordQueryParams, ResetPasswordDto, void>(
    'POST',
    `/api/services/app/User/ResetPassword`,
    props
  );

export interface UserGetUserAuthConfigQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type UserGetUserAuthConfigProps = Omit<
  GetProps<AbpUserAuthConfigDtoAjaxResponse, AjaxResponseBase, UserGetUserAuthConfigQueryParams, void>,
  'path'
>;

export const UserGetUserAuthConfig = (props: UserGetUserAuthConfigProps) => (
  <Get<AbpUserAuthConfigDtoAjaxResponse, AjaxResponseBase, UserGetUserAuthConfigQueryParams, void>
    path={`/api/services/app/User/GetUserAuthConfig`}
    {...props}
  />
);

export type UseUserGetUserAuthConfigProps = Omit<
  UseGetProps<AbpUserAuthConfigDtoAjaxResponse, AjaxResponseBase, UserGetUserAuthConfigQueryParams, void>,
  'path'
>;

export const useUserGetUserAuthConfig = (props: UseUserGetUserAuthConfigProps) =>
  useGet<AbpUserAuthConfigDtoAjaxResponse, AjaxResponseBase, UserGetUserAuthConfigQueryParams, void>(
    `/api/services/app/User/GetUserAuthConfig`,
    props
  );

export interface UserGetQueryParams {
  id?: number;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type UserGetProps = Omit<GetProps<UserDtoAjaxResponse, AjaxResponseBase, UserGetQueryParams, void>, 'path'>;

export const UserGet = (props: UserGetProps) => (
  <Get<UserDtoAjaxResponse, AjaxResponseBase, UserGetQueryParams, void>
    path={`/api/services/app/User/Get`}
    {...props}
  />
);

export type UseUserGetProps = Omit<
  UseGetProps<UserDtoAjaxResponse, AjaxResponseBase, UserGetQueryParams, void>,
  'path'
>;

export const useUserGet = (props: UseUserGetProps) =>
  useGet<UserDtoAjaxResponse, AjaxResponseBase, UserGetQueryParams, void>(`/api/services/app/User/Get`, props);

export interface UserGetAllQueryParams {
  keyword?: string | null;
  isActive?: boolean | null;
  skipCount?: number;
  maxResultCount?: number;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type UserGetAllProps = Omit<
  GetProps<UserDtoPagedResultDtoAjaxResponse, AjaxResponseBase, UserGetAllQueryParams, void>,
  'path'
>;

export const UserGetAll = (props: UserGetAllProps) => (
  <Get<UserDtoPagedResultDtoAjaxResponse, AjaxResponseBase, UserGetAllQueryParams, void>
    path={`/api/services/app/User/GetAll`}
    {...props}
  />
);

export type UseUserGetAllProps = Omit<
  UseGetProps<UserDtoPagedResultDtoAjaxResponse, AjaxResponseBase, UserGetAllQueryParams, void>,
  'path'
>;

export const useUserGetAll = (props: UseUserGetAllProps) =>
  useGet<UserDtoPagedResultDtoAjaxResponse, AjaxResponseBase, UserGetAllQueryParams, void>(
    `/api/services/app/User/GetAll`,
    props
  );
