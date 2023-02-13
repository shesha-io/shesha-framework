import { FormIdentifier, FormMode } from './../form/models';
import { ValidateErrorEntity } from '../../interfaces';
import { IKeyValue } from '../../interfaces/keyValue';
import { ReactNode } from 'react';

export interface IModalBaseProps {
  /**
   * Id of the modal
   */
  id: string;

  /**
   * Title to display on the modal
   */
  title?: string;

  /**
   * Whether the modal is visible
   */
  isVisible: boolean;

  destroyOnClose?: boolean;

  width?: number | string;

  onCancel?: () => void;
}

export interface IModalWithConfigurableFormProps extends IModalBaseProps {
  /**
   * Id of the form to be rendered on the markup
   */
  formId: FormIdentifier;

  /**
   * Url to be used to fetch form data
   */
  fetchUrl?: string;

  /**
   * What http verb to use when submitting the form. Used in conjunction with `showModalFooter`
   */
  submitHttpVerb?: 'POST' | 'PUT';

  /**
   * Mode of the form: "designer" | "edit" | "readonly"
   */
  mode?: FormMode;

  /**
   * Initial values of the modal
   */
  initialValues?: any;

  parentFormValues?: any;

  /**
   * If specified, the form data will not be fetched, even if the GET Url has query parameters that can be used to fetch the data.
   * This is useful in cases whereby one form is used both for create and edit mode
   */
  skipFetchData?: boolean;

  submitLocally?: boolean;

  modalConfirmDialogMessage?: string;

  /**
   * Whether the modal footer should be shown. The modal footer shows default buttons Submit and Cancel.
   *
   * The url to use will be found in the form settings and the correct verb to use is specified by submitHttpVerb
   */
  showModalFooter?: boolean;

  /**
   * If passed and the form has `getUrl` defined, you can use this function to prepare `fetchedData` for as `initialValues`
   * If you want to use only `initialValues` without combining them with `fetchedData` and then ignore `fetchedData`
   *
   * If not passed, `fetchedData` will be used as `initialValues`
   *
   * Whenever the form has a getUrl and that url has queryParams, buy default, the `dynamicModal` will fetch the form and, subsequently, the data
   * for that form
   */
  prepareInitialValues?: (fetchedData: any) => any;

  /**
   * A callback to execute when the form has been submitted
   */
  onSubmitted?: (values?: any) => void;

  onFailed?: (errorInfo: ValidateErrorEntity<any>) => void;

  /**
   * If passed, the user will be redirected to this url on success
   */
  onSuccessRedirectUrl?: string;
}

export interface IModalWithContentProps extends IModalBaseProps {
  footer?: ReactNode;
  content: ReactNode;
}
/**
 * Dynamic Modal properties
 */
export type IModalProps = IModalWithConfigurableFormProps;
export type ICommonModalProps = IModalWithContentProps | IModalWithConfigurableFormProps;

/**
 * Modal dialog instance
 */
export interface IModalInstance {
  id: string;
  isVisible: boolean;
  props: ICommonModalProps;
}

/**
 * An interface for configuring the modal on the form designer for buttons, toolbarItem and columns
 */
export interface IModalProperties {
  modalTitle?: string;
  modalFormId?: string;
  submitHttpVerb?: 'POST' | 'PUT';
  onSuccessRedirectUrl?: string;
  additionalProperties?: IKeyValue[];
  modalWidth?: number;
  showModalFooter?: boolean;
}
