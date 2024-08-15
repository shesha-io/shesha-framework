import React from "react";
import { AfterSubmitHandler, FormEvents, InitByFormIdPayload, InitByMarkupPayload, InitByRawMarkupPayload, IShaFormInstance, OnValuesChangeHandler, ProcessingState, SubmitDataPayload, SubmitHandler } from "./interfaces";
import { IFormDataLoader } from "../loaders/interfaces";
import { FormIdentifier, FormMarkup, FormMode, IFlatComponentsStructure, IFormSettings, IFormValidationErrors, IModelMetadata, isEntityMetadata } from "@/interfaces";
import { ExpressionCaller, ExpressionExecuter, IFormDataSubmitter } from "../submitters/interfaces";
import { IFormManagerActionsContext } from "@/providers/formManager/contexts";
import { useFormManager } from "@/providers/formManager";
import { IFormDataLoadersContext, useFormDataLoaders } from "../loaders/formDataLoadersProvider";
import { IFormDataSubmittersContext, useFormDataSubmitters } from "../submitters/formDataSubmittersProvider";
import { FormInfo } from "../api";
import { executeScript, getComponentsAndSettings, IApplicationContext, isSameFormIds, useAvailableConstantsContexts, wrapConstantsData } from "../utils";
import { ConfigurationItemsViewMode } from "@/providers/appConfigurator/models";
import { Form, FormInstance } from "antd";
import { FormApi } from "../formApi";
import { ISetFormDataPayload } from "../contexts";
import { setValueByPropertyName } from "@/utils/object";
import { makeObservableProxy } from "../observableProxy";
import { IMetadataDispatcher } from "@/providers/metadataDispatcher/contexts";
import { IEntityEndpoints } from "@/providers/sheshaApplication/publicApi/entities/entityTypeAccessor";
import { useMetadataDispatcher } from "@/providers";

type ForceUpdateTrigger = () => void;
interface ShaFormInstanceArguments {
    forceRootUpdate: ForceUpdateTrigger;
    formManager: IFormManagerActionsContext;
    metadataDispatcher: IMetadataDispatcher;
    dataLoaders: IFormDataLoadersContext;
    dataSubmitters: IFormDataSubmittersContext;
    antdForm: FormInstance;
}

class PublicFormApi<Values = any> implements FormApi<Values> {
    #form: IShaFormInstance;
    constructor(form: IShaFormInstance){
        this.#form = form;
    }
    setFieldValue = (name: string, value: any) => {
        this.#form.setFormData({ values: setValueByPropertyName(this.#form.formData, name, value, true), mergeValues: true });        
    };
    setFieldsValue = (values: Values) => {
        this.#form.setFormData({ values, mergeValues: true });
    };
    submit = () => {
        this.#form.antdForm.submit();
    };
    setFormData = (payload: ISetFormDataPayload) => {
        this.#form.setFormData(payload);
    };
    get formInstance(): FormInstance<Values> {
        return this.#form.antdForm;
    };
    get formSettings() { 
        return this.#form.settings;
    };
    get formMode() {
        return this.#form.formMode;
    };
    get data() {
        return this.#form.formData;
    };
    get defaultApiEndpoints() {
        return this.#form.defaultApiEndpoints;
    };
    get formArguments() {
        return this.#form.formArguments;
    }
};

class ShaFormInstance<Values = any> implements IShaFormInstance<Values> {
    private forceRootUpdate: ForceUpdateTrigger;

    private formManager: IFormManagerActionsContext;
    private metadataDispatcher: IMetadataDispatcher;

    private dataLoaders: IFormDataLoadersContext;
    private dataSubmitters: IFormDataSubmittersContext;
    private expressionExecuter: ExpressionExecuter;
    private events: FormEvents<Values>;
    modelMetadata?: IModelMetadata;
    antdForm: FormInstance;
    formMode: FormMode;
    formData?: any;
    validationErrors?: IFormValidationErrors;

    defaultValues: Values;
    initialValues: any;
    formArguments?: any;

    onFinish: SubmitHandler<Values>;
    onAfterSubmit: AfterSubmitHandler<Values>;
    onValuesChange?: OnValuesChangeHandler<Values>;

    useDataLoader: boolean;
    useDataSubmitter: boolean;

    markupLoadingState: ProcessingState;
    dataLoadingState: ProcessingState;
    dataSubmitState: ProcessingState;

    form?: FormInfo;
    get settings(): IFormSettings {
        return this.form?.settings;
    };
    get flatStructure(): IFlatComponentsStructure {
        return this.form?.flatStructure;
    };

    formId?: FormIdentifier;
    rawMarkup?: FormMarkup;
    markupCacheKey?: string;
    isSettingsForm: boolean;
    configurationItemMode: ConfigurationItemsViewMode;

    logEnabled: boolean;

    constructor(args: ShaFormInstanceArguments) {
        this.antdForm = args.antdForm;
        this.formManager = args.formManager;
        this.metadataDispatcher = args.metadataDispatcher;
        this.dataLoaders = args.dataLoaders;
        this.dataSubmitters = args.dataSubmitters;
        this.expressionExecuter = undefined;

        this.logEnabled = false;
        this.isSettingsForm = false;
        this.useDataLoader = true;
        this.useDataSubmitter = true;
        this.formMode = 'readonly';

        this.markupLoadingState = { status: 'waiting' };
        this.dataLoadingState = { status: 'waiting' };
        this.dataSubmitState = { status: 'waiting' };

        this.forceRootUpdate = args.forceRootUpdate;
        this.events = {};
        this.formData = {};
    }
    
    setExpressionExecuter = (expressionExecuter: ExpressionExecuter) => {
        this.expressionExecuter = expressionExecuter;
    };
    setFormMode = (formMode: FormMode) => {
        if (this.formMode === formMode)
            return;

        this.formMode = formMode;
        this.forceRootUpdate();
    };

    setFormData = (payload: ISetFormDataPayload) => {
        const { values, mergeValues } = payload;
        const newData = payload.mergeValues && this.formData
            ? { ...this.formData, ...values }
            : values;

        this.formData = newData;

        if (this.onValuesChange)
            this.onValuesChange(values, newData);

        if (mergeValues) {
            this.antdForm.setFieldsValue(values);
        } else {
            this.antdForm.resetFields();
            this.antdForm.setFieldsValue(values);
        }

        this.forceRootUpdate();
    };

    setValidationErrors = (payload: IFormValidationErrors) => {
        this.validationErrors = payload ? { ...payload } : null;
        this.forceRootUpdate();
    };

    #publicFormApi: PublicFormApi;
    getPublicFormApi = (): FormApi<Values> => {
        return this.#publicFormApi ?? (this.#publicFormApi = new PublicFormApi<Values>(this));
    };

    //#region Antd methods

    submit = () => {
        this.antdForm.submit();
    };
    setFieldsValue = (values: Partial<Values>) => {
        this.antdForm.setFieldsValue(values);
        this.forceRootUpdate();
    };
    resetFields = () => {
        this.antdForm.resetFields();
    };
    getFieldsValue = (): Values => {
        return this.antdForm.getFieldsValue();
    };

    validateFields = () => {
        return this.antdForm.validateFields();
    };

    //#endregion

    reloadMarkup = (): Promise<void> => {
        return this.loadFormByIdAsync(true);
    };

    setLogEnabled = (enabled: boolean) => {
        this.logEnabled = enabled;
    };

    log = (...args) => {
        if (this.logEnabled)
            console.log(...args);
    };

    setInitialValues = (values: Values) => {
        this.log('LOG: setInitialValues', values);
        this.initialValues = values;
        this.useDataLoader = !Boolean(values);
    };

    setSubmitHandler = (handler: SubmitHandler<Values>) => {
        this.onFinish = handler;
        this.useDataSubmitter = !Boolean(handler);
    };
    setAfterSubmitHandler = (handler: AfterSubmitHandler<Values>) => {
        this.onAfterSubmit = handler;
    };

    setOnValuesChange = (handler: OnValuesChangeHandler<Values>) => {
        this.onValuesChange = handler;
    };

    resetMarkup = () => {
        this.form = undefined;
    };

    applyFormSettingsAsync = async (): Promise<void> => {
        const { settings } = this;

        const makeCaller = <TArguments = any, TResult = any>(expression: string): ExpressionCaller<TArguments, Promise<TResult>> | undefined => {
            if (!expression?.trim())
                return undefined;
            return (args: TArguments) => {
                return this.expressionExecuter(expression, args);
            };
        };

        this.events = {};
        this.events.onPrepareSubmitData = makeCaller<Values, Values>(settings.onPrepareSubmitData);
        this.events.onBeforeSubmit = makeCaller<Values, void>(settings.onBeforeSubmit);
        this.events.onSubmitSuccess = makeCaller<void, void>(settings.onSubmitSuccess);
        this.events.onSubmitFailed = makeCaller<void, void>(settings.onSubmitFailed);

        this.events.onBeforeDataLoad = makeCaller<void, void>(settings.onBeforeDataLoad);
        this.events.onAfterDataLoad = makeCaller<void, void>(settings.onAfterDataLoad);
        this.events.onValuesChanged = makeCaller<Values, void>(settings.onValuesChanged);

        this.modelMetadata = settings.modelType
            ? await this.metadataDispatcher.getMetadata({ modelType: settings.modelType, dataType: 'entity' })
            : undefined;
    };

    get defaultApiEndpoints(): IEntityEndpoints {
        return isEntityMetadata(this.modelMetadata)
            ? this.modelMetadata.apiEndpoints
            : {};
    };

    loadFormByRawMarkupAsync = async (): Promise<void> => {
        try {
            const { components, formSettings } = getComponentsAndSettings(this.rawMarkup);
            const form = await this.formManager.getFormByMarkup({
                markup: components,
                formSettings,
                key: this.markupCacheKey,
                isSettingsForm: this.isSettingsForm,
            });

            this.form = form;
            await this.applyFormSettingsAsync();

            if (this.events.onBeforeDataLoad)
                await this.events.onBeforeDataLoad();

            this.markupLoadingState = { status: 'ready' };
            this.forceRootUpdate();
        } catch (error) {
            this.markupLoadingState = { status: 'failed', error: error, hint: 'Failed to load form' };
            this.forceRootUpdate();
            throw error;
        }
    };

    loadFormByIdAsync = async (skipCache: boolean = false): Promise<void> => {
        if (!this.formId)
            throw new Error("FormId is not defined");

        this.resetMarkup();

        this.markupLoadingState = { status: 'loading', hint: 'Loading...' };
        this.forceRootUpdate();

        try {
            const form = await this.formManager.getFormById({
                formId: this.formId,
                configurationItemMode: this.configurationItemMode,
                skipCache: skipCache,
            });

            this.form = form;
            await this.applyFormSettingsAsync();

            if (this.events.onBeforeDataLoad)
                await this.events.onBeforeDataLoad();

            this.markupLoadingState = { status: 'ready' };
            this.forceRootUpdate();
        } catch (error) {
            this.markupLoadingState = { status: 'failed', error: error, hint: 'Failed to load form' };
            this.forceRootUpdate();
            throw error;
        }
    };

    applyMarkupAsync = async (payload: InitByMarkupPayload): Promise<void> => {
        this.markupLoadingState = { status: 'loading', hint: 'Loading...' };
        this.forceRootUpdate();

        try {
            const { formFlatMarkup, formSettings } = payload;
            this.resetMarkup();
            this.form = {
                flatStructure: formFlatMarkup,
                settings: formSettings,
            };
            await this.applyFormSettingsAsync();

            if (this.events.onBeforeDataLoad)
                await this.events.onBeforeDataLoad();

            this.markupLoadingState = { status: 'ready' };
            this.forceRootUpdate();
        } catch (error) {
            this.markupLoadingState = { status: 'failed', error: error, hint: 'Failed to load form' };
            this.forceRootUpdate();
            throw error;
        }
    };

    initByRawMarkup = async (payload: InitByRawMarkupPayload): Promise<void> => {
        const { formArguments, initialValues, rawMarkup, cacheKey, isSettingsForm } = payload;

        this.log('LOG: initByRawMarkup', payload);

        this.formId = undefined;
        this.configurationItemMode = "latest";
        this.rawMarkup = rawMarkup;
        this.markupCacheKey = cacheKey;
        this.formArguments = formArguments;
        this.isSettingsForm = isSettingsForm;

        await this.loadFormByRawMarkupAsync();

        this.initialValues = initialValues;
        this.formData = initialValues;
        this.antdForm.resetFields();
        this.antdForm.setFieldsValue(initialValues);
        //await this.loadData(formArguments);
        this.dataLoadingState = { status: 'ready', hint: null, error: null };
        this.forceRootUpdate();

        if (this.events.onAfterDataLoad)
            await this.events.onAfterDataLoad();
    };

    initByMarkup = async (payload: InitByMarkupPayload): Promise<void> => {
        const { formArguments } = payload;

        this.log('LOG: initByMarkup', payload);

        this.formId = undefined;
        this.configurationItemMode = "latest";
        this.formArguments = formArguments;

        await this.applyMarkupAsync(payload);

        await this.loadData(formArguments);

        if (this.events.onAfterDataLoad)
            await this.events.onAfterDataLoad();
    };

    initByFormId = async (payload: InitByFormIdPayload): Promise<void> => {
        const { configurationItemMode, formId, formArguments } = payload;

        if (isSameFormIds(this.formId, formId) && this.configurationItemMode === configurationItemMode) {
            return;
        }

        this.log('LOG: initByFormId', payload);

        this.formId = formId;
        this.configurationItemMode = configurationItemMode;
        this.formArguments = formArguments;

        await this.loadFormByIdAsync();
        await this.loadData(formArguments);

        if (this.events.onAfterDataLoad)
            await this.events.onAfterDataLoad();
    };

    private get dataLoader(): IFormDataLoader {
        return this.settings.dataLoaderType
            ? this.dataLoaders.getFormDataLoader(this.settings.dataLoaderType)
            : undefined;
    }

    fetchData = (): Promise<Values> => {
        // TODO: review for raw markup
        return this.loadData(this.formArguments);
    };

    loadData = async (formArguments: any): Promise<Values> => {
        this.log('LOG: loadData, use loader: ', this.useDataLoader, this.initialValues);
        if (!this.useDataLoader) {
            this.log('LOG: loadData', this.useDataLoader);
            this.dataLoadingState = { status: 'ready', hint: null, error: null };
            this.forceRootUpdate();

            return this.initialValues;
        }

        const dataId = formArguments?.id;
        const canLoadData = dataId && this.dataLoader;

        if (canLoadData) {
            this.dataLoadingState = { status: 'loading', hint: 'Fetching data...', error: null };
            this.forceRootUpdate();

            const data = await this.dataLoader.loadAsync({
                formSettings: this.settings,
                formFlatStructure: this.flatStructure,
                dataId: dataId,
                expressionExecuter: this.expressionExecuter,
            });

            this.dataLoadingState = { status: 'ready' };
            this.initialValues = data;
            this.formData = data;
            this.antdForm.resetFields();
            this.antdForm.setFieldsValue(data);
            this.forceRootUpdate();

            this.log('LOG: loaded', data);
            return data;
        }

        this.dataLoadingState = { status: 'ready', hint: null, error: null };
        this.forceRootUpdate();

        return this.initialValues;
    };

    private get dataSubmitter(): IFormDataSubmitter {
        return this.settings.dataSubmitterType
            ? this.dataSubmitters.getFormDataSubmitter(this.settings.dataSubmitterType)
            : undefined;
    }

    submitData = async (payload: SubmitDataPayload<Values>): Promise<Values> => {
        this.log('LOG: ShaForm submit...');
        const { data, antdForm, getDelayedUpdates } = payload;

        if (this.useDataSubmitter) {
            this.dataSubmitState = { status: 'loading', hint: 'Saving data...', error: null };
            this.forceRootUpdate();

            try {
                const result = await this.dataSubmitter.submitAsync({
                    formSettings: this.settings,
                    formFlatStructure: this.flatStructure,
                    data: data,
                    antdForm: antdForm,
                    getDelayedUpdates: getDelayedUpdates,
                    expressionExecuter: this.expressionExecuter,

                    onPrepareSubmitData: this.events.onPrepareSubmitData,
                    onBeforeSubmit: this.events.onBeforeSubmit,
                    onSubmitSuccess: this.events.onSubmitSuccess,
                    onSubmitFailed: this.events.onSubmitFailed,
                });

                if (this.onAfterSubmit)
                    this.onAfterSubmit(data, result);

                this.dataSubmitState = { status: 'ready', hint: null };
                this.forceRootUpdate();

                return result;
            } catch (error) {
                this.dataSubmitState = { status: 'failed', error: error };
                this.forceRootUpdate();
                throw error;
            }
        } else {
            this.onFinish(data);

            if (this.onAfterSubmit)
                this.onAfterSubmit(data, data);

            return Promise.resolve(data);
        }
    };
}

type UseShaFormArgsExistingForm<Values = any> = { form: IShaFormInstance<Values> };
//type UseShaFormArgsExistingForm<Values = any> = IShaFormInstance<Values>;
type UseShaFormArgsNewForm<Values = any> = {
    antdForm?: FormInstance<Values>;
    init?: (shaForm: IShaFormInstance<Values>) => void;
};
type UseShaFormArgs<Values = any> = UseShaFormArgsExistingForm<Values> & UseShaFormArgsNewForm<Values>;

const useShaForm = <Values = any>(args: UseShaFormArgs<Values>): IShaFormInstance<Values>[] => {
    const { antdForm, form, init } = args;

    const formRef = React.useRef<IShaFormInstance>();
    const [, forceUpdate] = React.useState({});
    const formManager = useFormManager();
    const dataLoaders = useFormDataLoaders();
    const dataSubmitters = useFormDataSubmitters();
    const [antdFormInstance] = Form.useForm(antdForm);
    const fullContext = useAvailableConstantsContexts();
    const metadataDispatcher = useMetadataDispatcher();

    if (!formRef.current) {
        if (form) {
            formRef.current = form;
        } else {
            // Create a new FormStore if not provided
            const forceReRender = () => {
                forceUpdate({});
            };

            const instance = new ShaFormInstance({
                forceRootUpdate: forceReRender,
                formManager: formManager,
                dataLoaders: dataLoaders,
                dataSubmitters: dataSubmitters,
                antdForm: antdFormInstance,
                metadataDispatcher: metadataDispatcher,
            });
            const accessors = wrapConstantsData({ fullContext, shaForm: instance });
            const allConstants = makeObservableProxy<IApplicationContext>(accessors);

            const expressionExecuter = (expression: string, data: any = null) => {
                // get formApi here and pass to caller
                return executeScript(expression, { ...allConstants, ...data });
            };
            instance.setExpressionExecuter(expressionExecuter);

            init?.(instance);

            formRef.current = instance;
        }
    }

    return [formRef.current];
};

export { ShaFormInstance, useShaForm };