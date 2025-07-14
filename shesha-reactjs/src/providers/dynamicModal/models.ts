import { PropsWithChildren, ReactNode } from 'react';
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
  title?: string;

  /**
   * Whether the modal is visible
   */
  isVisible: boolean;

  destroyOnClose?: boolean;

  width?: number | string;

  onCancel?: () => void;
}

export type ModalFooterButtons = 'default' | 'custom' | 'none';

export interface IModalWithConfigurableFormProps extends IModalBaseProps {
  /**
   * Id of the form to be rendered on the markup
   */
  formId: FormIdentifier;

  /**
   * Mode of the form: "designer" | "edit" | "readonly"
   */
  mode?: FormMode;

  /**
   * Form argurments
   */
  formArguments?: any;

  /**
   * Initial values of the modal
   */
  initialValues?: any;

  parentFormValues?: any;

  /**
   * Whether the modal footer should be shown. The modal footer shows default buttons Submit and Cancel.
   *
   * The url to use will be found in the form settings and the correct verb to use is specified by submitHttpVerb
   *
   * @deprecated - use `footerButtons` instead
   */

  showModalFooter?: boolean;

  /**
   * A callback to execute when the form has been submitted
   */
  onSubmitted?: (values?: any) => void;

  onFailed?: (errorInfo: ValidateErrorEntity<any>) => void;

  footerButtons?: ModalFooterButtons;

  buttons?: ButtonGroupItemProps[];

  wrapper?: (props: PropsWithChildren) => React.ReactNode;
  /**
   * Whether to show the close icon in the modal header
   * @default true
   */
  showCloseIcon?: boolean;
}

export interface IModalWithContentProps extends IModalBaseProps {
  footer?: ReactNode;
  content: ReactNode;
  onClose?: (positive?: boolean, result?: any) => void;
}
/**
 * Dynamic Modal properties
 */
export interface IModalProps extends IModalWithConfigurableFormProps {
  onClose?: (positive?: boolean, result?: any) => void;
};
export type ICommonModalProps = IModalWithContentProps | IModalWithConfigurableFormProps;

/**
 * Modal dialog instance
 */
export interface IModalInstance {
  id: string;
  isVisible: boolean;
  props: ICommonModalProps;

  /**
   * Useful if you want to close the latest dialog using an action
   */
  index?: number;

  onClose?: (positive?: boolean, result?: any) => void;
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
