import { IReferenceListIdentifier } from '@/interfaces';
import { getFormFullName } from '@/utils/form';
import { FormIdentifier } from '../form/models';
import { isFormFullName, isFormRawId } from '../form/utils';
import { getReferenceListFullName } from '../referenceListDispatcher/utils';
import { isDefined } from '@/utils/nullables';

export const getFormNotFoundMessage = (formId: FormIdentifier): string => {
  if (isFormRawId(formId)) return `Form with id='${formId}' not found`;

  if (isFormFullName(formId)) return `Form '${getFormFullName(formId.module, formId.name)}' not found`;

  return 'Form not found';
};

export const getFormForbiddenMessage = (formId: FormIdentifier): string => {
  if (isFormRawId(formId)) return `You are not authorized to access the form with id='${formId}'`;

  if (isFormFullName(formId)) return `You are not authorized to access the form '${getFormFullName(formId.module, formId.name)}'`;

  return 'Form not found';
};


export const getReferenceListNotFoundMessage = (refListId?: IReferenceListIdentifier): string => {
  return isDefined(refListId)
    ? `Reference list '${getReferenceListFullName(refListId)}' not found`
    : 'Reference list not found';
};
