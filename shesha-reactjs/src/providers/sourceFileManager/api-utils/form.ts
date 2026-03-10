export const formApiDefinition = `import { IEntityEndpoints } from 'entities/interfaces';

export interface IValidationErrorInfo {
  message?: string | null;
  members?: string | string[] | null;
}

export interface IErrorInfo {
  code?: number | null;
  message?: string | null;
  details?: string | null;
  validationErrors?: IValidationErrorInfo[] | null;
}

export interface IAjaxResponseBase {
  targetUrl?: string | null;
  success?: boolean;
  error?: IErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
}

export interface AxiosResponse<IAjaxResponseBase> {
  data: IAjaxResponseBase;
  status: number;
  statusText: string;
  request?: any;
}

/** Form mode */
export type FormMode = 'readonly' | 'edit' | 'designer';

export interface ISetFormDataPayload {
  /** form field values */
  values: any;

  /** if true, previous data will be merged with current values */
  mergeValues: boolean;
}

export interface FormFullName {
  readonly name: string;
  readonly module?: string | null;
}
export type FormUid = string;
export type FormIdentifier = FormFullName | FormUid;

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

  /** Get form data. Need for getting actual form data (using in scripts) */
  getFormData: () => Values;

  /** Set validation errors. Need for display validation errors in the ValidationErrors component */
  setValidationErrors: (payload: string | IErrorInfo | IAjaxResponseBase | AxiosResponse<IAjaxResponseBase> | Error) => void;

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
