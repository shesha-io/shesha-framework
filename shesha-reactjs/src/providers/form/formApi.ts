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

export interface IFormSettings {
  modelType?: string;

  postUrl?: string;
  putUrl?: string;
  deleteUrl?: string;
  getUrl?: string;

  fieldsToFetch?: string[];

  /** if true then need to update components structure for using Setting component */
  isSettingsForm?: boolean;
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
  setFormData: (payload: ISetFormDataPayload) => void;

  /** Get form data. Need for getting actual form data (using in scripts) */
  getFormData: () => Values;

  /** Set validation errors. Need for display validation errors in the ValidationErrors component */
  setValidationErrors: (payload: string | IErrorInfo | IAjaxResponseBase | AxiosResponse<IAjaxResponseBase> | Error) => void;

  /** antd form instance */
  formInstance?: FormInstance<Values>;
  /** Configurable form settings */
  formSettings: PublicFormSettings;
  /** Form mode */
  formMode: FormMode;
  /** Form data */
  data: Values;
  /** Default API endpoints (create, read, update, delete) */
  defaultApiEndpoints: IEntityEndpoints;
  /** Form arguments passed by caller */
  formArguments?: any;
  readonly initialValues?: Partial<Values>;
  readonly parentFormValues?: any;
};

export type ConfigurableFormPublicApi = Pick<ConfigurableFormInstance, 'setFormData' | 'form' | 'formSettings' | 'formMode' | 'formData' | 'modelMetadata'> & {
  shaForm?: IShaFormInstance;
};

class PublicFormApiWrapper implements IFormApi {
  readonly #form: ConfigurableFormPublicApi;

  constructor(form: ConfigurableFormPublicApi) {
    this.#form = form;
  }

  addDelayedUpdateData = (data: any): IDelayedUpdateGroup[] => {
    const delayedUpdateData = this.#form?.shaForm?.getDelayedUpdates();
    if (delayedUpdateData?.length > 0)
      data['_delayedUpdate'] = delayedUpdateData;
    return delayedUpdateData;
  };

  setFieldValue = (name: string, value: any): void => {
    this.#form?.setFormData({ values: setValueByPropertyName(this.#form.formData, name, value, true), mergeValues: true });
  };

  setFieldsValue = (values: any): void => {
    this.#form?.setFormData({ values, mergeValues: true });
  };

  clearFieldsValue = (): void => {
    this.#form?.setFormData({ values: {}, mergeValues: false });
  };

  submit = (): void => {
    this.#form?.form?.submit();
  };

  setFormData = (payload: ISetFormDataPayload): void => {
    this.#form?.setFormData(payload);
  };

  getFormData = (): any => {
    return this.#form?.formData;
  };

  setValidationErrors = (payload: IFormValidationErrors): void => {
    this.#form?.shaForm?.setValidationErrors(payload);
  };

  get formInstance(): FormInstance<any> {
    // antd form
    return this.#form?.form;
  }

  get formSettings(): PublicFormSettings {
    return this.#form?.formSettings ? { modelType: this.#form.formSettings.modelType } : {};
  }

  get formMode(): FormMode {
    return this.#form?.formMode;
  }

  get data(): any {
    return this.#form?.formData;
  }

  get defaultApiEndpoints(): IEntityEndpoints {
    return isEntityMetadata(this.#form?.modelMetadata)
      ? this.#form.modelMetadata.apiEndpoints
      : {};
  }

  get initialValues(): any {
    return this.#form?.shaForm?.initialValues;
  }

  get parentFormValues(): any {
    return this.#form?.shaForm?.parentFormValues;
  }

  get formArguments(): any {
    return this.#form?.shaForm?.formArguments;
  }
}

export const getFormApi = (form: ConfigurableFormPublicApi): IFormApi => {
  return new PublicFormApiWrapper(form);
};
