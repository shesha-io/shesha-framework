import {
  ILayerGroupConfiguratorStateContext,
  IUpdateChildItemsPayload,
  IUpdateItemSettingsPayload,
  LAYER_GROUP_CONTEXT_INITIAL_STATE,
} from './contexts';
import { LayerGroupActionEnums } from './actions';
import { ILayerFormModel, ILayerGroup } from './models';
import { handleActions } from 'redux-actions';
import { getItemPositionById } from './utils';
import { nanoid } from 'nanoid/non-secure';

const LayerGroupReducer = handleActions<ILayerGroupConfiguratorStateContext, any>(
  {
    [LayerGroupActionEnums.AddLayer]: (state: ILayerGroupConfiguratorStateContext) => {
      const LayersCount = state.items.length;
      const LayerProps: ILayerFormModel = {
        id: nanoid(),
        sortOrder: state.items.length,
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
      action: ReduxActions.Action<string>,
    ) => {
      const { payload } = action;

      const newItems = state.items.filter((item) => item.id !== payload);

      return {
        ...state,
        items: [...newItems],
        selectedItemId: state.selectedItemId === payload ? null : state.selectedItemId,
      };
    },

    [LayerGroupActionEnums.SelectItem]: (
      state: ILayerGroupConfiguratorStateContext,
      action: ReduxActions.Action<string>,
    ) => {
      const { payload } = action;

      return {
        ...state,
        selectedItemId: payload,
      };
    },

    [LayerGroupActionEnums.UpdateItem]: (
      state: ILayerGroupConfiguratorStateContext,
      action: ReduxActions.Action<IUpdateItemSettingsPayload>,
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
      action: ReduxActions.Action<IUpdateChildItemsPayload>,
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

      // search for a parent item
      const lastArr = blockIndex.reduce((arr, i) => (arr[i] as ILayerGroup).childItems, newItems);

      // and set a list of childs
      (lastArr[lastIndex] as ILayerGroup).childItems = childIds;

      return {
        ...state,
        items: newItems,
      };
    },
    [LayerGroupActionEnums.setRefreshTrigger]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },

  LAYER_GROUP_CONTEXT_INITIAL_STATE,
);

export default LayerGroupReducer;
