import { nanoid } from 'nanoid/non-secure';
import { handleActions } from 'redux-actions';
import { ToolbarActionEnums } from './actions';
import {
  IToolbarConfiguratorStateContext,
  IUpdateChildItemsPayload,
  IUpdateItemSettingsPayload,
  TOOLBAR_CONTEXT_INITIAL_STATE,
} from './contexts';
import { IButtonGroup, IToolbarButton } from './models';
import { getItemById, getItemPositionById } from './utils';

const toolbarReducer = handleActions<IToolbarConfiguratorStateContext, any>(
  {
    [ToolbarActionEnums.AddButton]: (state: IToolbarConfiguratorStateContext) => {
      const buttonsCount = state.items.filter((i) => i.itemType === 'item').length;
      const buttonProps: IToolbarButton = {
        id: nanoid(),
        itemType: 'item',
        sortOrder: state.items.length,
        name: `Button${buttonsCount + 1}`,
        label: `Button ${buttonsCount + 1}`,
        itemSubType: 'button',
        buttonType: 'link',
      };

      const newItems = [...state.items];
      const parent = state.selectedItemId ? (getItemById(newItems, state.selectedItemId) as IButtonGroup) : null;
      if (parent && parent.itemType === 'group') {
        parent.childItems = [...parent.childItems, buttonProps];
      } else newItems.push(buttonProps);

      return {
        ...state,
        items: newItems,
        selectedItemId: buttonProps.id,
      };
    },

    [ToolbarActionEnums.DeleteButton]: (
      state: IToolbarConfiguratorStateContext,
      action: ReduxActions.Action<string>
    ) => {
      const { payload } = action;

      const newItems = state.items.filter((item) => item.id !== payload);

      return {
        ...state,
        items: [...newItems],
        selectedItemId: state.selectedItemId === payload ? null : state.selectedItemId,
      };
    },

    [ToolbarActionEnums.AddGroup]: (state: IToolbarConfiguratorStateContext) => {
      const groupsCount = state.items.filter((i) => i.itemType === 'group').length;
      const groupProps: IButtonGroup = {
        id: nanoid(),
        itemType: 'group',
        sortOrder: state.items.length,
        name: `Group${groupsCount + 1}`,
        label: `Group ${groupsCount + 1}`,
        childItems: [],
      };
      return {
        ...state,
        items: [...state.items, groupProps],
        selectedItemId: groupProps.id,
      };
    },

    [ToolbarActionEnums.DeleteGroup]: (
      state: IToolbarConfiguratorStateContext,
      action: ReduxActions.Action<string>
    ) => {
      const { payload } = action;

      const newItems = state.items.filter((item) => item.id !== payload);

      return {
        ...state,
        items: [...newItems],
        selectedItemId: state.selectedItemId === payload ? null : state.selectedItemId,
      };
    },

    [ToolbarActionEnums.SelectItem]: (state: IToolbarConfiguratorStateContext, action: ReduxActions.Action<string>) => {
      const { payload } = action;

      return {
        ...state,
        selectedItemId: payload,
      };
    },

    [ToolbarActionEnums.UpdateItem]: (
      state: IToolbarConfiguratorStateContext,
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

    [ToolbarActionEnums.UpdateChildItems]: (
      state: IToolbarConfiguratorStateContext,
      action: ReduxActions.Action<IUpdateChildItemsPayload>
    ) => {
      const {
        payload: { index, children },
      } = action;
      if (!Boolean(index) || index.length === 0) {
        return {
          ...state,
          items: children,
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
      lastArr[lastIndex]['childItems'] = children;

      return {
        ...state,
        items: newItems,
      };
    },
  },

  TOOLBAR_CONTEXT_INITIAL_STATE
);

export default toolbarReducer;
