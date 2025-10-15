import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';
import { FormIdentifier, FormMarkup } from '../../form/models';
import { ModalFooterButtons } from '../models';
import closeDialogArgumentsJson from './close-dialog-arguments.json';
import { getSettings, showDialogComponents } from './show-dialog-arguments';

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
  showCloseIcon?: boolean;
  /**
   * What http verb to use when submitting the form. Used in conjunction with `showModalFooter`
   */
  submitHttpVerb?: 'POST' | 'PUT';
}

export const showDialogArgumentsForm = { ...getSettings(), components: showDialogComponents } as FormMarkup;
export const closeDialogArgumentsForm = closeDialogArgumentsJson as FormMarkup;
