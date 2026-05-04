import { setValueByPropertyName } from "@/utils/object";
import { ConfigurableFormInstance, ISetFormDataPayload } from "./contexts";
import { FormMode } from "@/generic-pages/dynamic/interfaces";
import { FormInstance } from "antd";
import { IAjaxResponseBase, IErrorInfo, IFormValidationErrors, isEntityMetadata } from "@/interfaces";
import { IEntityEndpoints } from "../sheshaApplication/publicApi/entities/entityTypeAccessor";
import { IShaFormInstance } from "./store/interfaces";
import { IDelayedUpdateGroup } from "../delayedUpdateProvider/models";
import { AxiosResponse } from "axios";
import { FieldValueSetter } from "@/utils/dotnotation";
import { IEntityTypeIdentifier } from "../sheshaApplication/publicApi/entities/models";
import { addDelayedUpdateProperty } from "../delayedUpdateProvider";
import { isDefined } from "@/utils/nullables";

/**
 * Form loader instance with progressive feedback methods
 */
export interface IFormLoaderInstanceApi {
  updateMessage(message: string): void;
  close(): void;
}

export interface IFormSettings {
  modelType?: string | IEntityTypeIdentifier | undefined;

  postUrl?: string | undefined;
  putUrl?: string | undefined;
  deleteUrl?: string | undefined;
  getUrl?: string | undefined;

  fieldsToFetch?: string[] | undefined;

  /** if true then need to update components structure for using Setting component */
  isSettingsForm?: boolean | undefined;
};

type PublicFormSettings = Pick<IFormSettings, 'modelType'>;

/**
 * Form instance API
 */
export interface IFormApi<Values extends object = object> {
  /**
   * Add deferred update data to `data` object
   * @param data model data object for updating
   * @returns The deferred update data
   */
  addDelayedUpdateData: (data: Values) => IDelayedUpdateGroup[];
  /**
   * Set field value
   * @param name field name
   * @param value field value
   */
  setFieldValue: FieldValueSetter<Values>;
  /**
   * Set fields value
   * @param values
   */
  setFieldsValue: (values: Values) => void;
  /**
   * Clear fields value
   */
  clearFieldsValue: () => void;
  /**
   * Submit form
   */
  submit: () => void;

  /**
   * Set form data
   * @deprecated The method should not be used
   * @param payload data payload
   */
  setFormData: (payload: ISetFormDataPayload<Values>) => void;

  /** Get form data. Need for getting actual form data (using in scripts) */
  getFormData: () => Values | undefined;

  /**
   * Show blocking loader overlay scoped to this form
   * @param message Optional message to display
   * @returns Loader instance with methods for progressive feedback
   */
  showLoader: (message?: string) => IFormLoaderInstanceApi;

  /**
   * Hide all active loaders
   */
  hideLoaders: () => void;

  /** Set validation errors. Need for display validation errors in the ValidationErrors component */
  setValidationErrors: (payload: string | IErrorInfo | IAjaxResponseBase | AxiosResponse<IAjaxResponseBase> | Error) => void;

  /** antd form instance */
  formInstance?: FormInstance<Values> | undefined;
  shaForm?: IShaFormInstance<Values> | undefined;
  /** Configurable form settings */
  formSettings: PublicFormSettings | undefined;
  /** Form mode */
  formMode: FormMode;
  /** Form data */
  data: Values | undefined;
  /** Default API endpoints (create, read, update, delete) */
  defaultApiEndpoints: IEntityEndpoints;
  /** Form arguments passed by caller */
  formArguments?: object | undefined;
  readonly initialValues?: Partial<Values> | undefined;
  readonly parentFormValues?: object | undefined;
};

export type ConfigurableFormPublicApi<TValues extends object = object> = Pick<ConfigurableFormInstance<TValues>, 'setFormData' | 'form' | 'formSettings' | 'formMode' | 'formData' | 'modelMetadata'> & {
  shaForm?: IShaFormInstance<TValues>;
  loaderApi?: {
    showLoader: (message?: string) => IFormLoaderInstanceApi;
    hideLoaders: () => void;
  };
};

class PublicFormApiWrapper<TValues extends object = object> implements IFormApi<TValues> {
  readonly #form: ConfigurableFormPublicApi<TValues>;

  constructor(form: ConfigurableFormPublicApi<TValues>) {
    this.#form = form;
  }

  addDelayedUpdateData = (data: TValues): IDelayedUpdateGroup[] => {
    const delayedUpdateData = this.#form.shaForm?.getDelayedUpdates() ?? [];
    if (delayedUpdateData.length > 0)
      addDelayedUpdateProperty(data, delayedUpdateData);

    return delayedUpdateData;
  };

  setFieldValue: FieldValueSetter<TValues> = (name, value) => {
    this.#form.setFormData({
      values: setValueByPropertyName(this.#form.formData ?? {}, name.toString(), value, true),
      mergeValues: true,
    });
  };

  setFieldsValue = (values: TValues): void => {
    this.#form.setFormData({ values, mergeValues: true });
  };

  clearFieldsValue = (): void => {
    this.#form.setFormData({ values: {}, mergeValues: false });
  };

  submit = (): void => {
    this.#form.form?.submit();
  };

  setFormData = (payload: ISetFormDataPayload): void => {
    this.#form.setFormData(payload);
  };

  getFormData = (): TValues | undefined => {
    return this.#form.formData;
  };

  showLoader = (message?: string): IFormLoaderInstanceApi => {
    return this.#form.loaderApi?.showLoader(message) || {
      updateMessage: () => { /* no-op */ },
      close: () => { /* no-op */ },
    };
  };

  hideLoaders = (): void => {
    this.#form.loaderApi?.hideLoaders();
  };

  setValidationErrors = (payload: IFormValidationErrors): void => {
    this.#form.shaForm?.setValidationErrors(payload);
  };

  get formInstance(): FormInstance<TValues> | undefined {
    // antd form
    return this.#form.form;
  }

  get shaForm(): IShaFormInstance<TValues> | undefined {
    return this.#form.shaForm;
  }

  get formSettings(): PublicFormSettings {
    return this.#form.formSettings ? { modelType: this.#form.formSettings.modelType } : {};
  }

  get formMode(): FormMode {
    return this.#form.formMode;
  }

  get data(): TValues | undefined {
    return this.#form.formData;
  }

  get defaultApiEndpoints(): IEntityEndpoints {
    return isDefined(this.#form.modelMetadata) && isEntityMetadata(this.#form.modelMetadata)
      ? this.#form.modelMetadata.apiEndpoints
      : {};
  }

  get initialValues(): object | undefined {
    return this.#form.shaForm?.initialValues;
  }

  get parentFormValues(): object | undefined {
    return this.#form.shaForm?.parentFormValues;
  }

  get formArguments(): object | undefined {
    return this.#form.shaForm?.formArguments;
  }
}

export const getFormApi = (form: ConfigurableFormPublicApi): IFormApi => {
  return new PublicFormApiWrapper(form);
};
