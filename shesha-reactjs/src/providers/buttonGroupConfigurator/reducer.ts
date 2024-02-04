import { nanoid } from '@/utils/uuid';
import { handleActions } from 'redux-actions';
import { ButtonGroupActionEnums } from './actions';
import {
  BUTTON_GROUP_CONTEXT_INITIAL_STATE,
  IButtonGroupConfiguratorStateContext,
  IUpdateChildItemsPayload,
  IUpdateItemSettingsPayload,
} from './contexts';
import { IButtonGroupItem, IButtonGroup, ButtonGroupItemProps } from './models';
import { getItemById, updateBranch } from './utils';

const buttonGroupReducer = handleActions<IButtonGroupConfiguratorStateContext, any>(
  {
    [ButtonGroupActionEnums.AddButton]: (state: IButtonGroupConfiguratorStateContext) => {
      const buttonsCount = state.items.filter((i) => i.itemType === 'item').length;
      const buttonProps: IButtonGroupItem = {
        id: nanoid(),
        itemType: 'item',
        sortOrder: state.items.length,
        name: `button${buttonsCount + 1}`,
        label: `Button ${buttonsCount + 1}`,
        itemSubType: 'button',
        buttonType: 'link',
        editMode: 'inherited'
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

      const updateItems = (items: ButtonGroupItemProps[]) => {
        return items.filter((item) => {
          if (item.id === payload)
            return false;
          if (Array.isArray(item['childItems'])){
            item['childItems'] = updateItems(item['childItems']);
          }
          return true;
        });
      };

      const newItems = updateItems(state.items);

      return {
        ...state,
        items: [...newItems],
        selectedItemId: state.selectedItemId === payload ? null : state.selectedItemId,
      };
    },

    [ButtonGroupActionEnums.AddGroup]: (state: IButtonGroupConfiguratorStateContext) => {
      const groupsCount = state.items.filter((i) => i.itemType === 'group').length;
      const groupProps: IButtonGroup = {
        id: nanoid(),
        itemType: 'group',
        sortOrder: state.items.length,
        name: `group${groupsCount + 1}`,
        label: `Group ${groupsCount + 1}`,
        buttonType: 'link',
        hideWhenEmpty: true,
        childItems: [],
        editMode: 'inherited'
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

      const updateItems = (items: ButtonGroupItemProps[]) => {
        return items.filter((item) => {
          if (item.id === payload)
            return false;
          if (Array.isArray(item['childItems'])){
            item['childItems'] = updateItems(item['childItems']);
          }
          return true;
        });
      };

      const newItems = updateItems(state.items);

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

      const newItems = updateBranch(state.items, payload);

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
        payload: { id, index, children },
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
        items: updateBranch(newItems, {id, settings: {}}),
      };
    },
  },

  BUTTON_GROUP_CONTEXT_INITIAL_STATE
);

export default buttonGroupReducer;
