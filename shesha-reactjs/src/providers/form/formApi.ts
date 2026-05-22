import { ISetFormDataPayload } from "./contexts";
import { FormInstance } from "antd";
import { FormMode, IAjaxResponseBase, IErrorInfo } from "@/interfaces";
import { IEntityEndpoints } from "../sheshaApplication/publicApi/entities/entityTypeAccessor";
import { IShaFormInstance } from "./store/interfaces";
import { IDelayedUpdateGroup } from "../delayedUpdateProvider/models";
import { AxiosResponse } from "axios";
import { FieldValueSetter } from "@/utils/dotnotation";
import { IEntityTypeIdentifier } from "../sheshaApplication/publicApi/entities/models";

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
  context: Record<string, unknown> | undefined;
  /** Form components API */
  components: Record<string, Record<string, unknown>>;
};
