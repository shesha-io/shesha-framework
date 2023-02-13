interface IHasEntityType {
    entityType: string;
}

/**
 * Get All payload
 */
export interface IGetAllPayload {
    readonly maxResultCount: number;
    readonly skipCount: number;
    readonly properties: string;
    readonly sorting?: string;
    readonly filter?: string;
    readonly quickSearch?: string;
}
/**
 * Generic get all payload, is used for the generic entpoint like `/api/services/app/Entities/GetAll`
 */
export interface IGenericGetAllPayload extends IGetAllPayload, IHasEntityType {}

/**
 * Get entity payload
 */
export interface IGetPayload {
    readonly properties: string;
    readonly id: string;
}
/**
 * Generic get entity payload, is used for the generic entpoint like `/api/services/app/Entities/Get`
 */
export interface IGenericGetPayload extends IGetPayload, IHasEntityType {}

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

export interface AbpWrappedResponse<TData, TError> {
    targetUrl?: string | null;
    success?: boolean;
    error?: TError;
    unAuthorizedRequest?: boolean;
    __abp?: boolean;
    result?: TData;
}

export interface GetAllResponse<TItem> {
    totalCount: number;
    items: TItem[];
}

export interface EntityData {
    id: string | number,
    [key: string]: any;
}

export interface IAbpWrappedResponse<TResponse, TError = ErrorInfo> extends AbpWrappedResponse<TResponse, TError> {
    
}

export interface IAbpWrappedGetEntityResponse<TItem = EntityData, TError = ErrorInfo> extends AbpWrappedResponse<TItem, TError> {
    
}

export interface IAbpWrappedGetEntityListResponse<TItem = EntityData, TError = ErrorInfo> extends AbpWrappedResponse<GetAllResponse<TItem>, TError> {
    
}