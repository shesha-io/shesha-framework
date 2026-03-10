import { IReferenceListIdentifier } from '@/interfaces';

const getNameWithNamespace = (namespace: string | null | undefined, name: string): string => {
  return Boolean(namespace) ? `${namespace}.${name}` : name;
};

export const getLegacyReferenceListIdentifier = (
  referenceListNamespace: string | null | undefined,
  referenceListName: string,
): IReferenceListIdentifier | null => {
  return !referenceListNamespace && !referenceListName
    ? null
    : {
      name: getNameWithNamespace(referenceListNamespace, referenceListName),
      module: null,
    };
};
