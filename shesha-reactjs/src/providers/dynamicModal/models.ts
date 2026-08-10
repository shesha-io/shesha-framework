import { FC, PropsWithChildren, ReactNode } from 'react';
import { ValidateErrorEntity } from '@/interfaces';
import { IKeyValue } from '@/interfaces/keyValue';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';
import { FormIdentifier, FormMode } from './../form/models';

export interface IModalBaseProps {
  /**
   * Id of the modal
   */
  id: string;

  /**
   * Title to display on the modal
   */
  title?: string | undefined;

  /**
   * Whether the modal is visible
   */
  isVisible: boolean;

  destroyOnClose?: boolean | undefined;

  width?: number | string | undefined;

  onCancel?: (() => void) | undefined;

  showCloseIcon?: boolean | undefined;
}

export type ModalFooterButtons = 'default' | 'custom' | 'none';

export interface IClosableModalProps<Values extends object = object> {
  onClose?: ((positive?: boolean, result?: Values | undefined) => void) | undefined;
}

export interface IModalWithConfigurableFormProps<Values extends object = object> extends IModalBaseProps, IClosableModalProps<Values> {
  /**
   * Id of the form to be rendered on the markup
   */
  formId: FormIdentifier;

  /**
   * Mode of the form: "designer" | "edit" | "readonly"
   */
  mode?: FormMode | undefined;

  /**
   * Form argurments
   */
  formArguments?: object | undefined;

  /**
   * Initial values of the modal
   */
  initialValues?: object | undefined;

  parentFormValues?: object | undefined;

  /**
   * Whether the modal footer should be shown. The modal footer shows default buttons Submit and Cancel.
   *
   * The url to use will be found in the form settings and the correct verb to use is specified by submitHttpVerb
   *
   * @deprecated - use `footerButtons` instead
   */

  showModalFooter?: boolean | undefined;

  /**
   * A callback to execute when the form has been submitted
   */
  onSubmitted?: ((values?: Values) => void) | undefined;

  onFailed?: ((errorInfo: ValidateErrorEntity<Values>) => void) | undefined;

  footerButtons?: ModalFooterButtons | undefined;

  buttons?: ButtonGroupItemProps[] | undefined;

  wrapper?: FC<PropsWithChildren> | undefined;
  /**
   * Whether to show the close icon in the modal header
   * @default true
   */
  showCloseIcon?: boolean | undefined;
}

export interface IModalWithContentProps<Values extends object = object> extends IModalBaseProps, IClosableModalProps<Values> {
  footer?: ReactNode | string | undefined;
  content: ReactNode | string;
}
/**
 * Dynamic Modal properties
 */
export interface IModalProps<Values extends object = object> extends IModalWithConfigurableFormProps<Values>, IClosableModalProps<Values> {

};

export type ICommonModalProps<Values extends object = object> = IModalWithContentProps<Values> | IModalWithConfigurableFormProps<Values>;

/**
 * Modal dialog instance
 */
export interface IModalInstance<Values extends object = object> {
  id: string;
  isVisible: boolean;
  props: ICommonModalProps;

  /**
   * Useful if you want to close the latest dialog using an action
   */
  index: number;

  onClose?: ((positive?: boolean, result?: Values) => void) | undefined;
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
  showCloseIcon?: boolean;
}
