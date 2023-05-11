import { createAction } from 'redux-actions';
import { IUpdateItemSettingsPayload } from './contexts';

export enum LayerGroupActionEnums {
    AddLayer = 'ADD_LAYER',
    DeleteLayer = 'DELETE_LAYER',
    UpdateItem = 'UPDATE_ITEM',
    SelectItem = 'SELECT_ITEM',
}

export const addLayerAction = createAction(LayerGroupActionEnums.AddLayer);

export const deleteLayerAction = createAction<string, string>(LayerGroupActionEnums.DeleteLayer, p => p);

export const selectItemAction = createAction<string, string>(LayerGroupActionEnums.SelectItem, p => p);

export const updateItemAction = createAction<IUpdateItemSettingsPayload, IUpdateItemSettingsPayload>(
    LayerGroupActionEnums.UpdateItem,
    p => p
);
