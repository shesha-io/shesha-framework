import { FormIdentifier, FormMarkup, FormMode, IFlatComponentsStructure, IFormSettings, IFormValidationErrors, IModelMetadata } from "@/interfaces";
import { IErrorInfo } from "@/interfaces/errorInfo";
import { FormInfo } from "../api";
import { FormInstance } from "antd";
import { IDelayedUpdateGroup } from "@/providers/delayedUpdateProvider/models";
import { IFormApi } from "../formApi";
import { ISetFormDataPayload } from "../contexts";
import { IEntityEndpoints } from "@/providers/sheshaApplication/publicApi/entities/entityTypeAccessor";
import { ExpressionCaller, IDataArguments, SubmitCaller } from "../submitters/interfaces";
import { ShaFormSubscriptionType } from "./shaFormInstance";
import { RecursivePartial } from "@/interfaces/entity";

export type LoaderType = 'gql' | 'custom' | 'none';
export type SubmitType = 'gql' | 'custom' | 'none';

export interface InitByFormIdPayload<Values extends object = object> {
  formId: FormIdentifier;
  formArguments?: object | undefined;
  initialValues?: Values | undefined;
}

export interface InitByRawMarkupPayload<Values extends object = object> {
  rawMarkup: FormMarkup;
  cacheKey?: string;
  formArguments?: object;
  initialValues: Values | undefined;
  isSettingsForm?: boolean | undefined;
}

export interface InitByMarkupPayload {
  formSettings: IFormSettings;
  formFlatMarkup: IFlatComponentsStructure;
  formArguments?: object;
}

export interface LoadFormByIdPayload<Values extends object = object> {
  skipCache?: boolean | undefined;
  initialValues?: Values | undefined;
}

export type LoadingStatus = 'waiting' | 'loading' | 'ready' | 'failed';
export interface ProcessingState {
  status: LoadingStatus;
  hint?: string | undefined;
  error?: IErrorInfo | undefined;
}

export type SubmitHandler<Values extends object = object> = (values: Values) => void;
export type AfterSubmitHandler<Values extends object = object> = (values: Values, response?: unknown, options?: object) => void;

export type SubmitDataPayload = {
  customSubmitCaller?: SubmitCaller;
};

export type OnValuesChangeHandler<Values extends object = object> = (changedValues: Partial<Values>, values: Values) => void;
export type OnMarkupLoadedHandler<Values extends object = object> = (shaForm: IShaFormInstance<Values>) => Promise<void>;

export interface IDataSubmitContext {
  getDelayedUpdates: () => IDelayedUpdateGroup[];
}

export type ForceUpdateTrigger = () => void;

export interface IShaFormInstance<Values extends object = object> {
  applyMarkupAsync(args: { formFlatMarkup: IFlatComponentsStructure; formSettings: IFormSettings }): unknown;
  setDataSubmitContext: (context: IDataSubmitContext) => void;
  setInitialValues: (values: Values) => void;
  setSubmitHandler: (handler: SubmitHandler<Values>) => void;
  setAfterSubmitHandler: (handler: AfterSubmitHandler<Values>) => void;
  setOnValuesChange: (handler: OnValuesChangeHandler<Values>) => void;
  setOnMarkupLoaded: (handler: OnMarkupLoadedHandler<Values>) => void;

  initByRawMarkup: (payload: InitByRawMarkupPayload<Values>) => Promise<void>;
  initByMarkup: (payload: InitByMarkupPayload) => Promise<void>;
  initByFormId: (payload: InitByFormIdPayload<Values>) => Promise<void>;
  reloadMarkup: () => Promise<void>;

  loadData: (formArguments: object) => Promise<Values>;
  submitData: (payload?: SubmitDataPayload) => Promise<Values>;
  fetchData: () => Promise<Values>;

  getDelayedUpdates: () => IDelayedUpdateGroup[];

  readonly markupLoadingState: ProcessingState;
  readonly dataLoadingState: ProcessingState;
  readonly dataSubmitState: ProcessingState;

  readonly form?: FormInfo | undefined;
  readonly formId?: FormIdentifier | undefined;
  readonly settings?: IFormSettings | undefined;
  readonly flatStructure?: IFlatComponentsStructure | undefined;
  readonly initialValues?: Values | undefined;
  readonly parentFormValues?: object | undefined;
  readonly formArguments?: object | undefined;
  readonly formData?: Values | undefined;
  readonly isDataModified: boolean;
  readonly formMode: FormMode;
  readonly antdForm: FormInstance;
  readonly defaultApiEndpoints: IEntityEndpoints;
  readonly modelMetadata?: IModelMetadata | undefined;
  readonly validationErrors?: IFormValidationErrors | undefined;

  setFormMode: (formMode: FormMode) => void;
  setFormData: (payload: ISetFormDataPayload<Values>) => void;
  setParentFormValues: (values: object) => void;
  setValidationErrors: (payload: IFormValidationErrors | undefined) => void;

  onFinish?: ((values: Values) => void) | undefined;

  setLogEnabled: (enabled: boolean) => void;
  getPublicFormApi: () => IFormApi<Values>;

  //#region antd methods
  submit: () => void;
  setFieldsValue: (values: RecursivePartial<Values>) => void;
  resetFields: () => void;
  getFieldsValue: () => Values;
  validateFields: () => Promise<Values>;
  //#endregion

  updateData?: (() => void) | undefined;
  subscribe(type: ShaFormSubscriptionType, callback: () => void): () => void;
}

export interface SubmitRelatedEvents<Values extends object = object> {
  onPrepareSubmitData?: ExpressionCaller<IDataArguments<Values>, Promise<Values>> | undefined;
  onBeforeSubmit?: ExpressionCaller<IDataArguments<Values>, Promise<void>> | undefined;
  onSubmitSuccess?: (() => Promise<void>) | undefined;
  onSubmitFailed?: (() => Promise<void>) | undefined;
}

export interface LiveFormEvents<Values extends object = object> {
  onBeforeDataLoad?: (() => Promise<void>) | undefined;
  onAfterDataLoad?: (() => Promise<void>) | undefined;
  onValuesUpdate?: ExpressionCaller<IDataArguments<Values>, Promise<void>> | undefined;
}

export interface FormEvents<Values extends object = object> extends LiveFormEvents<Values>, SubmitRelatedEvents<Values> {

}
