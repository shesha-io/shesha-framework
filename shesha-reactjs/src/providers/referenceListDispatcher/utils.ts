import { IReferenceListIdentifier } from "./models";

export const getReferenceListFullName = (refListId: IReferenceListIdentifier): string => {
    if (!refListId)
        return null;

    return refListId.module
        ? `${refListId.module}/${refListId.name}`
        : refListId.name;
}

export const isValidRefListId = (refListId: IReferenceListIdentifier):boolean => {
    return Boolean(refListId && refListId.name /*&& refListId.module note: module can be ampty in legacy reference lists*/);
}