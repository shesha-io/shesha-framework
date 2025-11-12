import {
  ILayerGroupConfiguratorStateContext,
  IUpdateChildItemsPayload,
  IUpdateItemSettingsPayload,
  LAYER_GROUP_CONTEXT_INITIAL_STATE,
} from './contexts';
import { LayerGroupActionEnums } from './actions';
import { ILayerFormModel } from './models';
import { handleActions, Action } from 'redux-actions';
import { deleteItemAtPath, updateChildItemsAtPath, updateItemAtPath } from './utils';
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

      // Use immutable deletion that handles nested items
      const newItems = deleteItemAtPath(state.items, payload);

      return {
        ...state,
        items: newItems,
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

      // Use immutable update that clones the entire path to the target item
      const newItems = updateItemAtPath(state.items, payload.id, (item) => ({
        ...item,
        ...payload.settings,
      }));

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

      // Use immutable update that clones the entire path to the parent
      const newItems = updateChildItemsAtPath(state.items, index, childIds);

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
