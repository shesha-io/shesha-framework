import {
  IButtonGroupConfiguratorStateContext,
  IUpdateChildItemsPayload,
  IUpdateItemSettingsPayload,
  BUTTON_GROUP_CONTEXT_INITIAL_STATE,
} from './contexts';
import { ButtonGroupActionEnums } from './actions';
import { IButtonGroupButton, IButtonGroup } from './models';
import { handleActions } from 'redux-actions';
import { getItemById, getItemPositionById } from './utils';
import { nanoid } from 'nanoid/non-secure';

const buttonGroupReducer = handleActions<IButtonGroupConfiguratorStateContext, any>(
  {
    [ButtonGroupActionEnums.AddButton]: (state: IButtonGroupConfiguratorStateContext) => {
      const buttonsCount = state.items.filter(i => i.itemType === 'item').length;
      const buttonProps: IButtonGroupButton = {
        id: nanoid(),
        itemType: 'item',
        sortOrder: state.items.length,
        name: `button${buttonsCount + 1}`,
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

    [ButtonGroupActionEnums.DeleteButton]: (
      state: IButtonGroupConfiguratorStateContext,
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

    [ButtonGroupActionEnums.AddGroup]: (state: IButtonGroupConfiguratorStateContext) => {
      const groupsCount = state.items.filter(i => i.itemType === 'group').length;
      const groupProps: IButtonGroup = {
        id: nanoid(),
        itemType: 'group',
        sortOrder: state.items.length,
        name: `group${groupsCount + 1}`,
        label: `Group ${groupsCount + 1}`,
        childItems: [],
      };
      return {
        ...state,
        items: [...state.items, groupProps],
        selectedItemId: groupProps.id,
      };
    },

    [ButtonGroupActionEnums.DeleteGroup]: (
      state: IButtonGroupConfiguratorStateContext,
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

    [ButtonGroupActionEnums.SelectItem]: (
      state: IButtonGroupConfiguratorStateContext,
      action: ReduxActions.Action<string>
    ) => {
      const { payload } = action;

      return {
        ...state,
        selectedItemId: payload,
      };
    },

    [ButtonGroupActionEnums.UpdateItem]: (
      state: IButtonGroupConfiguratorStateContext,
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

    [ButtonGroupActionEnums.UpdateChildItems]: (
      state: IButtonGroupConfiguratorStateContext,
      action: ReduxActions.Action<IUpdateChildItemsPayload>
    ) => {
      const {
        payload: { id, children: childIds },
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

  BUTTON_GROUP_CONTEXT_INITIAL_STATE
);

export default buttonGroupReducer;
