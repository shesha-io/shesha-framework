import React from "react";
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
import { FormIdentifier, FormMarkup, FormMode, IFlatComponentsStructure, IFormSettings, IFormValidationErrors, IModelMetadata, isEntityMetadata } from "@/interfaces";
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
import { DataContextTopLevels, isScriptActionConfiguration, useMetadataDispatcher } from "@/providers";
import { isEmpty } from 'lodash';
import { getQueryParams } from "@/utils/url";
import { IDelayedUpdateGroup } from "@/providers/delayedUpdateProvider/models";
import { removeGhostKeys } from "@/utils/form";
import { isPropertySettings } from "@/designer-components/_settings/utils";
import { FieldValueSetter } from "@/utils/dotnotation";

interface ShaFormInstanceArguments {
  forceRootUpdate: ForceUpdateTrigger;
  formManager: IFormManagerActionsContext;
  metadataDispatcher: IMetadataDispatcher;
  dataLoaders: IFormDataLoadersContext;
  dataSubmitters: IFormDataSubmittersContext;
  antdForm: FormInstance;
}

interface IPropertiesWithScripts {
  [index: string]: string;
}

interface IComponentsWithScripts {
  [index: string]: IPropertiesWithScripts;
}

// ToDo: AS - add other events
const scriptProps = ['onChangeCustom', 'onFocusCustom', 'onBlurCustom', 'onClickCustom'];

class PublicFormApi<Values extends object = object> implements IFormApi<Values> {
  #form: IShaFormInstance<Values>;

  constructor(form: IShaFormInstance<Values>) {
    this.#form = form;
  }

  getPropertiesWithScript = (keyword: string): IComponentsWithScripts => {
    const proceed = (addComponent: IPropertiesWithScripts, obj: any, propertyName: string): void => {
      for (const propName in obj) {
        if (Object.hasOwn(obj, propName)) {
          const fullPropName = propertyName ? `${propertyName}.${propName}` : propName;
          const propValue = obj[propName];
          if (!propValue) continue;
          if (scriptProps.includes(propName) && (!keyword || propValue.includes(keyword))) {
            addComponent[fullPropName] = propValue;
            continue;
          }
          if (propValue && typeof propValue === 'object') {
            if (isPropertySettings(propValue)) {
              if (propValue._mode === 'code' && (!keyword || propValue._code?.includes(keyword))) {
                addComponent[fullPropName] = propValue._code;
              }
              continue;
            }
            if (isScriptActionConfiguration(propValue) && (!keyword || propValue.actionArguments.expression?.includes(keyword))) {
              addComponent[fullPropName] = propValue.actionArguments.expression || '';
              continue;
            }
            proceed(addComponent, propValue, fullPropName);
          }
        }
      }
    };

    const components: IComponentsWithScripts = {};
    for (const componentId in this.#form.flatStructure.allComponents) {
      if (Object.hasOwn(this.#form.flatStructure.allComponents, componentId)) {
        const component = this.#form.flatStructure.allComponents[componentId];
        const addComponent: IPropertiesWithScripts = {};
        proceed(addComponent, component, '');
        if (!isEmpty(addComponent)) {
          components[component.componentName] = addComponent;
        }
      }
    };
    return components;
  };

  addDelayedUpdateData = (data: Values): IDelayedUpdateGroup[] => {
    const delayedUpdateData = this.#form?.getDelayedUpdates();
    if (delayedUpdateData?.length > 0)
      data['_delayedUpdate'] = delayedUpdateData;
    return delayedUpdateData;
  };

  setFieldValue: FieldValueSetter<Values> = (name, value) => {
    this.#form.setFormData({ values: setValueByPropertyName(this.#form.formData, name.toString(), value, true), mergeValues: true });
  };

  setFieldsValue = (values: Values): void => {
    this.#form.setFormData({ values, mergeValues: true });
  };

  clearFieldsValue = (): void => {
    this.#form?.setFormData({ values: {}, mergeValues: false });
  };

  submit = (): void => {
    this.#form.antdForm.submit();
  };

  setFormData = (payload: ISetFormDataPayload): void => {
    this.#form.setFormData(payload);
  };

  getFormData = (): any => {
    return this.#form.formData;
  };

  setValidationErrors = (payload: IFormValidationErrors): void => {
    this.#form.setValidationErrors(payload);
  };

  get formInstance(): FormInstance<Values> {
    return this.#form.antdForm;
  };

  get formSettings(): IFormSettings {
    return this.#form.settings;
  };

  get formMode(): FormMode {
    return this.#form.formMode;
  };

  get data(): any {
    return this.#form.formData;
  };

  get defaultApiEndpoints(): IEntityEndpoints {
    return this.#form.defaultApiEndpoints;
  };

  get formArguments(): any {
    return this.#form.formArguments;
  }

  get parentFormValues(): any {
    return this.#form.parentFormValues;
  }

  get initialValues(): Values | undefined {
    return this.#form.initialValues;
  }
};

export type ShaFormSubscription<Values extends object = object> = (cs: IShaFormInstance<Values>) => void;
export type ShaFormSubscriptionType = 'data' | 'data-loading' | 'data-submit';

class ShaFormInstance<Values extends object = object> implements IShaFormInstance<Values> {
  private forceRootUpdate: ForceUpdateTrigger;

  private formManager: IFormManagerActionsContext;

  private metadataDispatcher: IMetadataDispatcher;

  private dataLoaders: IFormDataLoadersContext;

  private dataSubmitters: IFormDataSubmittersContext;

  private expressionExecuter: ExpressionExecuter;

  private events: FormEvents<Values>;

  private dataSubmitContext: IDataSubmitContext;

  updateData: () => void;

  modelMetadata?: IModelMetadata;

  antdForm: FormInstance;

  formMode: FormMode;

  formData?: any;

  isDataModified: boolean;

  validationErrors?: IFormValidationErrors;

  defaultValues: Values;

  initialValues: any;

  parentFormValues: object | undefined;

  formArguments?: any;

  onFinish: SubmitHandler<Values>;

  onAfterSubmit: AfterSubmitHandler<Values>;

  onValuesChange?: OnValuesChangeHandler<Values>;

  onMarkupLoaded?: OnMarkupLoadedHandler<Values>;

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
    this.isDataModified = false;
    this.subscriptions = new Map<ShaFormSubscriptionType, ShaFormSubscription<Values>>();
  }

  //#region subscriptions

  private subscriptions: Map<ShaFormSubscriptionType, ShaFormSubscription<Values>>;

  subscribe(type: ShaFormSubscriptionType, callback: () => void): () => void {
    this.subscriptions.set(type, callback);
    return () => this.unsubscribe(type);
  }

  private unsubscribe(type: ShaFormSubscriptionType): void {
    this.subscriptions.delete(type);
  }

  notifySubscribers(type: ShaFormSubscriptionType): void {
    const callback = this.subscriptions.get(type);
    callback?.(this);
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
  };

  #setInternalFormData = (values: any): void => {
    this.formData = values;
    this.#setIsDataModified(true);
    if (this.onValuesChange)
      this.onValuesChange(values, values);
    this.events.onValuesUpdate?.({ data: removeGhostKeys({ ...values }) });
  };

  setFormData = (payload: ISetFormDataPayload): void => {
    const { values, mergeValues } = payload;
    if (isEmpty(values) && mergeValues)
      return;

    const newData = payload.mergeValues && this.formData
      ? deepMergeValues(this.formData, values)
      : values;

    if (mergeValues) {
      this.antdForm.setFieldsValue(values);
    } else {
      this.antdForm.resetFields();
      this.antdForm.setFieldsValue(values);
    }

    this.#setInternalFormData(newData);

    this.updateData?.();
  };

  setParentFormValues = (values: object): void => {
    this.parentFormValues = values;
  };

  setValidationErrors = (payload: IFormValidationErrors | undefined): void => {
    this.validationErrors = payload;
    this.forceRootUpdate();
  };

  #publicFormApi: PublicFormApi<Values>;

  getPublicFormApi = (): IFormApi<Values> => {
    return this.#publicFormApi ?? (this.#publicFormApi = new PublicFormApi<Values>(this));
  };

  //#region Antd methods

  submit = (): void => {
    this.antdForm.submit();
  };

  setFieldsValue = (values: Partial<Values>): void => {
    this.antdForm.setFieldsValue(values);
    this.updateData?.();
  };

  resetFields = (): void => {
    this.antdForm.resetFields();
    const values = this.antdForm.getFieldsValue();
    this.#setInternalFormData(values);
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
  };

  log = (...args: unknown[]): void => {
    if (this.logEnabled)
    // eslint-disable-next-line no-console
      console.log(...args);
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

    const makeCaller = <TArguments = any, TResult = any>(expression: string): ExpressionCaller<TArguments, Promise<TResult>> | undefined => {
      if (!expression?.trim())
        return undefined;
      return (args: TArguments) => {
        return this.expressionExecuter(expression, args);
      };
    };

    this.events = {};
    this.events.onPrepareSubmitData = makeCaller<IDataArguments<Values>, Values>(settings.onPrepareSubmitData);
    this.events.onBeforeSubmit = makeCaller<IDataArguments<Values>, void>(settings.onBeforeSubmit);
    this.events.onSubmitSuccess = makeCaller<void, void>(settings.onSubmitSuccess);
    this.events.onSubmitFailed = makeCaller<void, void>(settings.onSubmitFailed);

    this.events.onBeforeDataLoad = makeCaller<void, void>(settings.onBeforeDataLoad);
    this.events.onAfterDataLoad = makeCaller<void, void>(settings.onAfterDataLoad);
    this.events.onValuesUpdate = makeCaller<IDataArguments<Values>, void>(settings.onValuesUpdate);

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

      if (this.onMarkupLoaded)
        await this.onMarkupLoaded(this);

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

  loadFormByIdAsync = async (payload: LoadFormByIdPayload = {}): Promise<void> => {
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

      if (this.onMarkupLoaded)
        await this.onMarkupLoaded(this);

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
    this.rawMarkup = rawMarkup;
    this.markupCacheKey = cacheKey;
    this.formArguments = formArguments;
    this.isSettingsForm = isSettingsForm;

    // ToDo: AS - recheck if data initialization is ok before markup initialization
    this.initialValues = initialValues;
    this.formData = initialValues;

    await this.loadFormByRawMarkupAsync();

    this.antdForm.resetFields();
    this.antdForm.setFieldsValue(initialValues);

    this.dataLoadingState = { status: 'ready', hint: null, error: null };
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

  initByFormId = async (payload: InitByFormIdPayload): Promise<void> => {
    const { formId, formArguments } = payload;

    const formNotChanged = isSameFormIds(this.formId, formId);
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

  private get dataLoader(): IFormDataLoader {
    return this.settings.dataLoaderType
      ? this.dataLoaders.getFormDataLoader(this.settings.dataLoaderType)
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
      this.dataLoadingState = { status: 'ready', hint: null, error: null };
      this.#setIsDataModified(false);
      this.forceRootUpdate();

      return this.initialValues;
    }

    const canLoadData = this.dataLoader && this.dataLoader.canLoadData(formArguments);

    if (canLoadData) {
      this.dataLoadingState = { status: 'loading', hint: 'Fetching data...', error: null };
      this.forceRootUpdate();

      const data = await this.dataLoader.loadAsync({
        formSettings: this.settings,
        formFlatStructure: this.flatStructure,
        formArguments: formArguments,
        expressionExecuter: this.expressionExecuter,
      });

      this.dataLoadingState = { status: 'ready' };
      this.initialValues = data;
      this.formData = data;
      this.antdForm.resetFields();
      this.antdForm.setFieldsValue(data);
      this.#setIsDataModified(false);
      this.forceRootUpdate();

      this.log('LOG: loaded', data);
      return data;
    }

    this.dataLoadingState = { status: 'ready', hint: null, error: null };
    this.#setIsDataModified(false);
    this.forceRootUpdate();

    return this.initialValues;
  };

  private get dataSubmitter(): IFormDataSubmitter {
    return this.settings.dataSubmitterType
      ? this.dataSubmitters.getFormDataSubmitter(this.settings.dataSubmitterType)
      : undefined;
  }

  submitData = async (payload: SubmitDataPayload = {}): Promise<Values> => {
    this.log('LOG: ShaForm submit...');
    const { customSubmitCaller } = payload;

    const { formData: data, antdForm } = this;
    const { getDelayedUpdates } = this.dataSubmitContext ?? {};

    if (this.useDataSubmitter) {
      this.log('LOG: use data submitter');
      this.dataSubmitState = { status: 'loading', hint: 'Saving data...', error: null };
      this.forceRootUpdate();

      try {
        if (!this.dataSubmitter)
          throw new Error('Submit handler is not configured for the form');

        const result = await this.dataSubmitter.submitAsync({
          formSettings: this.settings,
          formFlatStructure: this.flatStructure,
          data: data,
          antdForm: antdForm,
          getDelayedUpdates: getDelayedUpdates,
          expressionExecuter: this.expressionExecuter,
          customSubmitCaller,

          onPrepareSubmitData: this.events.onPrepareSubmitData,
          onBeforeSubmit: this.events.onBeforeSubmit,
          onSubmitSuccess: this.events.onSubmitSuccess,
          onSubmitFailed: this.events.onSubmitFailed,
        });

        this.log('LOG: submitted successfully');

        if (this.onAfterSubmit)
          this.onAfterSubmit(data, result);

        this.dataSubmitState = { status: 'ready', hint: null };
        this.#setIsDataModified(false);
        this.notifySubscribers('data-loading');
        this.forceRootUpdate();

        return result;
      } catch (error) {
        this.log('LOG: failed to submit', error);
        this.dataSubmitState = { status: 'failed', error: error };
        this.forceRootUpdate();
        throw error;
      }
    } else {
      this.log('LOG: use onFinish');
      this.onFinish(data);

      if (this.onAfterSubmit)
        this.onAfterSubmit(data, data);

      this.#setIsDataModified(false);

      return Promise.resolve(data);
    }
  };
}

type UseShaFormArgsExistingForm<Values extends object = object> = { form: IShaFormInstance<Values> };

type UseShaFormArgsNewForm<Values extends object = object> = {
  antdForm?: FormInstance<Values>;
  init?: (shaForm: IShaFormInstance<Values>) => void;
};
type UseShaFormArgs<Values extends object = object> = UseShaFormArgsExistingForm<Values> & UseShaFormArgsNewForm<Values>;

const useShaForm = <Values extends object = object>(args: UseShaFormArgs<Values>): IShaFormInstance<Values>[] => {
  const { antdForm, form, init } = args;

  const formRef = React.useRef<IShaFormInstance<Values>>();
  const [, forceUpdate] = React.useState({});
  const formManager = useFormManager();
  const dataLoaders = useFormDataLoaders();
  const dataSubmitters = useFormDataSubmitters();
  const [antdFormInstance] = Form.useForm(antdForm);
  const fullContext = useAvailableConstantsContextsNoRefresh();
  const metadataDispatcher = useMetadataDispatcher();

  if (!formRef.current) {
    if (form) {
      formRef.current = form;
    } else {
      // Create a new FormStore if not provided
      const forceReRender = (): void => {
        forceUpdate({});
      };

      const instance = new ShaFormInstance<Values>({
        forceRootUpdate: forceReRender,
        formManager: formManager,
        dataLoaders: dataLoaders,
        dataSubmitters: dataSubmitters,
        antdForm: antdFormInstance,
        metadataDispatcher: metadataDispatcher,
      });
      const accessors = wrapConstantsData({
        topContextId: DataContextTopLevels.Full,
        fullContext,
        shaForm: instance,
        queryStringGetter: getQueryParams,
      });
      const allConstants = makeObservableProxy<IApplicationContext>(accessors);

      const expressionExecuter = (expression: string, data: any = null): any => {
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
