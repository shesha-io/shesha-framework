import {
  ILayerGroupConfiguratorStateContext,
  IUpdateChildItemsPayload,
  IUpdateItemSettingsPayload,
  LAYER_GROUP_CONTEXT_INITIAL_STATE,
} from './contexts';
import { LayerGroupActionEnums } from './actions';
import { ILayerFormModel, ILayerGroup, LayerGroupItemProps } from './models';
import { handleActions, Action } from 'redux-actions';
import { getItemPositionById } from './utils';
import { nanoid } from '@/utils/uuid';

const LayerGroupReducer = handleActions<ILayerGroupConfiguratorStateContext, any>(
  {
    [LayerGroupActionEnums.AddLayer]: (state: ILayerGroupConfiguratorStateContext) => {
      const LayersCount = state.items.length;
      const LayerProps: ILayerFormModel = {
        id: nanoid(),
        sortOrder: state.items.length,
        orderIndex: state.items.length,
        name: `Layer${LayersCount + 1}`,
        label: `Layer ${LayersCount + 1}`,
        allowChangeVisibility: true,
        visible: true,
      };

      const newItems = [...state.items];

      newItems.push(LayerProps);

      return {
        ...state,
        items: newItems,
        selectedItemId: LayerProps.id,
      };
    },

    [LayerGroupActionEnums.DeleteLayer]: (
      state: ILayerGroupConfiguratorStateContext,
      action: Action<string>,
    ) => {
      const { payload } = action;

      const newItems = state.items.filter((item) => item.id !== payload);

      return {
        ...state,
        items: [...newItems],
        selectedItemId: state.selectedItemId === payload ? undefined : state.selectedItemId,
      };
    },

    [LayerGroupActionEnums.SelectItem]: (
      state: ILayerGroupConfiguratorStateContext,
      action: Action<string>,
    ) => {
      const { payload } = action;

      return {
        ...state,
        selectedItemId: payload,
      };
    },

    [LayerGroupActionEnums.UpdateItem]: (
      state: ILayerGroupConfiguratorStateContext,
      action: Action<IUpdateItemSettingsPayload>,
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

    [LayerGroupActionEnums.UpdateChildItems]: (
      state: ILayerGroupConfiguratorStateContext,
      action: Action<IUpdateChildItemsPayload>,
    ) => {
      const {
        payload: { index, childs: childIds },
      } = action;
      if (!index || index.length === 0) {
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

      // Defensive check: ensure lastIndex is defined
      if (lastIndex === undefined) {
        console.error('UpdateChildItems: lastIndex is undefined, returning original state');
        return state;
      }

      // search for a parent item with defensive checks
      let lastArr: LayerGroupItemProps[];
      try {
        lastArr = blockIndex.reduce((arr, i) => {
          // Verify the current element exists
          if (!arr[i]) {
            throw new Error(`UpdateChildItems: Element at index ${i} does not exist`);
          }
          // Verify it's an ILayerGroup with childItems
          const item = arr[i] as ILayerGroup;
          if (!item.childItems) {
            throw new Error(`UpdateChildItems: Element at index ${i} is not an ILayerGroup or has no childItems`);
          }
          return item.childItems;
        }, newItems);
      } catch (error) {
        console.error(error.message);
        return state;
      }

      // Verify the target element exists and is an ILayerGroup
      if (!lastArr[lastIndex]) {
        console.error(`UpdateChildItems: Target element at index ${lastIndex} does not exist`);
        return state;
      }

      const targetItem = lastArr[lastIndex] as ILayerGroup;
      if (!('childItems' in targetItem)) {
        console.error(`UpdateChildItems: Target element at index ${lastIndex} is not an ILayerGroup`);
        return state;
      }

      // and set a list of childs
      targetItem.childItems = childIds;

      return {
        ...state,
        items: newItems,
      };
    },
    [LayerGroupActionEnums.SetRefreshTrigger]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },

  LAYER_GROUP_CONTEXT_INITIAL_STATE,
);

export default LayerGroupReducer;
