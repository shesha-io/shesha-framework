import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';
import { FormIdentifier, FormMarkup } from '../../form/models';
import { ModalFooterButtons } from '../models';
import closeDialogArgumentsJson from './close-dialog-arguments.json';

export interface ICloseModalActionArguments {
  showDialogResult?: string;
}

export interface IShowModalActionArguments {
  modalTitle: string;
  formId: FormIdentifier;
  formMode?: 'edit' | 'readonly';
  formArguments?: string | undefined;
  modalWidth?: number | string | undefined;
  customWidth?: number | undefined;
  widthUnits?: '%' | 'px' | undefined;
  buttons?: ButtonGroupItemProps[] | undefined;
  footerButtons?: ModalFooterButtons | undefined;
  showModalFooter?: boolean | undefined;
  showCloseIcon?: boolean | undefined;
  /**
   * What http verb to use when submitting the form. Used in conjunction with `showModalFooter`
   */
  submitHttpVerb?: 'POST' | 'PUT';
}

export const closeDialogArgumentsForm = closeDialogArgumentsJson as FormMarkup;
