import qs from "qs";
import { HttpClientApi } from "../http/api";
import { IAjaxResponse } from "@/interfaces";

const URLS = {
    IS_PERMISSION_GRANTED: '/api/services/app/Permission/IsPermissionGranted',
    IS_ROLE_GRANTED: '/api/services/app/ShaRole/IsRoleGranted',
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
    hasPermissionAsync(module: string, permissionName: string): Promise<boolean>;
    hasRoleAsync(roleName: string): Promise<boolean>;
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

    async hasPermissionAsync(permissionName: string): Promise<boolean> {
        if (!this.isLoggedIn)
            return Promise.resolve(false);
        
        const requestParams = {
            permissionName: permissionName
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
}