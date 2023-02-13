import { ReferenceListItemDto } from "../apis/referenceList";
import { IReferenceListIdentifier } from "../providers/referenceListDispatcher/models";

export const CACHED_REF_LIST_ITEMS = 'CACHED_REF_LIST_ITEMS';

export interface ICachedRefList {
  name: string;
  list: ReferenceListItemDto[];
}

export interface ICachedRefListItems {
  namespace: string;
  items: ICachedRefList[];
}

// const cachedListItems: ICachedRefListItems[] = [
//   {
//     namespace: 'namespace',
//     items: [
//       {
//         name: 'string',
//         list: [
//           {
//             item: '',
//             itemValue: 0,
//           },
//         ],
//       },
//     ],
//   },
// ];

export const saveListItems = (listName: string, listNamespace: string, reflListItems: ReferenceListItemDto[]) => {
  const cachedListItems = getListItemsFromStorage();

  if (cachedListItems) {
    const cachedItemsByNamespace = getCachedItemsByNamespace(listNamespace, cachedListItems);

    if (cachedItemsByNamespace) {
      const reflListItemsByName = cachedItemsByNamespace?.items?.find(({ name }) => name === listName)?.list;

      if (reflListItemsByName) {
        return; // No need to save
      } else {
        cachedItemsByNamespace?.items?.push({
          name: listName,
          list: reflListItems,
        });

        cachedListItems?.map(value => {
          const { namespace } = value;

          if (namespace === listNamespace) {
            return cachedItemsByNamespace;
          } else {
            return value;
          }
        });

        localStorage?.setItem(CACHED_REF_LIST_ITEMS, JSON.stringify(cachedListItems));
      }
    } else {
      cachedListItems?.push({
        namespace: listNamespace,
        items: [
          {
            name: listName,
            list: reflListItems,
          },
        ],
      });

      localStorage?.setItem(CACHED_REF_LIST_ITEMS, JSON.stringify(cachedListItems));
    }
  } else {
    // Create a new list and save it in the localStorage
    const items: ICachedRefListItems[] = [
      {
        namespace: listNamespace,
        items: [{ name: listName, list: reflListItems }],
      },
    ];

    localStorage?.setItem(CACHED_REF_LIST_ITEMS, JSON.stringify(items));
  }
};

export const getCachedItems = (listName: string, listNamespace: string) => {
  const cachedListItems = getListItemsFromStorage();

  if (cachedListItems) {
    const namespacedItems = getCachedItemsByNamespace(listNamespace, cachedListItems);

    const items = namespacedItems ? namespacedItems?.items?.find(({ name }) => name === listName)?.list : [];

    return items;
  }

  return [];
};

const getCachedItemsByNamespace = (listNamespace: string, cachedListItems: ICachedRefListItems[]) =>
  cachedListItems?.find(({ namespace }) => namespace === listNamespace);

const getListItemsFromStorage = () => {
  const cachedListItems = window?.localStorage?.getItem(CACHED_REF_LIST_ITEMS);

  return cachedListItems ? (JSON.parse(cachedListItems) as ICachedRefListItems[]) : null;
};

export const getLegacyReferenceListIdentifier = (referenceListNamespace?: string, referenceListName?: string): IReferenceListIdentifier => {
  return !referenceListNamespace && !referenceListName
    ? null
    : {
      name: getNameWithNamespace(referenceListNamespace, referenceListName),
      module: undefined      
    };
}

const getNameWithNamespace = (namespace: string, name: string) => {
  return Boolean(namespace)
    ? `${namespace}.${name}`
    : name;
}