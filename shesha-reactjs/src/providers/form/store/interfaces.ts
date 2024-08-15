import { FormIdentifier, FormMarkup, FormMode, IFlatComponentsStructure, IFormSettings, IFormValidationErrors, IModelMetadata } from "@/interfaces";
import { IErrorInfo } from "@/interfaces/errorInfo";
import { ConfigurationItemsViewMode } from "@/providers/appConfigurator/models";
import { FormInfo } from "../api";
import { FormInstance } from "antd";
import { IDelayedUpdateGroup } from "@/providers/delayedUpdateProvider/models";
import { FormApi } from "../formApi";
import { ISetFormDataPayload } from "../contexts";
import { IEntityEndpoints } from "@/providers/sheshaApplication/publicApi/entities/entityTypeAccessor";

export type LoaderType = 'gql' | 'custom' | 'none';
export type SubmitType = 'gql' | 'custom' | 'none';

export interface InitByFormIdPayload {
    formId: FormIdentifier;
    configurationItemMode: ConfigurationItemsViewMode;
    formArguments?: any;
}

export interface InitByRawMarkupPayload {
    rawMarkup: FormMarkup;
    cacheKey?: string;
    formArguments?: any;
    initialValues: any;
    isSettingsForm?: boolean;        
}

export interface InitByMarkupPayload {
    formSettings: IFormSettings;
    formFlatMarkup: IFlatComponentsStructure;
    formArguments?: any;
}

export type LoadingStatus = 'waiting' | 'loading' | 'ready' | 'failed';
export interface ProcessingState {
    status: LoadingStatus;
    hint?: string;
    error?: IErrorInfo;
}

export type SubmitHandler<Values = any> = (values: Values) => void;
export type AfterSubmitHandler<Values = any> = (values: Values, response?: any, options?: object) => void;

export type SubmitDataPayload<Values = any> = {
    data: Values;
    antdForm: FormInstance<Values>;
    getDelayedUpdates: () => IDelayedUpdateGroup[];
};

export type OnValuesChangeHandler<Values = any> = (changedValues: any, values: Values) => void;

export interface IShaFormInstance<Values = any> {
    setInitialValues: (values: Values) => void;
    setSubmitHandler: (handler: SubmitHandler<Values>) => void;
    setAfterSubmitHandler: (handler: AfterSubmitHandler<Values>) => void;
    setOnValuesChange: (handler: OnValuesChangeHandler<Values>) => void;

    initByRawMarkup: (payload: InitByRawMarkupPayload) => Promise<void>;
    initByMarkup: (payload: InitByMarkupPayload) => Promise<void>;
    initByFormId: (payload: InitByFormIdPayload) => Promise<void>;
    reloadMarkup: () => Promise<void>;

    loadData: (formArguments: any) => Promise<Values>;
    submitData: (payload: SubmitDataPayload<Values>) => Promise<Values>;
    fetchData: () => Promise<Values>;

    readonly markupLoadingState: ProcessingState;
    readonly dataLoadingState: ProcessingState;
    readonly dataSubmitState: ProcessingState;

    readonly form?: FormInfo;
    readonly settings?: IFormSettings;
    readonly flatStructure?: IFlatComponentsStructure;
    readonly initialValues?: Values;
    readonly formArguments?: any;
    readonly formData?: any;
    readonly formMode: FormMode;
    readonly antdForm: FormInstance;
    readonly defaultApiEndpoints: IEntityEndpoints;
    readonly modelMetadata?: IModelMetadata;
    readonly validationErrors?: IFormValidationErrors;

    setFormMode: (formMode: FormMode) => void;
    setFormData: (payload: ISetFormDataPayload) => void;
    setValidationErrors: (payload: IFormValidationErrors) => void;

    onFinish?: (values: Values) => void;

    setLogEnabled: (enabled: boolean) => void;
    getPublicFormApi: () => FormApi<Values>;

    //#region antd methods
    submit: () => void;
    setFieldsValue: (values: Partial<Values>) => void;
    resetFields: () => void;
    getFieldsValue: () => Values;
    validateFields: () => Promise<Values>;
    //#endregion    
}

export interface SubmitRelatedEvents<Values = any> {
    onPrepareSubmitData?: (data: Values) => Promise<Values>;
    onBeforeSubmit?: (data: Values) => Promise<void>;
    onSubmitSuccess?: () => Promise<void>;
    onSubmitFailed?: () => Promise<void>;
}

export interface LiveFormEvents<Values = any> {
    onBeforeDataLoad?: () => Promise<void>;
    onAfterDataLoad?: () => Promise<void>;
    onValuesChanged?: (data: Values) => Promise<void>;
    // TODO: handle for internal purposes (settings forms etc.)
    //onValuesChange?: (changedValues: any, values: Values) => void;
}

export interface FormEvents<Values = any> extends LiveFormEvents<Values>, SubmitRelatedEvents<Values> {

}