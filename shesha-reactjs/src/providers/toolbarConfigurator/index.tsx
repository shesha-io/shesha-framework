import React, { FC, useReducer, useContext, PropsWithChildren } from 'react';
import toolbarReducer from './reducer';
import {
  IUpdateChildItemsPayload,
  IUpdateItemSettingsPayload,
  ToolbarConfiguratorActionsContext,
  ToolbarConfiguratorStateContext,
  TOOLBAR_CONTEXT_INITIAL_STATE,
} from './contexts';
import {
  addButtonAction,
  deleteButtonAction,
  addGroupAction,
  deleteGroupAction,
  selectItemAction,
  updateChildItemsAction,
  updateItemAction,
  /* NEW_ACTION_IMPORT_GOES_HERE */
} from './actions';
import { ToolbarItemProps } from './models';
import { getItemById } from './utils';

export interface IToolbarConfiguratorProviderPropsBase {
  baseUrl?: string;
}

export interface IToolbarConfiguratorProviderProps {
  items: ToolbarItemProps[];
  value?: any;
  onChange?: (value: any) => void;
  readOnly: boolean;
}

const ToolbarConfiguratorProvider: FC<PropsWithChildren<IToolbarConfiguratorProviderProps>> = props => {
  const {
    children,
  } = props;

  const [state, dispatch] = useReducer(toolbarReducer, {
    ...TOOLBAR_CONTEXT_INITIAL_STATE,
    items: props.items,
    readOnly: props.readOnly,
  });

  const addButton = () => {
    if (!state.readOnly)
      dispatch(addButtonAction());
  };

  const deleteButton = (uid: string) => {
    if (!state.readOnly)
      dispatch(deleteButtonAction(uid));
  };

  const addGroup = () => {
    if (!state.readOnly)
      dispatch(addGroupAction());
  };

  const deleteGroup = (uid: string) => {
    if (!state.readOnly)
      dispatch(deleteGroupAction(uid));
  };

  const selectItem = (uid: string) => {
    dispatch(selectItemAction(uid));
  };

  const updateChildItems = (payload: IUpdateChildItemsPayload) => {
    if (!state.readOnly)
      dispatch(updateChildItemsAction(payload));
  };

  const getItem = (uid: string): ToolbarItemProps => {
    return getItemById(state.items, uid);
  };

  const updateItem = (payload: IUpdateItemSettingsPayload) => {
    if (!state.readOnly)
      dispatch(updateItemAction(payload));
  };

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  return (
    <ToolbarConfiguratorStateContext.Provider value={state}>
      <ToolbarConfiguratorActionsContext.Provider
        value={{
          addButton,
          deleteButton,
          addGroup,
          deleteGroup,
          selectItem,
          updateChildItems,
          getItem,
          updateItem,
          /* NEW_ACTION_GOES_HERE */
        }}
      >
        {children}
      </ToolbarConfiguratorActionsContext.Provider>
    </ToolbarConfiguratorStateContext.Provider>
  );
};

function useToolbarConfiguratorState() {
  const context = useContext(ToolbarConfiguratorStateContext);

  if (context === undefined) {
    throw new Error('useToolbarConfiguratorState must be used within a ToolbarConfiguratorProvider');
  }

  return context;
}

function useToolbarConfiguratorActions() {
  const context = useContext(ToolbarConfiguratorActionsContext);

  if (context === undefined) {
    throw new Error('useToolbarConfiguratorActions must be used within a ToolbarConfiguratorProvider');
  }

  return context;
}

function useToolbarConfigurator() {
  return { ...useToolbarConfiguratorState(), ...useToolbarConfiguratorActions() };
}

export { ToolbarConfiguratorProvider, useToolbarConfigurator };
