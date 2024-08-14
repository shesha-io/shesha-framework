import { IApiEndpoint, IFlatComponentsStructure, IFormSettings, IPropertyMetadata } from "@/interfaces";
import { IErrorInfo } from "@/interfaces/errorInfo";
import { ExpressionExecuter } from "../submitters/interfaces";

export interface FormDataLoadingPayload {
    dataId?: string;
    formSettings: IFormSettings;
    formFlatStructure: IFlatComponentsStructure;
    loadingCallback?: LoadingCallback;
    expressionExecuter: ExpressionExecuter;
}

export interface IFormDataLoader {
    loadAsync: (payload: FormDataLoadingPayload) => Promise<any>;
}

export interface IFieldData {
    name: string;
    child: IFieldData[];
    property: IPropertyMetadata;
}

export interface GetFormFieldsPayload {
    formFlatStructure: IFlatComponentsStructure;
    formSettings: IFormSettings;
}

export interface GetGqlFieldsPayload extends GetFormFieldsPayload {

}

export type LoadingState = 'waiting' | 'loading' | 'ready' | 'failed';
export interface LoadingCallbackState {
    loaderHint?: string;
    loadingState: LoadingState;
    error?: IErrorInfo;
}
export type LoadingCallback = (loadingState: LoadingCallbackState) => void;

export type LoaderEndpointType = 'default' | 'static' | 'dynamic';
export interface GqlLoaderSettings {
    fieldsToFetch?: string[];
    endpointType: LoaderEndpointType;
    staticEndpoint?: IApiEndpoint;
    dynamicEndpoint?: string;
}

export const isGqlLoaderSettings = (s: any): s is GqlLoaderSettings => {
    return s && typeof s === 'object';
};