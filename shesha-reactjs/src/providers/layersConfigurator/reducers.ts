import {
    ILayerGroupConfiguratorStateContext,
    IUpdateItemSettingsPayload,
    LAYER_GROUP_CONTEXT_INITIAL_STATE,
} from './contexts';
import { LayerGroupActionEnums } from './actions';
import { ILayerFormModel } from './models';
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

        [LayerGroupActionEnums.SelectItem]: (
            state: ILayerGroupConfiguratorStateContext,
            action: ReduxActions.Action<string>
        ) => {
            const { payload } = action;

            return {
                ...state,
                selectedItemId: payload,
            };
        },

        [LayerGroupActionEnums.UpdateItem]: (
            state: ILayerGroupConfiguratorStateContext,
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
    },

    LAYER_GROUP_CONTEXT_INITIAL_STATE
);

export default LayerGroupReducer;
