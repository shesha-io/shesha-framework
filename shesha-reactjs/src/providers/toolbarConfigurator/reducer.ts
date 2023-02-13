import {
  IToolbarConfiguratorStateContext,
  IUpdateChildItemsPayload,
  IUpdateItemSettingsPayload,
  TOOLBAR_CONTEXT_INITIAL_STATE,
} from './contexts';
import { ToolbarActionEnums } from './actions';
import { IToolbarButton, IButtonGroup } from './models';
import { handleActions } from 'redux-actions';
import { getItemById, getItemPositionById } from './utils';
import { nanoid } from 'nanoid/non-secure';

const toolbarReducer = handleActions<IToolbarConfiguratorStateContext, any>(
  {
    [ToolbarActionEnums.AddButton]: (state: IToolbarConfiguratorStateContext) => {
      const buttonsCount = state.items.filter(i => i.itemType === 'item').length;
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

      const newItems = state.items.filter(item => item.id !== payload);

      return {
        ...state,
        items: [...newItems],
        selectedItemId: state.selectedItemId === payload ? null : state.selectedItemId,
      };
    },

    [ToolbarActionEnums.AddGroup]: (state: IToolbarConfiguratorStateContext) => {
      const groupsCount = state.items.filter(i => i.itemType === 'group').length;
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

      const newItems = state.items.filter(item => item.id !== payload);

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
        payload: { id, childs: childIds },
      } = action;

      if (id) {
        const newItems = [...state.items];
        const position = getItemPositionById(newItems, id);
        const group = position.ownerArray[position.index];
        position.ownerArray[position.index] = { ...group, childItems: childIds };

        return {
          ...state,
          items: newItems,
        };
      } else {
        return {
          ...state,
          items: [...childIds],
        };
      }
    },
  },

  TOOLBAR_CONTEXT_INITIAL_STATE
);

export default toolbarReducer;
