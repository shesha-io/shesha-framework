import qs from 'qs';
import { HttpClientApi } from '@/publicJsApis/httpClient';
import { IAjaxResponse, IEntityReferenceDto } from '@/interfaces';
import { GrantedPermissionDto } from '@/apis/session';

const URLS = {
  IS_PERMISSION_GRANTED: '/api/services/app/Permission/IsPermissionGranted',
  IS_ROLE_GRANTED: '/api/services/app/ShaRole/IsRoleGranted',
  GET_USER_SETTING_VALUE: '/api/services/app/Settings/GetUserValue',
  UPDATE_USER_SETTING_VALUE: '/api/services/app/Settings/UpdateUserValue',
};

export interface IUserProfileInfo {
  readonly id: string;
  readonly userName: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly personId: string;
}

export interface ICurrentUserApi {
  readonly isLoggedIn: boolean;
  readonly id: string;
  readonly userName: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly personId: string;
  hasPermissionAsync(mpermissionName: string, permissionedEntityId?: IEntityReferenceDto): Promise<boolean>;
  hasRoleAsync(roleName: string): Promise<boolean>;
  getUserSettingValueAsync(name: string, module: string, defaultValue?: any, dataType?: string): Promise<any>;
  updateUserSettingValueAsync(name: string, module: string, value: any, dataType?: string): Promise<void>;
}

export interface IInternalCurrentUserApi extends ICurrentUserApi {
  setProfileInfo(profileInfo: IUserProfileInfo): void;
  setGrantedPermissions(permissions: GrantedPermissionDto[]): void;
}

export class CurrentUserApi implements IInternalCurrentUserApi {
  readonly #httpClient: HttpClientApi;
  #profileInfo: IUserProfileInfo;
  #grantedPermissions: GrantedPermissionDto[];

  //#region profile data
  get isLoggedIn() {
    return Boolean(this.#profileInfo);
  }
  get id() {
    return this.#profileInfo?.id;
  }
  get userName() {
    return this.#profileInfo?.userName;
  }
  get firstName() {
    return this.#profileInfo?.firstName;
  }
  get lastName() {
    return this.#profileInfo?.lastName;
  }
  get personId() {
    return this.#profileInfo?.personId;
  }
  //#endregion

  constructor(httpClient: HttpClientApi) {
    this.#httpClient = httpClient;
  }

  setProfileInfo(profileInfo: IUserProfileInfo) {
    this.#profileInfo = profileInfo;
  }

  setGrantedPermissions(permissions: GrantedPermissionDto[]): void {
    this.#grantedPermissions = permissions;
  }

  async hasPermissionAsync(permissionName: string, permissionedEntity?: IEntityReferenceDto): Promise<boolean> {
    if (!this.isLoggedIn) return Promise.resolve(false);

    if (this.#grantedPermissions) {
      return permissionedEntity
        ? this.#grantedPermissions.some(
            (p) =>
              p.permission === permissionName &&
              p.permissionedEntity?.some(
                (e) => e.id === permissionedEntity.id && e._className === permissionedEntity._className
              )
          )
        : this.#grantedPermissions.some((p) => p.permission === permissionName);
    }

    const requestParams = {
      permissionName,
      permissionedEntityId: permissionedEntity ? permissionedEntity?.id : undefined,
      permissionedEntityClass: permissionedEntity ? permissionedEntity?._className : undefined,
    };
    return this.#httpClient
      .get<IAjaxResponse<boolean>>(`${URLS.IS_PERMISSION_GRANTED}?${qs.stringify(requestParams)}`)
      .then((response) => (response.data?.success ? response.data.result : false));
  }

  async hasRoleAsync(roleName: string): Promise<boolean> {
    if (!this.isLoggedIn) return Promise.resolve(false);

    const requestParams = {
      roleName: roleName,
    };
    return this.#httpClient
      .get<IAjaxResponse<boolean>>(`${URLS.IS_ROLE_GRANTED}?${qs.stringify(requestParams)}`)
      .then((response) => (response.data?.success ? response.data.result : false));
  }

  async getUserSettingValueAsync(name: string, module: string, defaultValue?: any, dataType?: string): Promise<any> {
    return this.#httpClient
      .post<IAjaxResponse<void>>(URLS.GET_USER_SETTING_VALUE, { name, module, defaultValue, dataType })
      .then((res) => {
        return res.data.success ? res.data.result : undefined;
      });
  }

  async updateUserSettingValueAsync(name: string, module: string, value: any, dataType?: string): Promise<void> {
    return this.#httpClient
      .post<IAjaxResponse<void>>(URLS.UPDATE_USER_SETTING_VALUE, { name, module, value, dataType })
      .then((res) => {
        if (!res.data.success) throw new Error('Failed to update setting value: ' + res.data.error.message);
      });
  }
}
