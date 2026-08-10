import { IReferenceListIdentifier } from '@/interfaces';
import { isNullOrWhiteSpace } from './nullables';

const getNameWithNamespace = (namespace: string | null | undefined, name: string): string => {
  return Boolean(namespace) ? `${namespace}.${name}` : name;
};

export const getLegacyReferenceListIdentifier = (
  referenceListNamespace: string | null | undefined,
  referenceListName: string | null | undefined,
): IReferenceListIdentifier | null => {
  return isNullOrWhiteSpace(referenceListName)
    ? null
    : {
      name: getNameWithNamespace(referenceListNamespace, referenceListName),
      module: null,
    };
};
