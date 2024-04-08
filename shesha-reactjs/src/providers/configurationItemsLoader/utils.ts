import { IReferenceListIdentifier } from '@/interfaces';
import { getFormFullName } from '@/utils/form';
import { FormIdentifier } from '../form/models';
import { asFormFullName, asFormRawId } from '../form/utils';
import { getReferenceListFullName } from '../referenceListDispatcher/utils';

export const getFormNotFoundMessage = (formId: FormIdentifier) => {
  const rawId = asFormRawId(formId);
  if (rawId) return `Form with id='${rawId}' not found`;

  const fullName = asFormFullName(formId);
  if (fullName) return `Form '${getFormFullName(fullName.module, fullName.name)}' not found`;

  return 'Form not found';
};

export const getReferenceListNotFoundMessage = (refListId: IReferenceListIdentifier) => {
  if (refListId) return `Reference list '${getReferenceListFullName(refListId)}' not found`;

  return 'Reference list not found';
};
