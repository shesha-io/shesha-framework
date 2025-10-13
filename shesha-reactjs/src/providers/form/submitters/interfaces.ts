import { IApiEndpoint, IFlatComponentsStructure, IFormSettings } from "@/interfaces";
import { IDelayedUpdateGroup } from "@/providers/delayedUpdateProvider/models";
import { FormInstance } from "antd";
import { SubmitRelatedEvents } from "../store/interfaces";

export type SubmitOperation = 'create' | 'update'/* | 'delete'*/;

export type ExpressionExecuter<TArguments = any, TResult = any> = (expression: string, args: TArguments) => Promise<TResult>;

export type ExpressionCaller<TArguments = any, TResult = any> = (args: TArguments) => TResult;
export type ExpressionFactory<TArguments = any, TResult = any> = (expression: string) => ExpressionCaller<TArguments, TResult>;
export type AsyncExpressionFactory<TArguments = any, TResult = any> = ExpressionFactory<TArguments, Promise<TResult>>;

export interface IDataArguments<Values> {
  data: Values;
}

export interface FormDataSubmitPayload extends Required<SubmitRelatedEvents> {
  data: any;
  formSettings: IFormSettings;
  formFlatStructure: IFlatComponentsStructure;
  expressionExecuter: ExpressionExecuter;
  antdForm: FormInstance;
  getDelayedUpdates: () => IDelayedUpdateGroup[];
  customSubmitCaller?: SubmitCaller;
}

export interface IFormDataSubmitter {
  submitAsync: (payload: FormDataSubmitPayload) => Promise<any>;
}

export type SubmitterEndpointType = 'default' | 'static' | 'dynamic';

export interface GqlSubmitterSettings {
  excludeFormFields?: string;
  endpointType: SubmitterEndpointType;
  staticEndpoint?: IApiEndpoint;
  dynamicEndpoint?: string;
}

export const isGqlSubmitterSettings = (s: unknown): s is GqlSubmitterSettings => {
  return s && typeof s === 'object' && "endpointType" in s && typeof (s.endpointType) === 'string';
};

export interface CustomSubmitterSettings {
  onSubmitData: string;
}

export const isCustomSubmitterSettings = (s: unknown): s is CustomSubmitterSettings => {
  return s && typeof s === 'object' && "onSubmitData" in s && typeof (s.onSubmitData) === 'string';
};

export type SubmitCaller = (data: any) => Promise<any>;
