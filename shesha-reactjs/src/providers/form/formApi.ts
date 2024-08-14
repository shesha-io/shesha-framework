import { setValueByPropertyName } from "@/utils/object";
import { ConfigurableFormInstance, ISetFormDataPayload } from "./contexts";
import { FormMode } from "@/generic-pages/dynamic/interfaces";
import { FormInstance } from "antd";
import { isEntityMetadata } from "@/interfaces";
import { IEntityEndpoints } from "../sheshaApplication/publicApi/entities/entityTypeAccessor";
import { IShaFormInstance } from "./store/interfaces";

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
export interface FormApi<Values = any> {
  /**
   * Set field value
   * @param name field name
   * @param value field value
   */
  setFieldValue: (name: string, value: any) => void;
  /**
   * Set fields value
   * @param values 
   */
  setFieldsValue: (values: Values) => void;
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
};

export type ConfigurableFormPublicApi = Pick<ConfigurableFormInstance, 'setFormData' | 'form' | 'formSettings' | 'formMode' | 'formData' | 'modelMetadata'> & {
  shaForm?: IShaFormInstance;
};

class PublicFormApiWrapper implements FormApi {
  readonly #form: ConfigurableFormPublicApi;

  constructor(form: ConfigurableFormPublicApi) {
    this.#form = form;
  }

  setFieldValue = (name: string, value: any) => {
    // setFormData part of FormProvider
    this.#form?.setFormData({ values: setValueByPropertyName(this.#form.formData, name, value, true), mergeValues: true });
  };
  setFieldsValue = (values: any) => {
    // setFormData part of FormProvider
    this.#form?.setFormData({ values, mergeValues: true });
  };
  submit = () => {
    // antd form (this._form?.form)
    this.#form?.form?.submit();
  };
  setFormData = (payload: ISetFormDataPayload) => {
    // setFormData part of FormProvider
    this.#form?.setFormData(payload);
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
  get formArguments(): any {
    return this.#form?.shaForm?.formArguments;
  }
}

export const getFormApi = (form: ConfigurableFormPublicApi): FormApi => {
  /*
  if (form && !form.shaForm)
    console.log('LOG: getFormApi shaForm is dead ☠');
  */

  return new PublicFormApiWrapper(form);
  /*
  const formArguments = form?.shaForm?.formArguments;
  console.log('LOG: getFormApi', formArguments);

  return {
    setFieldValue: (name: string, value: any) => {
      form?.setFormData({ values: setValueByPropertyName(form.formData, name, value, true), mergeValues: true });
    },
    setFieldsValue: (values: any) => {
      form?.setFormData({ values, mergeValues: true });
    },
    submit: () => {
      form?.form?.submit();
    },
    setFormData: (payload: ISetFormDataPayload) => {
      form?.setFormData(payload);
    },

    data: form?.formData,
    formInstance: form?.form,
    formMode: form?.formMode,

    formSettings: form?.formSettings ? { modelType: form.formSettings.modelType } : {},
    defaultApiEndpoints: isEntityMetadata(form?.modelMetadata) ? form.modelMetadata.apiEndpoints : {},
    formArguments: form?.shaForm?.formArguments,
  };
  */
};