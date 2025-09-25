import { MutableRefObject } from 'react';
import { ColProps } from 'antd/lib/col';
import { FormInstance, FormProps } from 'antd/lib/form';
import { FormLayout } from 'antd/lib/form/Form';
import { ConfigurableFormInstance } from '@/providers/form/contexts';
import { FormMode, Store, HasFormIdOrMarkup, IFormActions, IFormSections, FormIdentifier } from '@/providers/form/models';
import { IConfigurableFormComponent, ValidateErrorEntity } from '@/interfaces';
import { IShaFormInstance, ProcessingState } from '@/providers/form/store/interfaces';

type SizeType = FormProps['size'];

export interface IConfigurableFormRendererProps<Values = any, _FieldData = any> {
  size?: SizeType;
  showDataSubmitIndicator?: boolean;
  labelCol?: ColProps;
  wrapperCol?: ColProps;
  layout?: FormLayout;
  initialValues?: Store;
  parentFormValues?: Store;
  className?: string;
  onValuesChange?: (changedValues: any, values: Values) => void;

  /**
   * Trigger after submitting the form and verifying data successfully. Note: this parameter overrides default behavoiur of the form.
   *
   * @param values form data
   */
  onFinish?: (values: Values, options?: object) => void;

  /**
   * Trigger after submitting the form and verifying data failed
   */
  onFinishFailed?: (errorInfo: ValidateErrorEntity<Values>) => void;

  /**
   * If specified, the form will only be submitted if this function return true
   * Note: doesn't work when the `onFinish` is specified
   */
  beforeSubmit?: (values: Values) => Promise<boolean>;

  /**
   * Returns the form data and the response data as well, only if an API was made and came back successful
   * Note: doesn't work when the `onFinish` is specified
   *
   * @param values form data before being submitted
   * @param response response data
   */
  onSubmitted?: (values: Values, response?: any, options?: object) => void;

  form?: FormInstance<any>;
  actions?: IFormActions;
  sections?: IFormSections;
  context?: any; // TODO: make generic

  /**
   * External data fetcher, is used to refresh form data from the back-end.
   */
  refetchData?: () => Promise<any>;

  /**
   * External form and data fetcher, is used to refresh form (both markup and data) from the back-end
   */
  refetcher?: () => void;

  /**
   * Triggered when the form is submitted successfully but the response is not successful
   **/
  onSubmittedFailed?: () => void;

}

export type IConfigurableFormRuntimeProps<Values extends object = object> = {
  shaForm?: IShaFormInstance<Values>;

  formName?: string;

  form?: FormInstance<any>;
  /**
   * Trigger after submitting the form and verifying data successfully. Note: this parameter overrides default behavoiur of the form.
   *
   * @param values form data
   */
  onFinish?: (values: Values, options?: object) => void;
  /**
   * Trigger after submitting the form and verifying data failed
   */
  onFinishFailed?: (errorInfo: ValidateErrorEntity<Values>) => void;

  /**
   * Form argurments
   */
  formArguments?: any;

  /**
   * Form initial values
   */
  initialValues?: Store;
  /**
   * Parent form values. Note: is used for backward compatibility only
   */
  parentFormValues?: Store;
  labelCol?: ColProps;
  wrapperCol?: ColProps;
  onValuesChange?: (changedValues: any, values: Values) => void;
  /**
   * If specified, the form will only be submitted if this function return true
   * Note: doesn't work when the `onFinish` is specified
   */
  beforeSubmit?: (values: Values) => Promise<boolean>;

  /**
   * Returns the form data and the response data as well, only if an API was made and came back successful
   * Note: doesn't work when the `onFinish` is specified
   *
   * @param values form data before being submitted
   * @param response response data
   */
  onSubmitted?: (values: Values, response?: any, options?: object) => void;

  /**
   * Fires after loading of the form markup. Can be used for additional initialization purposes.
   * @returns Promise<void>
   */
  onMarkupLoaded?: (shaForm: IShaFormInstance<Values>) => Promise<void>;

  layout?: FormLayout;
  size?: SizeType;

  /**
   * External form and data fetcher, is used to refresh form (both markup and data) from the back-end
   */
  refetcher?: () => void;

  /**
   * Triggered when the form is submitted successfully but the response is not successful
   **/
  onSubmittedFailed?: () => void;

  /**/

  mode: FormMode;
  formRef?: MutableRefObject<Partial<ConfigurableFormInstance> | null>;
  className?: string;
  isActionsOwner?: boolean;
  propertyFilter?: (name: string) => boolean;
};

export type MarkupLoadingErrorRenderProps = {
  formId: FormIdentifier;
  markupLoadingState: ProcessingState;
};
export type IConfigurableFormRenderingProps = {
  markupLoadingError?: (args: MarkupLoadingErrorRenderProps) => React.ReactNode;
};

export type IConfigurableFormProps<Values extends object = object> = HasFormIdOrMarkup & IConfigurableFormRuntimeProps<Values> & IConfigurableFormRenderingProps & {
  logEnabled?: boolean;
  /**
   * Show/hide form information is the block overlay (is visible in edit mode). Default value = true
   */
  showFormInfoOverlay?: boolean;
  /**
   * Show/hide data loading indicator. Default value = true
   */
  showDataLoadingIndicator?: boolean;
  /**
   * Show/hide data submit indicator. Default value = true
   */
  showDataSubmitIndicator?: boolean;
  /**
   * Show/hide markup loading indicator. Default value = true
   */
  showMarkupLoadingIndicator?: boolean;
};

export interface IDataSourceComponent extends IConfigurableFormComponent {
  dataSource: 'api' | 'form';
}

export type SheshaFormProps = {
  actions?: IFormActions;
  sections?: IFormSections;
};
