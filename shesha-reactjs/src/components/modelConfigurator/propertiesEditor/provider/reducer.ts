import {
  IAddItemPayload,
  IPropertiesEditorStateContext,
  IUpdateChildItemsPayload,
  IUpdateItemSettingsPayload,
  PROPERTIES_EDITOR_CONTEXT_INITIAL_STATE,
} from './contexts';
import { ModelActionEnums } from './actions';
import { handleActions } from 'redux-actions';
import { getItemPositionById } from './utils';
import { IModelItem } from '../../../../interfaces/modelConfigurator';
import { ModelPropertyDto } from '../../../../apis/modelConfigurations';
import { nanoid } from 'nanoid';

const mapPropertyToModelItem = (property: ModelPropertyDto): IModelItem => {
  const result = {
    id: property.id,
    name: property.name,
    label: property.label,
    description: property.description,
    dataType: property.dataType,
    dataFormat: property.dataFormat,
    entityType: property.entityType,
    referenceListName: property.referenceListName,
    referenceListModule: property.referenceListModule,
    source: property.source,
    suppress: property.suppress,
    properties: property.properties.map<IModelItem>(p => mapPropertyToModelItem(p)),
  }

  return result;
}

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
}

const modelReducer = handleActions<IPropertiesEditorStateContext, any>(
  {
    [ModelActionEnums.AddItem]: (
      state: IPropertiesEditorStateContext,
      action: ReduxActions.Action<IAddItemPayload | null>
    ) => {
      const { payload } = action

      const itemProps: IModelItem = {
        name: `New property`,
        id: nanoid(),
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
      action: ReduxActions.Action<string>
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
      action: ReduxActions.Action<string>
    ) => {
      const { payload } = action;

      return {
        ...state,
        selectedItemId: payload,
      };
    },

    [ModelActionEnums.UpdateItem]: (
      state: IPropertiesEditorStateContext,
      action: ReduxActions.Action<IUpdateItemSettingsPayload>
    ) => {
      const { payload } = action;

      const newItems = [...state.items];

      const position = getItemPositionById(newItems, payload.id);

      if (!position) return state;

      const newArray = position.ownerArray;

      newArray[position.index] = {
        ...newArray[position.index],
        ...payload.settings,
      };

      return {
        ...state,
        items: newItems,
      };
    },

    [ModelActionEnums.UpdateChildItems]: (
      state: IPropertiesEditorStateContext,
      action: ReduxActions.Action<IUpdateChildItemsPayload>
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
      const lastArr = blockIndex.reduce((arr, i) => arr[i]['properties'], newItems);

      // and set a list of childs
      lastArr[lastIndex]['properties'] = childIds;

      return {
        ...state,
        items: newItems,
      };
    },
  },

  PROPERTIES_EDITOR_CONTEXT_INITIAL_STATE
);

export default modelReducer;

function removeIdDeep(list: IModelItem[], idToRemove: string) {
  const filtered = list.filter(entry => entry.id !== idToRemove);
  return filtered.map(entry => {
    if (!entry.properties) return entry;
    return { ...entry, properties: removeIdDeep(entry.properties, idToRemove) };
  });
}
