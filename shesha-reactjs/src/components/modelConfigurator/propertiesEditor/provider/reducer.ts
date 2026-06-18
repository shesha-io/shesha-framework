import { getItemPositionById } from './utils';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { MetadataSourceType } from '@/interfaces/metadata';
import { addItemAction,
  deleteItemAction,
  selectItemAction,
  updateChildItemsAction,
  updateItemAction,
} from './actions';
import {
  PROPERTIES_EDITOR_CONTEXT_INITIAL_STATE,
} from './contexts';
import { nanoid } from '@/utils/uuid';
import { ArrayFormats, DataTypes } from '@/interfaces/dataTypes';
import { EntityInitFlags } from '@/apis/modelConfigurations';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { isNonEmptyArray } from '@/utils/array';
import { createReducer } from '@reduxjs/toolkit';

const findItemById = (items: IModelItem[], id: string): IModelItem | null => {
  for (const item of items) {
    if (item.id === id)
      return item;
    if (item.properties && item.properties.length > 0) {
      const nested = findItemById(item.properties, id);
      if (nested)
        return nested;
    }
  }

  return null;
};

function removeIdDeep(list: IModelItem[], idToRemove: string): IModelItem[] {
  const filtered = list.filter((entry) => entry.id !== idToRemove);
  return filtered.map((entry) => {
    if (!entry.properties) return entry;
    return { ...entry, properties: removeIdDeep(entry.properties, idToRemove) };
  });
}

export const modelReducer = createReducer(PROPERTIES_EDITOR_CONTEXT_INITIAL_STATE, (builder) => {
  builder
    .addCase(addItemAction, (state, { payload }) => {
      const itemProps: IModelItem = {
        name: `NewProperty`,
        label: `New Property`,
        id: payload.item.id,
        source: MetadataSourceType.UserDefined,
        dataType: 'string',
        initStatus: EntityInitFlags.InitializationRequired,
      };

      const newItems = [...state.items];

      const parent = !isNullOrWhiteSpace(payload.parentId)
        ? findItemById(newItems, payload.parentId)
        : null;

      if (parent) {
        parent.properties = [...(parent.properties ?? []), itemProps];
      } else newItems.push(itemProps);

      return {
        ...state,
        items: newItems,
        selectedItemId: itemProps.id,
      };
    })
    .addCase(deleteItemAction, (state, { payload }) => {
      const items = removeIdDeep([...state.items], payload);

      return {
        ...state,
        items,
        selectedItemId: state.selectedItemId === payload ? undefined : state.selectedItemId,
      };
    })
    .addCase(selectItemAction, (state, { payload }) => {
      return {
        ...state,
        selectedItemId: payload,
      };
    })
    .addCase(updateChildItemsAction, (state, { payload }) => {
      const { index, childs: childIds } = payload;
      if (!Boolean(index) || index.length === 0) {
        return {
          ...state,
          items: childIds,
        };
      }
      // copy all items
      const newItems = [...state.items];
      // blockIndex - full index of the current container
      const blockIndex = [...index];
      // lastIndex - index of the current element in its' parent
      const lastIndex = blockIndex.pop();
      if (!isDefined(lastIndex))
        return state;

      // search for a parent item
      const lastArr = blockIndex.reduce((arr, i) => {
        const arrItem = arr[i];
        if (!arrItem)
          return [];

        return arrItem.dataType === DataTypes.array && arrItem.dataFormat === DataTypes.object && isNonEmptyArray(arrItem.properties)
          ? arrItem.properties[0].properties ?? []
          : arrItem.properties ?? [];
      }, newItems);

      if (lastArr.length === 0) return state;
      if (!isDefined(lastArr[lastIndex])) return state;

      // get changed Item
      const item = lastArr[lastIndex];

      // and set a list of childs
      // lastArr[lastIndex]['properties'] = childIds;

      // ToDo: AS - remove aftrer implementation
      if (item.dataType === DataTypes.array && item.dataFormat === DataTypes.object) {
        // for objects array we need to set a list of properties for the internal itemsType
        item.properties![0]!.properties = childIds;
      } else {
        lastArr[lastIndex]['properties'] = childIds;
      }

      return {
        ...state,
        items: newItems,
      };
    })
    .addCase(updateItemAction, (state, { payload }) => {
      const newItems = [...state.items];

      const position = getItemPositionById(newItems, payload.id);
      if (!position) return state;

      const newArray = position.ownerArray;
      const prevItem = { ...newArray[position.index] };
      const newItem = { ...prevItem, ...payload.settings };


      const itemsTypeIndex = newItem.properties?.findIndex((p) => p.isItemsType);
      let itemsType: IModelItem | null = isDefined(itemsTypeIndex) && isDefined(newItem.properties) && isDefined(newItem.properties[itemsTypeIndex])
        ? { ...newItem.properties[itemsTypeIndex] }
        : null;

      if (newItem.dataType !== prevItem.dataType) {
        newItem.dataFormat = null;
      }

      if (newItem.dataType === DataTypes.array) {
        if (!itemsType) {
          // create itemsType
          itemsType =
            newItem.properties?.find((p) => p.isItemsType) ??
            {
              name: newItem.name ?? null,
              label: `List items type`,
              id: nanoid(),
              source: MetadataSourceType.UserDefined,
              isItemsType: true,
              dataType: '',
            } satisfies IModelItem;
          newItem.itemsType = itemsType;
          newItem.properties = [...(newItem.properties ?? []), itemsType];
        } else {
          // update
          itemsType = { ...itemsType, ...payload.settings.itemsType, name: newItem.name ?? null, entityType: newItem.entityType ?? null };

          if (payload.settings.dataFormat !== prevItem.dataFormat) {
            switch (payload.settings.dataFormat) {
              case ArrayFormats.simple:
                itemsType.dataType = "";
                itemsType.dataFormat = null;
                break;
              case ArrayFormats.childObjects:
                itemsType.dataType = DataTypes.object;
                itemsType.dataFormat = null;
                break;
              case ArrayFormats.entityReference:
                itemsType.dataType = DataTypes.entityReference;
                itemsType.dataFormat = null;
                itemsType.entityType = newItem.entityType ?? null;
                break;
              case ArrayFormats.manyToManyEntities:
                itemsType.dataType = DataTypes.entityReference;
                itemsType.dataFormat = null;
                itemsType.entityType = newItem.entityType ?? null;
                break;
              case ArrayFormats.multivalueReferenceList:
                itemsType.dataType = DataTypes.referenceListItem;
                itemsType.dataFormat = null;
                break;
            }
          }

          newItem.itemsType = itemsType;
          if (itemsTypeIndex && newItem.properties)
            newItem.properties[itemsTypeIndex] = itemsType;
        }
      }

      newArray[position.index] = newItem;

      return {
        ...state,
        items: newItems,
      };
    })
  ;
});

export default modelReducer;
