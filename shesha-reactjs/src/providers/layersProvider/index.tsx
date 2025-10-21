import React, { FC, useReducer, useContext, PropsWithChildren } from 'react';
import LayerGroupReducer from './reducers';
import {
  IUpdateItemSettingsPayload,
  LayerGroupConfiguratorActionsContext,
  LayerGroupConfiguratorStateContext,
  LAYER_GROUP_CONTEXT_INITIAL_STATE,
  IUpdateChildItemsPayload,
} from './contexts';
import {
  addLayerAction,
  deleteLayerAction,
  selectItemAction,
  setRefreshTriggerAction,
  updateChildItemsAction,
  updateItemAction,
} from './actions';
import { LayerGroupItemProps } from './models';
import { getItemById } from './utils';

export interface ILayerGroupConfiguratorProviderPropsBase {
  baseUrl?: string;
}

export interface ILayerGroupConfiguratorProviderProps {
  items?: LayerGroupItemProps[];
  value?: any;
  onChange?: (value: any) => void;
  readOnly?: boolean;
}

const LayerGroupConfiguratorProvider: FC<PropsWithChildren<ILayerGroupConfiguratorProviderProps>> = (props) => {
  const { children, readOnly } = props;

  const [state, dispatch] = useReducer(LayerGroupReducer, {
    ...LAYER_GROUP_CONTEXT_INITIAL_STATE,
    items: props.items,
    readOnly: readOnly,
  });

  const addLayer = () => {
    if (!state.readOnly) dispatch(addLayerAction());
  };

  const deleteLayer = (uid: string) => {
    if (!state.readOnly) dispatch(deleteLayerAction(uid));
  };
  const selectItem = (uid: string) => {
    dispatch(selectItemAction(uid));
  };

  const updateItem = (payload: IUpdateItemSettingsPayload) => {
    if (!state.readOnly) dispatch(updateItemAction(payload));
  };

  const getItem = (uid: string): LayerGroupItemProps | null => {
    return getItemById(state.items, uid);
  };

  const updateChildItems = (payload: IUpdateChildItemsPayload) => {
    if (!state.readOnly) dispatch(updateChildItemsAction(payload));
  };

  const setRefreshTrigger = (payload: number | ((prev: number) => number)) => {
    if (typeof payload === 'function') {
      dispatch(setRefreshTriggerAction(payload(state.refreshTrigger)));
    } else {
      dispatch(setRefreshTriggerAction(payload));
    }
  };

  return (
    <LayerGroupConfiguratorStateContext.Provider value={state}>
      <LayerGroupConfiguratorActionsContext.Provider
        value={{
          addLayer,
          deleteLayer,
          selectItem,
          updateItem,
          getItem,
          updateChildItems,
          setRefreshTrigger,
        }}
      >
        {children}
      </LayerGroupConfiguratorActionsContext.Provider>
    </LayerGroupConfiguratorStateContext.Provider>
  );
};

function useLayerGroupConfiguratorState() {
  const context = useContext(LayerGroupConfiguratorStateContext);

  if (context === undefined) {
    throw new Error('useLayerGroupConfiguratorState must be used within a LayerGroupConfiguratorProvider');
  }

  return context;
}

function useLayerGroupConfiguratorActions() {
  const context = useContext(LayerGroupConfiguratorActionsContext);

  if (context === undefined) {
    throw new Error('useLayerGroupConfiguratorActions must be used within a LayerGroupConfiguratorProvider');
  }

  return context;
}

function useLayerGroupConfigurator() {
  return { ...useLayerGroupConfiguratorState(), ...useLayerGroupConfiguratorActions() };
}

export { LayerGroupConfiguratorProvider, useLayerGroupConfigurator };
