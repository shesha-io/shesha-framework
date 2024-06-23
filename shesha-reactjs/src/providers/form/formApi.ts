import { setValueByPropertyName } from "@/utils/object";
import { ConfigurableFormInstance, ISetFormDataPayload } from "./contexts";
import { FormMode } from "@/generic-pages/dynamic/interfaces";
import { FormInstance } from "antd";

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
  formSettings: IFormSettings;
  /** Form mode */
  formMode: FormMode;
  /** Form data */
  data: Values;
};

export type ConfigurableFormPublicApi = Pick<ConfigurableFormInstance, 'setFormData' | 'form' | 'formSettings' | 'formMode' | 'formData'>;

export const getFormApi = (form: ConfigurableFormPublicApi): FormApi => {
  return {
    setFieldValue: (name: string, value: any) => {
      form?.setFormData({values: setValueByPropertyName(form.formData, name, value, true), mergeValues: true});
    },
    setFieldsValue: (values: any) => {
      form?.setFormData({values, mergeValues: true});
    },
    submit: () => {
      form?.form?.submit();
    },
    setFormData: (payload: ISetFormDataPayload) => {
      form?.setFormData(payload);
    },

    formInstance: form?.form,
    formSettings: form?.formSettings,
    formMode: form?.formMode,
    data: form?.formData,
  };
};