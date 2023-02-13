import { getFormFullName } from "../../utils/form";
import { FormIdentifier } from "../form/models";
import { asFormFullName, asFormRawId } from "../form/utils";
import { IReferenceListIdentifier } from "../referenceListDispatcher/models";
import { getReferenceListFullName } from "../referenceListDispatcher/utils";

export const getClassNameFromFullName = (name: string): string => {
    const idx = name.lastIndexOf('.');
    return idx > -1
        ? name.substring(idx + 1)
        : name;
}

export const getFormNotFoundMessage = (formId: FormIdentifier) => {
    const rawId = asFormRawId(formId);
    if (rawId)
        return `Form with id='${rawId}' not found`;

    const fullName = asFormFullName(formId);
    if (fullName)
        return `Form with '${getFormFullName(fullName.module, fullName.name)}' not found`;

    return 'Form not found';
}

export const getReferenceListNotFoundMessage = (refListId: IReferenceListIdentifier) => {
    if (refListId)
        return `Reference list '${getReferenceListFullName(refListId)}' not found`;

    return 'Reference list not found';
}