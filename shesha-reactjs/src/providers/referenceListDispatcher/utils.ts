import { isDefined } from "@/utils/nullables";
import { IReferenceListIdentifier } from "@/interfaces/referenceList";

export const getReferenceListFullName = (refListId: IReferenceListIdentifier): string => {
  if (!isDefined(refListId)) return null;

  return refListId.module ? `${refListId.module}/${refListId.name}` : refListId.name;
};

export const isValidRefListId = (refListId: IReferenceListIdentifier): boolean => {
  return Boolean(
    isDefined(refListId) && refListId.name, /* && refListId.module note: module can be ampty in legacy reference lists*/
  );
};
