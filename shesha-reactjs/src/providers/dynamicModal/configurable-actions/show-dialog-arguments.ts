import { FormIdentifier, FormMarkup } from '../../form/models';
import { ButtonGroupItemProps } from '@/index';
import { ModalFooterButtons } from '../models';
import showDialogArgumentsJson from './show-dialog-arguments.json';
import closeDialogArgumentsJson from './close-dialog-arguments.json';

export interface ICloseModalActionArguments {
  showDialogResult?: string;
}

export interface IShowModalActionArguments {
  modalTitle: string;
  formId: FormIdentifier;
  formMode?: 'edit' | 'readonly';
  formArguments?: string;
  modalWidth?: number | string;
  customWidth?: number;
  widthUnits?: '%' | 'px';
  buttons?: ButtonGroupItemProps[];
  footerButtons?: ModalFooterButtons;
  showModalFooter?: boolean;
  /**
   * What http verb to use when submitting the form. Used in conjunction with `showModalFooter`
   */
  submitHttpVerb?: 'POST' | 'PUT';
  /**
   * Whether to show the close icon in the modal header
   * @default true
   */
  showCloseIcon?: boolean;
}

export const showDialogArgumentsForm = showDialogArgumentsJson as FormMarkup;
export const closeDialogArgumentsForm = closeDialogArgumentsJson as FormMarkup;