import React, { useState } from "react";
import {
  AfterSubmitHandler,
  ForceUpdateTrigger,
  FormEvents,
  IDataSubmitContext,
  InitByFormIdPayload,
  InitByMarkupPayload,
  InitByRawMarkupPayload,
  IShaFormInstance,
  LoadFormByIdPayload,
  OnMarkupLoadedHandler,
  OnValuesChangeHandler,
  ProcessingState,
  SubmitDataPayload,
  SubmitHandler,
} from "./interfaces";
import { IFormDataLoader } from "../loaders/interfaces";
import { DataTypes, FormIdentifier, FormMarkup, FormMode, IFlatComponentsStructure, IFormSettings, IFormValidationErrors, IModelMetadata, isEntityMetadata } from "@/interfaces";
import { ExpressionCaller, ExpressionExecuter, IDataArguments, IFormDataSubmitter } from "../submitters/interfaces";
import { IFormManagerActionsContext } from "@/providers/formManager/contexts";
import { useFormManager } from "@/providers/formManager";
import { IFormDataLoadersContext, useFormDataLoaders } from "../loaders/formDataLoadersProvider";
import { IFormDataSubmittersContext, useFormDataSubmitters } from "../submitters/formDataSubmittersProvider";
import { FormInfo } from "../api";
import { executeScript, getComponentsAndSettings, IApplicationContext, isSameFormIds, useAvailableConstantsContextsNoRefresh, wrapConstantsData } from "../utils";
import { Form, FormInstance } from "antd";
import { IFormApi } from "../formApi";
import { ISetFormDataPayload } from "../contexts";
import { deepMergeValues, setValueByPropertyName } from "@/utils/object";
import { makeObservableProxy } from "../observableProxy";
import { IMetadataDispatcher } from "@/providers/metadataDispatcher/contexts";
import { IEntityEndpoints } from "@/providers/sheshaApplication/publicApi/entities/entityTypeAccessor";
import { DataContextTopLevels, useMetadataDispatcher } from "@/providers";
import { isEmpty } from 'lodash';
import { getQueryParams } from "@/utils/url";
import { IDelayedUpdateGroup } from "@/providers/delayedUpdateProvider/models";
import { removeGhostKeys } from "@/utils/form";
import { FieldValueSetter } from "@/utils/dotnotation";
import { addDelayedUpdateProperty } from "@/providers/delayedUpdateProvider";
import { RecursivePartial } from "@/interfaces/entity";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { extractErrorInfo, throwError } from "@/utils/errors";
import { FormLoaderContextValue, useFormLoader } from "../formLoaderProvider";
import { IFormLoaderInstanceApi } from "../formApi";

interface ShaFormInstanceArguments<Values extends object = object> {
  formDataGetter?: (() => Values | undefined) | undefined;
  formDataSetter?: ((data: Values | undefined) => void) | undefined;
  setFormDataNewDataAction?: ((payload: ISetFormDataPayload, instance: IShaFormInstance<Values>) => Values | undefined) | undefined;
  forceRootUpdate: ForceUpdateTrigger;
  formManager: IFormManagerActionsContext;
  metadataDispatcher: IMetadataDispatcher;
  dataLoaders: IFormDataLoadersContext;
  dataSubmitters: IFormDataSubmittersContext;
  antdForm: FormInstance<Values>;
  formLoaderContext?: FormLoaderContextValue;
}

class PublicFormApi<Values extends object = object> implements IFormApi<Values> {
  #form: IShaFormInstance<Values>;

  #formLoaderContext?: FormLoaderContextValue;

  constructor(form: IShaFormInstance<Values>, formLoaderContext?: FormLoaderContextValue) {
    this.#form = form;
    this.#formLoaderContext = formLoaderContext;
  }

  addDelayedUpdateData = (data: Values): IDelayedUpdateGroup[] => {
    const delayedUpdateData = this.#form.getDelayedUpdates();
    addDelayedUpdateProperty(data, delayedUpdateData);

    return delayedUpdateData;
  };

  setFieldValue: FieldValueSetter<Values> = (name, value) => {
    this.#form.setFormData({ values: setValueByPropertyName(this.#form.formData ?? {} as Values, name.toString(), value, true), mergeValues: true });
  };

  setFieldsValue = (values: Values): void => {
    this.#form.setFormData({ values, mergeValues: true });
  };

  clearFieldsValue = (): void => {
    this.#form.setFormData({ values: {} as Values, mergeValues: false });
  };

  submit = (): void => {
    this.#form.antdForm.submit();
  };

  setFormData = (payload: ISetFormDataPayload<Values>): void => {
    this.#form.setFormData(payload);
  };

  getFormData = (): Values | undefined => {
    return this.#form.formData;
  };

  showLoader = (message?: string): IFormLoaderInstanceApi => {
    return this.#formLoaderContext?.showLoader(message) || {
      updateMessage: () => { /* no-op */ },
      close: () => { /* no-op */ },
    };
  };

  hideLoaders = (): void => {
    this.#formLoaderContext?.hideLoaders();
  };

  setValidationErrors = (payload: IFormValidationErrors): void => {
    this.#form.setValidationErrors(payload);
  };

  get formInstance(): FormInstance<Values> {
    return this.#form.antdForm;
  };

  get shaForm(): IShaFormInstance<Values> {
    return this.#form;
  }

  get formSettings(): IFormSettings | undefined {
    return this.#form.settings;
  };

  get formMode(): FormMode {
    return this.#form.formMode;
  };

  get data(): Values | undefined {
    return this.#form.formData;
  };

  get defaultApiEndpoints(): IEntityEndpoints {
    return this.#form.defaultApiEndpoints;
  };

  get formArguments(): object | undefined {
    return this.#form.formArguments;
  }

  get parentFormValues(): object | undefined {
    return this.#form.parentFormValues;
  }

  get initialValues(): Values | undefined {
    return this.#form.initialValues;
  }
};

export type ShaFormSubscription<Values extends object = object> = (cs: IShaFormInstance<Values>) => void;
export type ShaFormSubscriptionType = 'data-modified';


class ShaFormInstance<Values extends object = object> implements IShaFormInstance<Values> {
  private forceRootUpdate: ForceUpdateTrigger;

  private formManager: IFormManagerActionsContext;

  private metadataDispatcher: IMetadataDispatcher;

  private dataLoaders: IFormDataLoadersContext;

  private dataSubmitters: IFormDataSubmittersContext;

  private formLoaderContext?: FormLoaderContextValue;

  private expressionExecuter: ExpressionExecuter | undefined;

  private events: FormEvents<Values>;

  private dataSubmitContext: IDataSubmitContext | undefined;

  private _formData: Values | undefined;

  formDataSetter: ((data: Values | undefined) => void) | undefined;

  formDataGetter: (() => (Values | undefined) | undefined) | undefined;

  setFormDataNewDataAction: ((payload: ISetFormDataPayload, instance: IShaFormInstance<Values>) => Values | undefined) | undefined;

  updateData: (() => void) | undefined;

  modelMetadata?: IModelMetadata | undefined;

  antdForm: FormInstance<Values>;

  formMode: FormMode;

  get formData(): Values | undefined {
    if (typeof this.formDataGetter === 'function')
      return this.formDataGetter();
    return this._formData;
  };

  set formData(data: Values | undefined) {
    if (typeof this.formDataSetter === 'function')
      this.formDataSetter(data);
    else
      this._formData = data;
  };

  isDataModified: boolean;

  validationErrors?: IFormValidationErrors | undefined;

  initialValues: Values | undefined;

  parentFormValues: object | undefined;

  formArguments?: object | undefined;

  onFinish: SubmitHandler<Values> | undefined;

  onAfterSubmit: AfterSubmitHandler<Values> | undefined;

  onValuesChange?: OnValuesChangeHandler<Values>;

  onMarkupLoaded?: OnMarkupLoadedHandler<Values>;

  useDataLoader: boolean;

  useDataSubmitter: boolean;

  markupLoadingState: ProcessingState;

  dataLoadingState: ProcessingState;

  dataSubmitState: ProcessingState;

  form?: FormInfo | undefined;

  get settings(): IFormSettings | undefined {
    return this.form?.settings;
  };

  get flatStructure(): IFlatComponentsStructure | undefined {
    return this.form?.flatStructure;
  };

  formId?: FormIdentifier | undefined;

  rawMarkup?: FormMarkup | undefined;

  markupCacheKey?: string | undefined;

  isSettingsForm: boolean;

  logEnabled: boolean;

  constructor(args: ShaFormInstanceArguments<Values>) {
    this.antdForm = args.antdForm;
    this.formManager = args.formManager;
    this.metadataDispatcher = args.metadataDispatcher;
    this.dataLoaders = args.dataLoaders;
    this.dataSubmitters = args.dataSubmitters;
    this.formLoaderContext = args.formLoaderContext;
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
    this._formData = {} as Values;
    this.isDataModified = false;
    this.subscriptions = new Map<ShaFormSubscriptionType, Set<ShaFormSubscription<Values>>>();

    this.formDataGetter = args.formDataGetter;
    this.formDataSetter = args.formDataSetter;
    this.setFormDataNewDataAction = args.setFormDataNewDataAction;
  }

  //#region subscriptions

  private subscriptions: Map<ShaFormSubscriptionType, Set<ShaFormSubscription<Values>>>;

  subscribe(type: ShaFormSubscriptionType, callback: () => void): () => void {
    const current = this.subscriptions.get(type) ?? new Set<ShaFormSubscription<Values>>();
    current.add(callback);
    this.subscriptions.set(type, current);
    return () => this.unsubscribe(type, callback);
  }

  private unsubscribe(type: ShaFormSubscriptionType, callback: () => void): void {
    const current = this.subscriptions.get(type);
    if (!current)
      return;
    current.delete(callback);
    this.subscriptions.set(type, current);
  }

  notifySubscribers(type: ShaFormSubscriptionType): void {
    const callbacks = this.subscriptions.get(type);
    callbacks?.forEach((callback) => callback(this));
  }

  //#endregion

  getDelayedUpdates = (): IDelayedUpdateGroup[] => {
    return this.dataSubmitContext?.getDelayedUpdates() || [];
  };

  setDataSubmitContext = (context: IDataSubmitContext): void => {
    this.dataSubmitContext = context;
  };

  setExpressionExecuter = (expressionExecuter: ExpressionExecuter): void => {
    this.expressionExecuter = expressionExecuter;
  };

  setFormMode = (formMode: FormMode): void => {
    if (this.formMode === formMode)
      return;

    this.formMode = formMode;
    this.forceRootUpdate();
  };

  #setIsDataModified = (value: boolean): void => {
    if (this.dataLoadingState.status !== "ready") {
      return;
    }

    this.isDataModified = value;
    this.notifySubscribers('data-modified');
  };

  #setInternalFormData = (changedValues: Partial<Values>, values: Values): void => {
    this.formData = values;
    this.#setIsDataModified(true);
    if (this.onValuesChange)
      this.onValuesChange(changedValues, values);
    if (this.events.onValuesUpdate)
      this.events.onValuesUpdate({ data: removeGhostKeys({ ...values }) }).catch((error) => {
        console.error('Failed to call events.onValuesUpdate', error);
      });
  };

  setFormData = (payload: ISetFormDataPayload<Values>): void => {
    const { values, mergeValues } = payload;
    if (isEmpty(values) && mergeValues)
      return;

    const newData = typeof this.setFormDataNewDataAction === "function"
      ? this.setFormDataNewDataAction(payload, this)
      : payload.mergeValues && this.formData
        ? deepMergeValues(this.formData, values)
        : values;

    if (mergeValues) {
      this.antdForm.setFieldsValue(values);
    } else {
      this.antdForm.resetFields();
      this.antdForm.setFieldsValue(values);
    }

    this.#setInternalFormData(values as Partial<Values>, newData ?? {} as Values);

    this.updateData?.();
  };

  setParentFormValues = (values: object): void => {
    this.parentFormValues = values;
  };

  setValidationErrors = (payload: IFormValidationErrors | undefined): void => {
    this.validationErrors = payload;
    this.forceRootUpdate();
  };

  #publicFormApi: PublicFormApi<Values> | undefined;

  getPublicFormApi = (): IFormApi<Values> => {
    return this.#publicFormApi ?? (this.#publicFormApi = new PublicFormApi<Values>(this, this.formLoaderContext));
  };

  //#region Antd methods

  submit = (): void => {
    this.antdForm.submit();
  };

  setFieldsValue = (values: RecursivePartial<Values>): void => {
    this.antdForm.setFieldsValue(values);
    this.updateData?.();
  };

  resetFields = (): void => {
    this.antdForm.resetFields();
    const values = this.antdForm.getFieldsValue();
    this.#setInternalFormData(values, values);
    this.#setIsDataModified(false);
    this.updateData?.();
  };

  getFieldsValue = (): Values => {
    return this.antdForm.getFieldsValue();
  };

  validateFields = (): Promise<Values> => {
    return this.antdForm.validateFields();
  };

  //#endregion

  reloadMarkup = (): Promise<void> => {
    return this.loadFormByIdAsync({ skipCache: true });
  };

  setLogEnabled = (enabled: boolean): void => {
    this.logEnabled = enabled;
    // eslint-disable-next-line no-console
    this.log = this.logEnabled ? console.log : this.log;
  };

  log = (..._args: unknown[]): void => {
    // noop
  };

  setInitialValues = (values: Values): void => {
    this.log('LOG: setInitialValues', values);
    this.initialValues = values;
    this.useDataLoader = !Boolean(values);
  };

  setSubmitHandler = (handler: SubmitHandler<Values>): void => {
    this.onFinish = handler;
    this.useDataSubmitter = !Boolean(handler);
  };

  setAfterSubmitHandler = (handler: AfterSubmitHandler<Values>): void => {
    this.onAfterSubmit = handler;
  };

  setOnValuesChange = (handler: OnValuesChangeHandler<Values>): void => {
    this.onValuesChange = handler;
  };

  setOnMarkupLoaded = (handler: OnMarkupLoadedHandler<Values>): void => {
    this.onMarkupLoaded = handler;
  };

  resetMarkup = (): void => {
    this.form = undefined;
  };

  applyFormSettingsAsync = async (): Promise<void> => {
    const { settings } = this;

    const makeCaller = <TArguments = unknown, TResult = unknown>(expression: string | undefined): ExpressionCaller<TArguments, Promise<TResult>> | undefined => {
      if (isNullOrWhiteSpace(expression))
        return undefined;

      const executer = this.expressionExecuter;
      return isDefined(executer)
        ? (args: TArguments) => {
          return executer(expression, args) as Promise<TResult>;
        }
        : undefined;
    };

    this.events = {};
    if (settings) {
      this.events.onPrepareSubmitData = makeCaller<IDataArguments<Values>, Values>(settings.onPrepareSubmitData);
      this.events.onBeforeSubmit = makeCaller<IDataArguments<Values>, void>(settings.onBeforeSubmit);
      this.events.onSubmitSuccess = makeCaller<void, void>(settings.onSubmitSuccess);
      this.events.onSubmitFailed = makeCaller<void, void>(settings.onSubmitFailed);

      this.events.onBeforeDataLoad = makeCaller<void, void>(settings.onBeforeDataLoad);
      this.events.onAfterDataLoad = makeCaller<void, void>(settings.onAfterDataLoad);
      this.events.onValuesUpdate = makeCaller<IDataArguments<Values>, void>(settings.onValuesUpdate);
    }

    this.modelMetadata = settings?.modelType
      ? await this.metadataDispatcher.getMetadata({ modelType: settings.modelType, dataType: DataTypes.entityReference }) ?? undefined
      : undefined;
  };

  get defaultApiEndpoints(): IEntityEndpoints {
    return this.modelMetadata && isEntityMetadata(this.modelMetadata)
      ? this.modelMetadata.apiEndpoints
      : {};
  };

  loadFormByRawMarkupAsync = async (forceRootUpdate: boolean = false): Promise<void> => {
    try {
      if (!isDefined(this.rawMarkup))
        throw new Error('Raw markup is not defined');

      const { components, formSettings } = getComponentsAndSettings(this.rawMarkup);
      const form = await this.formManager.getFormByMarkup({
        markup: components,
        formSettings,
        key: this.markupCacheKey,
        isSettingsForm: this.isSettingsForm,
      });

      this.form = form;
      await this.applyFormSettingsAsync();

      if (this.onMarkupLoaded)
        await this.onMarkupLoaded(this);

      if (this.events.onBeforeDataLoad)
        await this.events.onBeforeDataLoad();

      this.markupLoadingState = { status: 'ready' };
      if (forceRootUpdate)
        this.forceRootUpdate();
    } catch (error) {
      this.markupLoadingState = { status: 'failed', error: extractErrorInfo(error), hint: 'Failed to load form' };
      this.forceRootUpdate();
      throw error;
    }
  };

  loadFormByIdAsync = async (payload: LoadFormByIdPayload<Values> = {}): Promise<void> => {
    const { skipCache = false, initialValues } = payload;
    if (!this.formId)
      throw new Error("FormId is not defined");

    this.resetMarkup();

    this.markupLoadingState = { status: 'loading', hint: 'Loading...' };
    this.forceRootUpdate();

    try {
      const form = await this.formManager.getFormById({
        formId: this.formId,
        skipCache: skipCache,
      });

      this.form = form;
      await this.applyFormSettingsAsync();

      if (this.onMarkupLoaded)
        await this.onMarkupLoaded(this);

      this.log('LOG: initialValues', initialValues);
      this.initialValues = initialValues;
      this.formData = initialValues;
      if (initialValues) {
        this.antdForm.resetFields();
        this.antdForm.setFieldsValue(initialValues);
      }

      this.markupLoadingState = { status: 'ready' };
      this.forceRootUpdate();
    } catch (error) {
      this.markupLoadingState = { status: 'failed', error: extractErrorInfo(error), hint: 'Failed to load form' };
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

      if (this.onMarkupLoaded)
        await this.onMarkupLoaded(this);

      if (this.events.onBeforeDataLoad)
        await this.events.onBeforeDataLoad();

      this.markupLoadingState = { status: 'ready' };
      this.forceRootUpdate();
    } catch (error) {
      this.markupLoadingState = { status: 'failed', error: extractErrorInfo(error), hint: 'Failed to load form' };
      this.forceRootUpdate();
      throw error;
    }
  };

  initByRawMarkup = async (payload: InitByRawMarkupPayload<Values>): Promise<void> => {
    const { formArguments, initialValues, rawMarkup, cacheKey, isSettingsForm } = payload;

    this.log('LOG: initByRawMarkup', payload);

    this.formId = undefined;
    this.rawMarkup = rawMarkup;
    this.markupCacheKey = cacheKey;
    this.formArguments = formArguments;
    this.isSettingsForm = isSettingsForm ?? false;

    this.initialValues = initialValues;
    this.formData = initialValues;

    await this.loadFormByRawMarkupAsync();

    this.antdForm.resetFields();
    if (initialValues)
      this.antdForm.setFieldsValue(initialValues);

    this.dataLoadingState = { status: 'ready', hint: undefined, error: undefined };
    this.#setIsDataModified(false);
    this.forceRootUpdate();

    if (this.events.onAfterDataLoad)
      await this.events.onAfterDataLoad();
  };

  initByMarkup = async (payload: InitByMarkupPayload): Promise<void> => {
    const { formArguments } = payload;

    this.log('LOG: initByMarkup', payload);

    this.formId = undefined;
    this.formArguments = formArguments;

    await this.applyMarkupAsync(payload);

    await this.loadData(formArguments);

    if (this.events.onAfterDataLoad)
      await this.events.onAfterDataLoad();
  };

  initByFormId = async (payload: InitByFormIdPayload<Values>): Promise<void> => {
    const { formId, formArguments } = payload;

    const formNotChanged = this.formId && isSameFormIds(this.formId, formId);
    if (!formNotChanged) {
      this.log('LOG: initByFormId - load form', payload);

      this.formId = formId;

      await this.loadFormByIdAsync({ initialValues: payload.initialValues });
    } else
      this.log('LOG: initByFormId - load form skipped', payload);

    if (this.markupLoadingState.status === "ready") {
      this.log('LOG: initByFormId - load data', payload);
      this.formArguments = formArguments;
      if (this.events.onBeforeDataLoad)
        await this.events.onBeforeDataLoad();

      await this.loadData(formArguments);

      if (this.events.onAfterDataLoad)
        await this.events.onAfterDataLoad();
    }
  };

  private get dataLoader(): IFormDataLoader<Values> | undefined {
    return this.settings?.dataLoaderType
      ? this.dataLoaders.getFormDataLoader(this.settings.dataLoaderType) as IFormDataLoader<Values>
      : undefined;
  }

  fetchData = (): Promise<Values> => {
    // TODO: review for raw markup
    return this.loadData(this.formArguments);
  };

  loadData = async (formArguments: object | undefined): Promise<Values> => {
    this.log('LOG: loadData, use loader: ', this.useDataLoader, this.initialValues);
    if (!this.useDataLoader) {
      this.log('LOG: loadData', this.useDataLoader);
      this.dataLoadingState = { status: 'ready', hint: undefined, error: undefined };
      this.#setIsDataModified(false);
      this.forceRootUpdate();

      return this.initialValues as Values;
    }

    const canLoadData = this.dataLoader && this.dataLoader.canLoadData(formArguments);

    if (canLoadData) {
      this.dataLoadingState = { status: 'loading', hint: 'Fetching data...', error: undefined };
      this.forceRootUpdate();

      const { settings, flatStructure } = this.form ?? throwError("Form is not initialized");

      const data = await this.dataLoader.loadAsync({
        formSettings: settings,
        formFlatStructure: flatStructure,
        formArguments: formArguments,
        expressionExecuter: this.expressionExecuter ?? throwError('Expression executer is not initialized'),
        loadingCallback: (loadingState) => {
          this.dataLoadingState = { status: loadingState.loadingState, hint: loadingState.loaderHint, error: loadingState.error };
          this.forceRootUpdate();
        },
      });
      if (this.dataLoadingState.status === 'failed')
        throw this.dataLoadingState.error;

      this.initialValues = data;
      this.formData = data;
      this.antdForm.resetFields();
      this.antdForm.setFieldsValue(data as Values);
      this.#setIsDataModified(false);
      this.forceRootUpdate();

      this.log('LOG: loaded', data);
      return data as Values;
    }

    this.dataLoadingState = { status: 'ready', hint: undefined, error: undefined };
    this.#setIsDataModified(false);
    this.forceRootUpdate();

    return this.initialValues as Values;
  };

  private get dataSubmitter(): IFormDataSubmitter<Values> | undefined {
    return this.settings?.dataSubmitterType
      ? this.dataSubmitters.getFormDataSubmitter<Values>(this.settings.dataSubmitterType)
      : undefined;
  }

  submitData = async (payload: SubmitDataPayload = {}): Promise<Values> => {
    this.log('LOG: ShaForm submit...');
    const { customSubmitCaller } = payload;

    const { formData: data, antdForm } = this;
    if (!isDefined(data))
      throw new Error('Form data is not defined');

    const { getDelayedUpdates } = this.dataSubmitContext ?? {};

    if (this.useDataSubmitter) {
      this.log('LOG: use data submitter');
      this.dataSubmitState = { status: 'loading', hint: 'Saving data...', error: undefined };
      this.forceRootUpdate();

      try {
        if (!this.dataSubmitter)
          throw new Error('Submit handler is not configured for the form');

        const { settings, flatStructure } = this.form ?? throwError("Form is not initialized");

        const result = await this.dataSubmitter.submitAsync({
          formSettings: settings,
          formFlatStructure: flatStructure,
          data: data,
          antdForm: antdForm,
          getDelayedUpdates: getDelayedUpdates ?? ((): IDelayedUpdateGroup[] => []),
          expressionExecuter: this.expressionExecuter ?? throwError('Expression executer is not initialized'),
          customSubmitCaller,

          onPrepareSubmitData: this.events.onPrepareSubmitData,
          onBeforeSubmit: this.events.onBeforeSubmit,
          onSubmitSuccess: this.events.onSubmitSuccess,
          onSubmitFailed: this.events.onSubmitFailed,
        });

        this.log('LOG: submitted successfully');

        if (this.onAfterSubmit)
          this.onAfterSubmit(data, result);

        this.dataSubmitState = { status: 'ready', hint: undefined };
        this.#setIsDataModified(false);
        this.forceRootUpdate();

        return result as Values;
      } catch (error) {
        this.log('LOG: failed to submit', error);
        const errorInfo = extractErrorInfo(error);
        this.dataSubmitState = { status: 'failed', error: errorInfo };
        this.setValidationErrors(errorInfo);
        this.forceRootUpdate();
        throw error;
      }
    } else {
      this.log('LOG: use onFinish');
      this.onFinish?.(data);

      if (this.onAfterSubmit)
        this.onAfterSubmit(data, data);

      this.#setIsDataModified(false);

      return data as Values;
    }
  };
}

type UseShaFormArgsExistingForm<Values extends object = object> = { form: IShaFormInstance<Values> | undefined };

type UseShaFormArgsNewForm<Values extends object = object> = {
  formDataGetter?: (() => Values | undefined) | undefined;
  formDataSetter?: ((data: Values | undefined) => void) | undefined;
  setFormDataNewDataAction?: ((payload: ISetFormDataPayload, instance: IShaFormInstance<Values>) => Values | undefined) | undefined;
  antdForm?: FormInstance<Values>;
  init?: (shaForm: IShaFormInstance<Values>) => void;
};
type UseShaFormArgs<Values extends object = object> = UseShaFormArgsExistingForm<Values> & UseShaFormArgsNewForm<Values>;

const useShaForm = <Values extends object = object>(args: UseShaFormArgs<Values>): [IShaFormInstance<Values>] => {
  const { antdForm, form, init } = args;

  const [, forceUpdate] = React.useState({});
  const formManager = useFormManager();
  const dataLoaders = useFormDataLoaders();
  const dataSubmitters = useFormDataSubmitters();
  const [antdFormInstance] = Form.useForm(antdForm);
  const fullContext = useAvailableConstantsContextsNoRefresh();
  const metadataDispatcher = useMetadataDispatcher();
  const formLoaderContext = useFormLoader();

  const [formInstance] = useState<IShaFormInstance<Values>>(() => {
    if (form) {
      return form;
    } else {
      // Create a new FormStore if not provided
      const forceReRender = (): void => {
        forceUpdate({});
      };

      const instance = new ShaFormInstance<Values>({
        formDataGetter: args.formDataGetter,
        formDataSetter: args.formDataSetter,
        setFormDataNewDataAction: args.setFormDataNewDataAction,
        forceRootUpdate: forceReRender,
        formManager: formManager,
        dataLoaders: dataLoaders,
        dataSubmitters: dataSubmitters,
        antdForm: antdFormInstance,
        metadataDispatcher: metadataDispatcher,
        formLoaderContext: formLoaderContext,
      });
      const accessors = wrapConstantsData<Values>({
        topContextId: DataContextTopLevels.Full,
        fullContext,
        shaForm: instance,
        queryStringGetter: getQueryParams,
      });
      const allConstants = makeObservableProxy<IApplicationContext<Values>>(accessors);

      const expressionExecuter: ExpressionExecuter = (expression, data) => {
        // get formApi here and pass to caller
        return executeScript(expression, { ...allConstants, ...(typeof (data) === "object" ? data : {}) });
      };
      instance.setExpressionExecuter(expressionExecuter);

      init?.(instance);

      return instance;
    }
  });

  return [formInstance];
};

export { ShaFormInstance, useShaForm };
