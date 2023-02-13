import {
  ITableViewSelectorConfiguratorStateContext,
  IUpdateChildItemsPayload,
  IUpdateItemSettingsPayload,
  TOOLBAR_CONTEXT_INITIAL_STATE as TABLE_VIEWS_SELECTOR_CONTEXT_INITIAL_STATE,
} from './contexts';
import { TableViewSelectorActionEnums } from './actions';
import { ITableViewProps } from './models';
import { handleActions } from 'redux-actions';
import { getItemPositionById } from './utils';
import { nanoid } from 'nanoid/non-secure';

const toolbarReducer = handleActions<ITableViewSelectorConfiguratorStateContext, any>(
  {
    [TableViewSelectorActionEnums.AddItem]: (state: ITableViewSelectorConfiguratorStateContext) => {
      const itemProps: ITableViewProps = {
        id: nanoid(),
        sortOrder: state.items.length,
        name: `Filter ${state.items.length + 1}`,
        filterType: 'queryBuilder',
      };

      const newItems = [...state.items, itemProps];

      return {
        ...state,
        items: newItems,
        selectedItemId: itemProps.id,
      };
    },

    [TableViewSelectorActionEnums.DeleteItem]: (
      state: ITableViewSelectorConfiguratorStateContext,
      action: ReduxActions.Action<string>
    ) => {
      const { payload } = action;

      const newItems = state.items.filter(item => item.id !== payload);

      return {
        ...state,
        items: [...newItems],
        selectedItemId: state.selectedItemId === payload ? null : state.selectedItemId,
      };
    },

    [TableViewSelectorActionEnums.SelectFilter]: (
      state: ITableViewSelectorConfiguratorStateContext,
      action: ReduxActions.Action<string>
    ) => {
      const { payload } = action;

      return {
        ...state,
        selectedItemId: payload,
      };
    },

    [TableViewSelectorActionEnums.UpdateItem]: (
      state: ITableViewSelectorConfiguratorStateContext,
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

    [TableViewSelectorActionEnums.UpdateChildItems]: (
      state: ITableViewSelectorConfiguratorStateContext,
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
      const lastArr = blockIndex.reduce((arr, i) => arr[i]['childItems'], newItems);

      // and set a list of childs
      lastArr[lastIndex]['childItems'] = childIds;

      return {
        ...state,
        items: newItems,
      };
    },
  },

  TABLE_VIEWS_SELECTOR_CONTEXT_INITIAL_STATE
);

export default toolbarReducer;
