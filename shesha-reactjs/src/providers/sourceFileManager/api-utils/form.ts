export const formApiDefinition = `import { IEntityEndpoints } from 'entities/interfaces';

/** Form mode */
export type FormMode = 'readonly' | 'edit' | 'designer';

export interface ISetFormDataPayload {
  /** form field values */
  values: any;

  /** if true, previous data will be merged with current values */
  mergeValues: boolean;
}

export interface IFormSettings {
  modelType?: string;
};

export interface FormInstance<Values> {
  
}

/**
 * Form instance API
 */
export interface FormApi<Values = any> {
  /**
   * Add deferred update data to 'data' object 
   * @param data model data object for updating
   * @returns The deferred update data
   */
  addDelayedUpdateData: (data: Values) => IDelayedUpdateGroup[];
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

  /** antd form instance */
  formInstance?: FormInstance<Values>;
  /** Configurable form settings */
  formSettings: IFormSettings;
  /** Form mode */
  formMode: FormMode;
  /** Form data */
  data: Values;
  
  /** Form arguments passed by caller */
  formArguments?: any;

  /** Default API endpoints (create, read, update, delete). Note: available only when model type is entity */
  defaultApiEndpoints: IEntityEndpoints;
};
`;