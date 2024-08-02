import qs from "qs";
import { HttpClientApi } from "../http/api";
import { IAjaxResponse, IEntityReferenceDto } from "@/interfaces";

const URLS = {
    IS_PERMISSION_GRANTED: '/api/services/app/Permission/IsPermissionGranted',
    IS_ROLE_GRANTED: '/api/services/app/ShaRole/IsRoleGranted',
    GET_USER_SETTING_VALUE: '/api/services/app/Settings/GetUserValue',
    UPDATE_USER_SETTING_VALUE: '/api/services/app/Settings/UpdateUserValue'
};

export interface IUserProfileInfo {
    readonly id: string;
    readonly userName: string;
    readonly firstName: string;
    readonly lastName: string;
}

export interface ICurrentUserApi {
    readonly id: string;
    readonly userName: string;
    readonly firstName: string;
    readonly lastName: string;
    hasPermissionAsync(mpermissionName: string, permissionedEntityId?: IEntityReferenceDto): Promise<boolean>;
    hasRoleAsync(roleName: string): Promise<boolean>;
    getuserSettingValueAsync(name: string, module: string): Promise<any>;
    updateUserSettingValueAsync(name: string, module: string, value: any): Promise<void>;
}

export interface IInternalCurrentUserApi extends ICurrentUserApi {
    setProfileInfo(profileInfo: IUserProfileInfo): void;
}

export class CurrentUserApi implements IInternalCurrentUserApi {
    readonly #httpClient: HttpClientApi;
    #profileInfo: IUserProfileInfo;

    //#region profile data
    get isLoggedIn(){
        return Boolean(this.#profileInfo);
    }
    get id(){
        return this.#profileInfo?.id;
    }
    get userName(){
        return this.#profileInfo?.userName;
    }
    get firstName(){
        return this.#profileInfo?.firstName;
    }
    get lastName(){
        return this.#profileInfo?.lastName;
    }
    //#endregion

    constructor(httpClient: HttpClientApi) {
        this.#httpClient = httpClient;
    }

    setProfileInfo(profileInfo: IUserProfileInfo) {
        this.#profileInfo = profileInfo;
    }

    async hasPermissionAsync(permissionName: string, permissionedEntity?: IEntityReferenceDto): Promise<boolean> {
        if (!this.isLoggedIn)
            return Promise.resolve(false);
        
        const requestParams = {
            permissionName,
            permissionedEntityId: permissionedEntity ? permissionedEntity?.id : undefined,
            permissionedEntityClass: permissionedEntity ? permissionedEntity?._className : undefined
        };
        return this.#httpClient.get<IAjaxResponse<boolean>>(`${URLS.IS_PERMISSION_GRANTED}?${qs.stringify(requestParams)}`).then(response => response.data?.success ? response.data.result : false);
    };

    async hasRoleAsync(roleName: string): Promise<boolean> {
        if (!this.isLoggedIn)
            return Promise.resolve(false);
        
        const requestParams = {
            roleName: roleName
        };
        return this.#httpClient.get<IAjaxResponse<boolean>>(`${URLS.IS_ROLE_GRANTED}?${qs.stringify(requestParams)}`).then(response => response.data?.success ? response.data.result : false);
    }

    async getuserSettingValueAsync(name: string, module: string): Promise<any> {
        const url = `${URLS.GET_USER_SETTING_VALUE}?name=${name}&module=${module}`;
        return this.#httpClient.get<IAjaxResponse<any>>(url)
            .then(res => {
                return res.data.success ? res.data.result : undefined;
            });
    };

    async updateUserSettingValueAsync(name: string, module: string, value: any): Promise<void> {
        return this.#httpClient.post<IAjaxResponse<void>>(URLS.UPDATE_USER_SETTING_VALUE, {name,module,value})
            .then(res => {
                if (!res.data.success)
                    throw new Error("Failed to update setting value: " + res.data.error.message);
            });
    };
}