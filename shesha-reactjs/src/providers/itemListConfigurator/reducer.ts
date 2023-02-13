import {
  IItemListConfiguratorStateContext,
  IUpdateChildItemsPayload,
  IUpdateItemSettingsPayload,
  ITEM_LIST_CONFIGURATOR_CONTEXT_INITIAL_STATE,
  IConfigurableItemBase,
  IConfigurableItemGroup,
} from './contexts';
import { ItemListConfiguratorActionEnums } from './actions';
import { handleActions } from 'redux-actions';
import { getItemById, getItemPositionById } from './utils';

const itemListConfiguratorReducer = handleActions<IItemListConfiguratorStateContext, any>(
  {
    [ItemListConfiguratorActionEnums.AddItem]: (
      state: IItemListConfiguratorStateContext,
      action: ReduxActions.Action<IConfigurableItemBase>
    ) => {
      const itemProps = action.payload;

      itemProps.itemType = 'item'; // Make sure we use the correct `itemType`

      const newItems = [...state.items];

      const parent = state?.selectedItemId
        ? (getItemById(newItems, state?.selectedItemId) as IConfigurableItemGroup)
        : null;

      if (parent && parent?.itemType === 'group') {
        parent.childItems = [...parent.childItems, itemProps];
      } else newItems[state?.insertMode === 'before' ? 'unshift' : 'push'](itemProps);

      return {
        ...state,
        items: newItems,
        selectedItemId: itemProps.id,
      };
    },

    [ItemListConfiguratorActionEnums.DeleteItem]: (
      state: IItemListConfiguratorStateContext,
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

    [ItemListConfiguratorActionEnums.SelectItem]: (
      state: IItemListConfiguratorStateContext,
      action: ReduxActions.Action<string>
    ) => {
      const { payload } = action;

      return {
        ...state,
        selectedItemId: payload,
      };
    },

    [ItemListConfiguratorActionEnums.UpdateItem]: (
      state: IItemListConfiguratorStateContext,
      action: ReduxActions.Action<IUpdateItemSettingsPayload>
    ) => {
      const { payload } = action;

      const newItems = [...state.items].map(item => ({ ...item, label: item?.title }));

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

    [ItemListConfiguratorActionEnums.UpdateChildItems]: (
      state: IItemListConfiguratorStateContext,
      action: ReduxActions.Action<IUpdateChildItemsPayload>
    ) => {
      const {
        payload: { index, children: childIds },
      } = action;

      if (!Boolean(index) || index.length === 0) {
        return {
          ...state,
          items: childIds,
        };
      }
      // copy all items
      //minor modifications to allow autocomplete of the label
      const newItems = [...state.items].map(item => ({ ...item, label: item?.title }));
      // blockIndex - full index of the current container
      const blockIndex = [...index];
      // lastIndex - index of the current element in its' parent
      const lastIndex = blockIndex.pop();

      // search for a parent item
      const lastArr = blockIndex.reduce((arr, i) => arr[i]['childItems'], newItems);

      // and set a list of childs
      lastArr[lastIndex]['childItems'] = childIds;

      return {
        ...state,
        items: newItems,
      };
    },

    [ItemListConfiguratorActionEnums.AddGroup]: (
      state: IItemListConfiguratorStateContext,
      action: ReduxActions.Action<IConfigurableItemBase>
    ) => {
      const groupProps = action.payload;
      groupProps.itemType = 'group'; // Make sure we use the correct `itemType`

      return {
        ...state,
        items: state?.insertMode === 'before' ? [groupProps, ...state.items] : [...state.items, groupProps],
        selectedItemId: groupProps.id,
      };
    },

    [ItemListConfiguratorActionEnums.DeleteGroup]: (
      state: IItemListConfiguratorStateContext,
      action: ReduxActions.Action<string>
    ) => {
      const { payload } = action;

      return {
        ...state,
        items: state.items.filter(item => item.id !== payload),
        selectedItemId: state.selectedItemId === payload ? null : state.selectedItemId,
      };
    },
  },

  ITEM_LIST_CONFIGURATOR_CONTEXT_INITIAL_STATE
);

export default itemListConfiguratorReducer;

function removeIdDeep(list: IConfigurableItemBase[], idToRemove: string, childrenKey: string = 'children') {
  const filtered = list.filter(entry => entry.id !== idToRemove);

  return filtered.map(entry => {
    if (!entry[childrenKey]) return entry;
    return { ...entry, [childrenKey]: removeIdDeep(entry[childrenKey], idToRemove, childrenKey) };
  });
}
