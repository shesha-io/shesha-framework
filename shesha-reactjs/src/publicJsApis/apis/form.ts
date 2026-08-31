/* eslint-disable @typescript-eslint/no-explicit-any */
import { IEntityEndpoints } from "../entities/interfaces";
import { Components } from "./components";

export interface IEntityTypeIdentifier {
  module: string | null;
  name: string;
}

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
  modelType?: string | IEntityTypeIdentifier | undefined;

  postUrl?: string | undefined;
  putUrl?: string | undefined;
  deleteUrl?: string | undefined;
  getUrl?: string | undefined;

  fieldsToFetch?: string[] | undefined;

  /** if true then need to update components structure for using Setting component */
  isSettingsForm?: boolean | undefined;
};

export interface FormInstance {
  [key: string]: any;
}

export interface IDelayedUpdateItem {
  id: string;
  data: any;
}

export interface IDelayedUpdateGroup {
  name: string;
  items: IDelayedUpdateItem[];
}

export type FormData<Values extends object = object> = Values;

/** Form instance API */
export interface FormApi<Values extends object = object> {
  /** Clear fields value */
  clear(): void;
  /** Submit form */
  submit(): void;
  /** Get form data. Need for getting actual form data (using in scripts) */
  getFormData(): Values;
  /** Set validation errors. Need for display validation errors in the ValidationErrors component */
  setValidationErrors(payload: string | IErrorInfo | IAjaxResponseBase | AxiosResponse<IAjaxResponseBase> | Error): void;
  /**
   * Add deferred update data to `data` object
   * @param data model data object for updating
   * @returns The deferred update data
   */
  addDelayedUpdateData: (data: Values) => IDelayedUpdateGroup[];

  /** antd form instance */
  readonly formInstance?: FormInstance;
  /** Configurable form settings */
  readonly settings: IFormSettings | undefined;
  /** Form mode */
  mode: FormMode;
  /** Form data */
  readonly data: FormData<Values>;
  /** Form arguments passed by caller */
  readonly arguments?: any;
  /** Default API endpoints (create, read, update, delete). Note: available only when model type is entity */
  readonly defaultApiEndpoints: IEntityEndpoints;
  /** Additional form state (data) */
  readonly state: Record<string, any>;
  /** Form components API */
  readonly components: Components;
  /** Model type used for form */
  readonly modelType?: string | IEntityTypeIdentifier | undefined;
  /** Initial form values */
  readonly initialValues?: Partial<Values> | undefined;
  /** Parent form values */
  readonly parentFormValues?: object | undefined;
};
