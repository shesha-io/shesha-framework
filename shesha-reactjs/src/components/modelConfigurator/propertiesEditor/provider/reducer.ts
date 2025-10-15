import { getItemPositionById } from './utils';
import { handleActions } from 'redux-actions';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { MetadataSourceType } from '@/interfaces/metadata';
import { ModelActionEnums } from './actions';
import {
  IAddItemPayload,
  IPropertiesEditorStateContext,
  IUpdateChildItemsPayload,
  IUpdateItemSettingsPayload,
  PROPERTIES_EDITOR_CONTEXT_INITIAL_STATE,
} from './contexts';
import { DataTypes } from '@/index';
import { nanoid } from '@/utils/uuid';
import { ArrayFormats, ObjectFormats } from '@/interfaces/dataTypes';

const findItemById = (items: IModelItem[], id: string): IModelItem => {
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

const modelReducer = handleActions<IPropertiesEditorStateContext, any>(
  {
    [ModelActionEnums.AddItem]: (
      state: IPropertiesEditorStateContext,
      action: ReduxActions.Action<IAddItemPayload | null>,
    ) => {
      const { payload } = action;

      const itemProps: IModelItem = {
        name: `NewProperty`,
        label: `New Property`,
        id: payload.item?.id ?? '00000000-0000-0000-0000-000000000000', // Guid.Empty
        source: MetadataSourceType.UserDefined,
        dataType: 'string',
      };

      const newItems = [...state.items];

      const parent = Boolean(payload.parentId)
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
    },

    [ModelActionEnums.DeleteItem]: (
      state: IPropertiesEditorStateContext,
      action: ReduxActions.Action<string>,
    ) => {
      const { payload } = action;

      const items = removeIdDeep([...state.items], payload);

      return {
        ...state,
        items,
        selectedItemId: state.selectedItemId === payload ? null : state.selectedItemId,
      };
    },

    [ModelActionEnums.SelectItem]: (
      state: IPropertiesEditorStateContext,
      action: ReduxActions.Action<string>,
    ) => {
      const { payload } = action;

      return {
        ...state,
        selectedItemId: payload,
      };
    },

    [ModelActionEnums.UpdateItem]: (
      state: IPropertiesEditorStateContext,
      action: ReduxActions.Action<IUpdateItemSettingsPayload>,
    ) => {
      const { payload } = action;

      const newItems = [...state.items];

      const position = getItemPositionById(newItems, payload.id);
      if (!position) return state;

      const newArray = position.ownerArray;
      const prevItem = { ...newArray[position.index] };
      const prevItemsTypeIndex = prevItem.properties?.findIndex((p) => p.isItemsType);
      const prevItemsType = prevItemsTypeIndex !== undefined ? { ...prevItem.properties[prevItemsTypeIndex] } : null;
      const newItem = { ...prevItem, ...payload.settings };


      const itemsTypeIndex = newItem.properties?.findIndex((p) => p.isItemsType);
      let itemsType: IModelItem = itemsTypeIndex !== undefined ? { ...newItem.properties[itemsTypeIndex] } : null;

      if (newItem.dataType !== prevItem.dataType) {
        newItem.dataFormat = undefined;
      }

      if (newItem.dataType === DataTypes.array) {
        if (!itemsType) {
          // create itemsType
          itemsType =
            newItem.properties?.find((p) => p.isItemsType) ??
            {
              name: newItem.name,
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
          itemsType = { ...itemsType, ...payload.settings.itemsType, name: newItem.name, entityType: newItem.entityType };

          if (payload.settings.dataFormat !== prevItem.dataFormat) {
            switch (payload.settings.dataFormat) {
              case ArrayFormats.simple:
                itemsType.dataType = undefined;
                itemsType.dataFormat = undefined;
                break;
              case ArrayFormats.childObjects:
                itemsType.dataType = DataTypes.object;
                itemsType.dataFormat = ObjectFormats.object;
                break;
              case ArrayFormats.entityReference:
                itemsType.dataType = DataTypes.entityReference;
                itemsType.dataFormat = undefined;
                itemsType.entityType = newItem.entityType;
                break;
              case ArrayFormats.manyToManyEntities:
                itemsType.dataType = DataTypes.entityReference;
                itemsType.dataFormat = undefined;
                itemsType.entityType = newItem.entityType;
                break;
              case ArrayFormats.multivalueReferenceList:
                itemsType.dataType = DataTypes.referenceListItem;
                itemsType.dataFormat = undefined;
                break;
            }
          }

          if (prevItemsType.dataType !== itemsType.dataType) {
            itemsType.dataFormat = undefined;
          }

          newItem.itemsType = itemsType;
          newItem.properties[itemsTypeIndex] = itemsType;
        }
      }

      newArray[position.index] = newItem;

      return {
        ...state,
        items: newItems,
      };
    },

    [ModelActionEnums.UpdateChildItems]: (
      state: IPropertiesEditorStateContext,
      action: ReduxActions.Action<IUpdateChildItemsPayload>,
    ) => {
      const {
        payload: { index, childs: childIds },
      } = action;
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

      // search for a parent item
      const lastArr = blockIndex.reduce((arr, i) => (

        // arr[i]['properties']

        // ToDo: AS - remove aftrer implementation

        arr[i].dataType === DataTypes.array && arr[i].dataFormat === DataTypes.object && arr[i].properties[0]
          // for objects array we need to set a list of properties for the internal itemsType
          ? arr[i].properties[0].properties
          : arr[i]['properties']
      ), newItems);

      // get changed Item
      const item = lastArr[lastIndex];

      // and set a list of childs
      // lastArr[lastIndex]['properties'] = childIds;

      // ToDo: AS - remove aftrer implementation
      if (item.dataType === DataTypes.array && item.dataFormat === DataTypes.object) {
        // for objects array we need to set a list of properties for the internal itemsType
        item.properties[0].properties = childIds;
      } else {
        lastArr[lastIndex]['properties'] = childIds;
      }

      return {
        ...state,
        items: newItems,
      };
    },
  },

  PROPERTIES_EDITOR_CONTEXT_INITIAL_STATE,
);

export default modelReducer;
