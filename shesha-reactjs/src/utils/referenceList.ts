import { IReferenceListIdentifier } from '@/interfaces';

const getNameWithNamespace = (namespace: string, name: string) => {
  return Boolean(namespace) ? `${namespace}.${name}` : name;
};

export const getLegacyReferenceListIdentifier = (
  referenceListNamespace?: string,
  referenceListName?: string
): IReferenceListIdentifier => {
  return !referenceListNamespace && !referenceListName
    ? null
    : {
        name: getNameWithNamespace(referenceListNamespace, referenceListName),
        module: undefined,
      };
};
