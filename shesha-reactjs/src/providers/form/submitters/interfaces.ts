import { IApiEndpoint, IFlatComponentsStructure, IFormSettings } from "@/interfaces";
import { IDelayedUpdateGroup } from "@/providers/delayedUpdateProvider/models";
import { FormInstance } from "antd";
import { SubmitRelatedEvents } from "../store/interfaces";
import { isDefined } from "@/utils/nullables";

export type SubmitOperation = 'create' | 'update'/* | 'delete'*/;

export type ExpressionExecuter<TArguments = unknown, TResult = unknown> = (expression: string, args: TArguments) => Promise<TResult>;
export type ExpressionCaller<TArguments = unknown, TResult = unknown> = (args: TArguments) => TResult;
export type ExpressionFactory<TArguments extends object = object, TResult = unknown> = (expression: string) => ExpressionCaller<TArguments, TResult>;
export type AsyncExpressionFactory<TArguments extends object = object, TResult = unknown> = ExpressionFactory<TArguments, Promise<TResult>>;

export interface IDataArguments<Values> {
  data: Values;
}

export interface FormDataSubmitPayload<Values extends object = object> extends Required<SubmitRelatedEvents<Values>> {
  data: Values;
  formSettings: IFormSettings;
  formFlatStructure: IFlatComponentsStructure;
  expressionExecuter: ExpressionExecuter;
  antdForm: FormInstance;
  getDelayedUpdates: () => IDelayedUpdateGroup[];
  customSubmitCaller?: SubmitCaller | undefined;
}

export interface IFormDataSubmitter<Values extends object = object> {
  submitAsync: (payload: FormDataSubmitPayload<Values>) => Promise<unknown>;
}

export type SubmitterEndpointType = 'default' | 'static' | 'dynamic';

export interface GqlSubmitterSettings {
  excludeFormFields?: string;
  endpointType: SubmitterEndpointType;
  staticEndpoint?: IApiEndpoint;
  dynamicEndpoint?: string;
}

export const isGqlSubmitterSettings = (s: unknown): s is GqlSubmitterSettings => {
  return isDefined(s) && typeof s === 'object' && "endpointType" in s && typeof (s.endpointType) === 'string';
};

export interface CustomSubmitterSettings {
  onSubmitData: string;
}

export const isCustomSubmitterSettings = (s: unknown): s is CustomSubmitterSettings => {
  return isDefined(s) && typeof s === 'object' && "onSubmitData" in s && typeof (s.onSubmitData) === 'string';
};

export type SubmitCaller<Values extends object = object> = (data: Values) => Promise<unknown | undefined>;
