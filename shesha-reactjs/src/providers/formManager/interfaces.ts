import { IFlatComponentsStructure, IFormSettings } from "../form/models";

export interface UpToDateForm {
  id?: string;
  module?: string;
  name?: string;
  label?: string | undefined;
  description?: string | undefined;
  flatStructure: IFlatComponentsStructure;
  settings: IFormSettings;

  /** Form asscess mode */
  access?: number | undefined;
  /** Form permissions for Required premission mode */
  permissions?: string[] | undefined;
  readOnly: boolean;
}

export const FORM_LOADING_STATES = ['ready', 'loading', 'error'] as const;
export type FormLoadingState = typeof FORM_LOADING_STATES[number];

export interface FormLoadingItem {
  state: FormLoadingState;
  form?: UpToDateForm;
  error?: unknown;
  promise: Promise<UpToDateForm>;
}

export interface FormsCache {
  [key: string]: FormLoadingItem;
}
