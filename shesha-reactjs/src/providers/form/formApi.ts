import { ISetFormDataPayload } from "./contexts";
import { FormInstance } from "antd";
import { FormMode, IAjaxResponseBase, IErrorInfo } from "@/interfaces";
import { IEntityEndpoints } from "../sheshaApplication/publicApi/entities/entityTypeAccessor";
import { IShaFormInstance } from "./store/interfaces";
import { IDelayedUpdateGroup } from "../delayedUpdateProvider/models";
import { AxiosResponse } from "axios";
import { FieldValueSetter } from "@/utils/dotnotation";
import { IEntityTypeIdentifier } from "../sheshaApplication/publicApi/entities/models";
import { FormData } from "./store/shaFormInstance";

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
  /** Clear fields value */
  clear: () => void;
  /** Submit form */
  submit: () => void;
  /** Get form data. Need for getting actual form data (using in scripts) */
  getFormData: (() => Values) | undefined;
  /** Set validation errors. Need for display validation errors in the ValidationErrors component */
  setValidationErrors: (payload: string | IErrorInfo | IAjaxResponseBase | AxiosResponse<IAjaxResponseBase> | Error) => void;
  /**
   * Add deferred update data to `data` object
   * @param data model data object for updating
   * @returns The deferred update data
   */
  addDelayedUpdateData: (data: Values) => IDelayedUpdateGroup[];
  /** antd form instance */
  readonly formInstance?: FormInstance<Values> | undefined;
  readonly shaForm?: IShaFormInstance<Values> | undefined;
  /** Configurable form settings */
  readonly settings: PublicFormSettings | undefined;
  /** Form data */
  readonly data: FormData<Values>;
  /** Default API endpoints (create, read, update, delete) */
  readonly defaultApiEndpoints: IEntityEndpoints;
  /** Form mode */
  mode: FormMode;
  /** Model type used for form */
  readonly modelType?: string | IEntityTypeIdentifier | undefined;
  /** Form arguments passed by caller */
  readonly arguments?: object | undefined;
  readonly initialValues?: Partial<Values> | undefined;
  readonly parentFormValues?: object | undefined;
  readonly state: Record<string, unknown> | undefined;
  /** Form components API */
  readonly components: Record<string, Record<string, unknown>>;

  /** Configurable form settings @deprecated Use settings instead */
  readonly formSettings: PublicFormSettings | undefined;
  /** Form mode @deprecated Use mode instead */
  formMode: FormMode;
  /** Form arguments passed by caller @deprecated Use arguments instead */
  formArguments?: object | undefined;
  /** @deprecated */
  context: Record<string, unknown> | undefined;
  /** Clear fields value @deprecated Use clear instead */
  clearFieldsValue: () => void;
  /**
   * @deprecated Set field value
   * @param name field name
   * @param value field value
   */
  setFieldValue: FieldValueSetter<Values>;
  /**
   * @deprecated Set fields value
   * @param values
   */
  setFieldsValue: (values: Values) => void;
  /**
   * Set form data
   * @deprecated The method should not be used
   * @param payload data payload
   */
  setFormData: (payload: ISetFormDataPayload<Values>) => void;
};
