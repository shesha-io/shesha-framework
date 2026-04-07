import { IApiEndpoint, IFlatComponentsStructure, IFormSettings, IPropertyMetadata } from "@/interfaces";
import { IErrorInfo } from "@/interfaces/errorInfo";
import { ExpressionExecuter } from "../submitters/interfaces";

export interface FormDataLoadingPayload {
  formArguments?: object | undefined;
  formSettings: IFormSettings;
  formFlatStructure: IFlatComponentsStructure;
  loadingCallback?: LoadingCallback | undefined;
  expressionExecuter: ExpressionExecuter;
}

export interface IFormDataLoader<Values extends object = object> {
  loadAsync: (payload: FormDataLoadingPayload) => Promise<Values | undefined>;
  canLoadData: (formArguments: object | undefined) => boolean;
}

export interface IFieldData {
  name: string;
  child: IFieldData[];
  property: IPropertyMetadata | undefined;
}

export interface GetFormFieldsPayload {
  formFlatStructure: IFlatComponentsStructure;
  formSettings: IFormSettings;
}

export type GetGqlFieldsPayload = GetFormFieldsPayload;

export type LoadingState = 'waiting' | 'loading' | 'ready' | 'failed';
export interface LoadingCallbackState {
  loaderHint?: string | undefined;
  loadingState: LoadingState;
  error?: IErrorInfo | undefined;
}
export type LoadingCallback = (loadingState: LoadingCallbackState) => void;

export type LoaderEndpointType = 'default' | 'static' | 'dynamic';
export interface GqlLoaderSettings {
  fieldsToFetch?: string[] | undefined;
  endpointType: LoaderEndpointType;
  staticEndpoint?: IApiEndpoint | undefined;
  dynamicEndpoint?: string | undefined;
}

export interface CustomLoaderSettings {
  onDataLoad: string;
}

export const isGqlLoaderSettings = (s: unknown): s is GqlLoaderSettings => {
  return s && typeof s === 'object' && "endpointType" in s && typeof (s.endpointType) === 'string';
};

export const isCustomLoaderSettings = (s: unknown): s is CustomLoaderSettings => {
  return s && typeof s === 'object' && "onDataLoad" in s && typeof (s.onDataLoad) === 'string';
};
