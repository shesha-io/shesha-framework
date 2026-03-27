import qs from 'qs';
import { HttpClientApi } from '@/publicJsApis/httpClient';
import { IAjaxResponse, IEntityReferenceDto } from '@/interfaces';
import { GrantedPermissionDto } from '@/apis/session';
import { extractAjaxResponse, isAjaxErrorResponse } from '@/interfaces/ajaxResponse';
import { isDefined } from '@/utils/nullables';

const URLS = {
  IS_PERMISSION_GRANTED: '/api/services/app/Permission/IsPermissionGranted',
  IS_ROLE_GRANTED: '/api/services/app/ShaRole/IsRoleGranted',
  GET_USER_SETTING_VALUE: '/api/services/app/Settings/GetUserValue',
  UPDATE_USER_SETTING_VALUE: '/api/services/app/Settings/UpdateUserValue',
};

export interface IUserProfileInfo {
  readonly id: string;
  readonly userName: string;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly personId: string;
}

export interface ICurrentUserApi {
  readonly isLoggedIn: boolean;
  readonly id: string | undefined;
  readonly userName: string | undefined;
  readonly firstName: string | undefined;
  readonly lastName: string | undefined;
  readonly personId: string | undefined;
  hasPermissionAsync(mpermissionName: string, permissionedEntityId?: IEntityReferenceDto): Promise<boolean>;
  hasRoleAsync(roleName: string): Promise<boolean>;
  getUserSettingValueAsync(name: string, module: string, defaultValue?: unknown, dataType?: string): Promise<unknown>;
  updateUserSettingValueAsync(name: string, module: string, value: unknown, dataType?: string): Promise<void>;
}

export interface IInternalCurrentUserApi extends ICurrentUserApi {
  setProfileInfo(profileInfo: IUserProfileInfo | undefined): void;
  setGrantedPermissions(permissions: GrantedPermissionDto[]): void;
}

export class CurrentUserApi implements IInternalCurrentUserApi {
  readonly #httpClient: HttpClientApi;

  #profileInfo: IUserProfileInfo | undefined;

  #grantedPermissions: GrantedPermissionDto[] | undefined;

  //#region profile data
  get isLoggedIn(): boolean {
    return Boolean(this.#profileInfo);
  }

  get id(): string | undefined {
    return this.#profileInfo?.id;
  }

  get userName(): string | undefined {
    return this.#profileInfo?.userName;
  }

  get firstName(): string | undefined {
    return this.#profileInfo?.firstName;
  }

  get lastName(): string | undefined {
    return this.#profileInfo?.lastName;
  }

  get personId(): string | undefined {
    return this.#profileInfo?.personId;
  }
  //#endregion

  constructor(httpClient: HttpClientApi) {
    this.#httpClient = httpClient;
  }

  setProfileInfo(profileInfo: IUserProfileInfo | undefined): void {
    this.#profileInfo = profileInfo;
  }

  setGrantedPermissions(permissions: GrantedPermissionDto[]): void {
    this.#grantedPermissions = permissions;
  }

  async hasPermissionAsync(permissionName: string, permissionedEntity?: IEntityReferenceDto): Promise<boolean> {
    if (!this.isLoggedIn) return Promise.resolve(false);

    if (isDefined(this.#grantedPermissions)) {
      return permissionedEntity
        ? this.#grantedPermissions.some(
          (p) =>
            p.permission === permissionName &&
            p.permissionedEntity?.some(
              (e) => e.id === permissionedEntity.id && e._className === permissionedEntity._className,
            ),
        )
        : this.#grantedPermissions.some((p) => p.permission === permissionName);
    }

    const requestParams = {
      permissionName,
      permissionedEntityId: permissionedEntity ? permissionedEntity.id : undefined,
      permissionedEntityClass: permissionedEntity ? permissionedEntity._className : undefined,
    };
    const response = await this.#httpClient
      .get<IAjaxResponse<boolean>>(`${URLS.IS_PERMISSION_GRANTED}?${qs.stringify(requestParams, { allowDots: true })}`);

    return extractAjaxResponse(response.data);
  }

  hasRoleAsync(roleName: string): Promise<boolean> {
    if (!this.isLoggedIn) return Promise.resolve(false);

    const requestParams = {
      roleName: roleName,
    };
    return this.#httpClient
      .get<IAjaxResponse<boolean>>(`${URLS.IS_ROLE_GRANTED}?${qs.stringify(requestParams, { allowDots: true })}`)
      .then((response) => {
        return extractAjaxResponse(response.data);
      });
  }

  getUserSettingValueAsync = <TValue = unknown>(name: string, module: string, defaultValue?: TValue, dataType?: string): Promise<TValue | undefined> => {
    return this.#httpClient
      .post<IAjaxResponse<void>>(URLS.GET_USER_SETTING_VALUE, { name, module, defaultValue, dataType })
      .then((res) => {
        return res.data.success ? res.data.result as TValue : undefined;
      });
  };

  updateUserSettingValueAsync = <TValue = unknown>(name: string, module: string, value: TValue, dataType?: string): Promise<void> => {
    return this.#httpClient
      .post<IAjaxResponse<void>>(URLS.UPDATE_USER_SETTING_VALUE, { name, module, value, dataType })
      .then((res) => {
        if (isAjaxErrorResponse(res.data))
          throw new Error('Failed to update setting value: ' + res.data.error.message);
      });
  };
}
