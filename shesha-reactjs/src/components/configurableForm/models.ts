import { MutableRefObject } from 'react';
import { ColProps } from 'antd/lib/col';
import { FormInstance, FormProps } from 'antd/lib/form';
import { FormLayout } from 'antd/lib/form/Form';
import { ConfigurableFormInstance } from '@/providers/form/contexts';
import { FormMode, Store, IConfigurableFormBaseProps, IFormActions, IFormSections, FormMarkup } from '@/providers/form/models';
import { IConfigurableFormComponent, ValidateErrorEntity } from '@/interfaces';
import { StandardEntityActions } from '@/interfaces/metadata';

type SizeType = FormProps['size'];

export interface IConfigurableFormRendererProps<Values = any, _FieldData = any> {
  size?: SizeType;
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

  /**
   * If passed and the form has `getUrl` defined, you can use this function to prepare `fetchedData` for as `initialValues`
   * If you want to use only `initialValues` without combining them with `fetchedData` and then ignore `fetchedData`
   *
   * If not passed, `fetchedData` will be used as `initialValues` and, thus override initial values
   *
   * Whenever the form has a getUrl and that url has queryParams, buy default, the `dynamicModal` will fetch the form and, subsequently, the data
   * for that form
   */
  prepareInitialValues?: (fetchedData: any) => any;

  form?: FormInstance<any>;
  actions?: IFormActions;
  sections?: IFormSections;
  context?: any; // TODO: make generic

  httpVerb?: 'POST' | 'PUT' | 'DELETE';
  /**
   * Submit action. By default it's `create`
   */
  submitAction?: StandardEntityActions.create | StandardEntityActions.update | StandardEntityActions.delete;

  /**
   * By default, if the GET Url has parameters, the form configurator will proceed to fetch the entity
   * Pass this this is you wanna bypass that
   */
  skipFetchData?: boolean;

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

export interface IConfigurableFormProps<Values = any>
  extends IConfigurableFormBaseProps {

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
  initialValues?: Store;
  labelCol?: ColProps;
  wrapperCol?: ColProps;
  onValuesChange?: (changedValues: any, values: Values) => void;
  /**
   * If specified, the form will only be submitted if this function return true
   * Note: doesn't work when the `onFinish` is specified
   */
  beforeSubmit?: (values: Values) => Promise<boolean>;
  /**
   * Submit action. By default it's `create`
   */
  submitAction?: StandardEntityActions.create | StandardEntityActions.update | StandardEntityActions.delete;
  httpVerb?: 'POST' | 'PUT' | 'DELETE';
  actions?: IFormActions;
  sections?: IFormSections;
  /**
   * Returns the form data and the response data as well, only if an API was made and came back successful
   * Note: doesn't work when the `onFinish` is specified
   *
   * @param values form data before being submitted
   * @param response response data
   */
  onSubmitted?: (values: Values, response?: any, options?: object) => void;
  /**
   * If passed and the form has `getUrl` defined, you can use this function to prepare `fetchedData` for as `initialValues`
   * If you want to use only `initialValues` without combining them with `fetchedData` and then ignore `fetchedData`
   *
   * If not passed, `fetchedData` will be used as `initialValues` and, thus override initial values
   *
   * Whenever the form has a getUrl and that url has queryParams, buy default, the `dynamicModal` will fetch the form and, subsequently, the data
   * for that form
   */
  prepareInitialValues?: (fetchedData: any) => any;
  parentFormValues?: Store;
  /**
   * By default, if the GET Url has parameters, the form configurator will proceed to fetch the entity
   * Pass this this is you wanna bypass that
   */
  skipFetchData?: boolean;
  layout?: FormLayout;
  size?: SizeType;
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

  /**/

  mode: FormMode;
  formRef?: MutableRefObject<Partial<ConfigurableFormInstance> | null>;
  className?: string;
  isActionsOwner?: boolean;
  needDebug?: boolean;
  //isSettings?: boolean;
  propertyFilter?: (name: string) => boolean;

  markup?: FormMarkup;
  cacheKey?: string;
}

export interface IDataSourceComponent extends IConfigurableFormComponent {
  dataSource: 'api' | 'form';
}
