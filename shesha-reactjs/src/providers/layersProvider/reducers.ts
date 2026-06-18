import {
  LAYER_GROUP_CONTEXT_INITIAL_STATE,
} from './contexts';
import { addLayerAction, deleteLayerAction, selectItemAction, setRefreshTriggerAction, updateChildItemsAction, updateItemAction } from './actions';
import { ILayerFormModel } from './models';
import { deleteItemAtPath, updateChildItemsAtPath, updateItemAtPath } from './utils';
import { nanoid } from '@/utils/uuid';
import { createReducer } from '@reduxjs/toolkit';

export const reducer = createReducer(LAYER_GROUP_CONTEXT_INITIAL_STATE, (builder) => {
  builder
    .addCase(addLayerAction, (state) => {
      const layersCount = state.items.length;
      const layerProps: ILayerFormModel = {
        id: nanoid(),
        sortOrder: state.items.length,
        orderIndex: state.items.length,
        name: `Layer${layersCount + 1}`,
        label: `Layer ${layersCount + 1}`,
        allowChangeVisibility: true,
        visible: true,
      };

      const newItems = [...state.items];

      newItems.push(layerProps);

      return {
        ...state,
        items: newItems,
        selectedItemId: layerProps.id,
      };
    })
    .addCase(deleteLayerAction, (state, { payload }) => {
      // Use immutable deletion that handles nested items
      const newItems = deleteItemAtPath(state.items, payload);

      return {
        ...state,
        items: newItems,
        selectedItemId: state.selectedItemId === payload ? undefined : state.selectedItemId,
      };
    })
    .addCase(selectItemAction, (state, { payload }) => {
      return {
        ...state,
        selectedItemId: payload,
      };
    })
    .addCase(updateItemAction, (state, { payload }) => {
      // Use immutable update that clones the entire path to the target item
      const newItems = updateItemAtPath(state.items, payload.id, (item) => ({
        ...item,
        ...payload.settings,
      }));

      return {
        ...state,
        items: newItems,
      };
    })
    .addCase(updateChildItemsAction, (state, { payload }) => {
      const { index, childs: childIds } = payload;
      // Use immutable update that clones the entire path to the parent
      const newItems = updateChildItemsAtPath(state.items, index, childIds);

      return {
        ...state,
        items: newItems,
      };
    })
    .addCase(setRefreshTriggerAction, (state, { payload }) => {
      state.refreshTrigger = payload;
    });
});
