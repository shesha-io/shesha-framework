import { FC, RefObject } from 'react';
import { ColProps } from 'antd/lib/col';
import { FormInstance, FormProps } from 'antd/lib/form';
import { FormLayout } from 'antd/lib/form/Form';
import { IFormActionsContext } from '@/providers/form/contexts';
import { FormMode, HasFormIdOrMarkup, IFormActions, IFormSections, FormIdentifier } from '@/providers/form/models';
import { IConfigurableFormComponent, ValidateErrorEntity } from '@/interfaces';
import { AfterSubmitHandler, IShaFormInstance, OnMarkupLoadedHandler, ProcessingState, SubmitHandler } from '@/providers/form/store/interfaces';

type SizeType = FormProps['size'];

export interface IConfigurableFormRendererProps<Values extends object = object> {
  size?: SizeType | undefined;
  showDataSubmitIndicator?: boolean | undefined;
  labelCol?: ColProps | undefined;
  wrapperCol?: ColProps | undefined;
  layout?: FormLayout | undefined;
  initialValues?: Partial<Values> | undefined;
  parentFormValues?: object | undefined;
  className?: string | undefined;
  onValuesChange?: ((changedValues: Partial<Values>, values: Values) => void) | undefined;

  /**
   * Trigger after submitting the form and verifying data successfully. Note: this parameter overrides default behavoiur of the form.
   *
   * @param values form data
   */
  onFinish?: ((values: Values, options?: object) => void) | undefined;

  /**
   * Trigger after submitting the form and verifying data failed
   */
  onFinishFailed?: ((errorInfo: ValidateErrorEntity<Values>) => void) | undefined;

  /**
   * If specified, the form will only be submitted if this function return true
   * Note: doesn't work when the `onFinish` is specified
   */
  beforeSubmit?: ((values: Values) => Promise<boolean>) | undefined;

  /**
   * Returns the form data and the response data as well, only if an API was made and came back successful
   * Note: doesn't work when the `onFinish` is specified
   *
   * @param values form data before being submitted
   * @param response response data
   */
  onSubmitted?: ((values: Values, response?: unknown, options?: object) => void) | undefined;

  form?: FormInstance<Values> | undefined;
  actions?: IFormActions | undefined;
  sections?: IFormSections | undefined;

  /**
   * External form and data fetcher, is used to refresh form (both markup and data) from the back-end
   */
  refetcher?: (() => void) | undefined;

  /**
   * Triggered when the form is submitted successfully but the response is not successful
   **/
  onSubmittedFailed?: (() => void) | undefined;
}

export type OnFormValuesChangeHandler<TValues extends object = object> = (changedValues: Partial<TValues>, values: TValues) => void;
export type OnFormFinishFailedHandler<TValues extends object = object> = (errorInfo: ValidateErrorEntity<TValues>) => void;

export type IConfigurableFormRuntimeProps<TValues extends object = object> = {
  shaForm?: IShaFormInstance<TValues>;

  formName?: string;

  form?: FormInstance<TValues>;
  /**
   * Trigger after submitting the form and verifying data successfully. Note: this parameter overrides default behavoiur of the form.
   *
   * @param values form data
   */
  onFinish?: SubmitHandler<TValues> | undefined;
  /**
   * Trigger after submitting the form and verifying data failed
   */
  onFinishFailed?: OnFormFinishFailedHandler<TValues> | undefined;

  /**
   * Form argurments
   */
  formArguments?: object | undefined;

  /**
   * Form initial values
   */
  initialValues?: Partial<TValues> | undefined;
  /**
   * Parent form values. Note: is used for backward compatibility only
   */
  parentFormValues?: object | undefined;
  labelCol?: ColProps | undefined;
  wrapperCol?: ColProps | undefined;
  onValuesChange?: OnFormValuesChangeHandler<TValues> | undefined;
  /**
   * If specified, the form will only be submitted if this function return true
   * Note: doesn't work when the `onFinish` is specified
   */
  beforeSubmit?: ((values: TValues) => Promise<boolean>) | undefined;

  /**
   * Returns the form data and the response data as well, only if an API was made and came back successful
   * Note: doesn't work when the `onFinish` is specified
   *
   * @param values form data before being submitted
   * @param response response data
   */
  onSubmitted?: AfterSubmitHandler<TValues> | undefined;

  /**
   * Fires after loading of the form markup. Can be used for additional initialization purposes.
   * @returns Promise<void>
   */
  onMarkupLoaded?: OnMarkupLoadedHandler<TValues> | undefined;

  layout?: FormLayout | undefined;
  size?: SizeType | undefined;

  /**
   * External form and data fetcher, is used to refresh form (both markup and data) from the back-end
   */
  refetcher?: (() => void) | undefined;

  /**
   * Triggered when the form is submitted successfully but the response is not successful
   **/
  onSubmittedFailed?: (() => void) | undefined;

  /**/

  mode: FormMode;
  formRef?: RefObject<IFormActionsContext<TValues> | undefined> | undefined;
  className?: string | undefined;
  isActionsOwner?: boolean | undefined;
  propertyFilter?: ((name: string) => boolean) | undefined;
};

export type MarkupLoadingErrorRenderProps = {
  formId: FormIdentifier | undefined;
  markupLoadingState: ProcessingState;
};
export type DataLoadingErrorRenderProps = {
  dataLoadingState: ProcessingState;
};
export type IConfigurableFormRenderingProps = {
  markupLoadingError?: FC<MarkupLoadingErrorRenderProps> | undefined;
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
