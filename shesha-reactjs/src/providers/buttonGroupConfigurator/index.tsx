import React, { FC, PropsWithChildren, useContext, useReducer } from 'react';
import {
  addButtonAction,
  addGroupAction,
  deleteButtonAction,
  deleteGroupAction,
  selectItemAction,
  updateChildItemsAction,
  updateItemAction,
} from './actions';
import {
  BUTTON_GROUP_CONTEXT_INITIAL_STATE,
  ButtonGroupConfiguratorActionsContext,
  ButtonGroupConfiguratorStateContext,
  IUpdateChildItemsPayload,
  IUpdateItemSettingsPayload,
} from './contexts';
import { ButtonGroupItemProps } from './models';
import buttonGroupReducer from './reducer';
import { getItemById } from './utils';

export interface IButtonGroupConfiguratorProviderPropsBase {
  baseUrl?: string;
}

export interface IButtonGroupConfiguratorProviderProps {
  items: ButtonGroupItemProps[];
  value?: any;
  onChange?: (value: any) => void;
  readOnly: boolean;
}

const ButtonGroupConfiguratorProvider: FC<PropsWithChildren<IButtonGroupConfiguratorProviderProps>> = (props) => {
  const { children, readOnly } = props;

  const [state, dispatch] = useReducer(buttonGroupReducer, {
    ...BUTTON_GROUP_CONTEXT_INITIAL_STATE,
    items: props.items,
    readOnly: readOnly,
  });

  const addButton = () => {
    if (!state.readOnly) dispatch(addButtonAction());
  };

  const deleteButton = (uid: string) => {
    if (!state.readOnly) dispatch(deleteButtonAction(uid));
  };

  const addGroup = () => {
    if (!state.readOnly) dispatch(addGroupAction());
  };

  const deleteGroup = (uid: string) => {
    if (!state.readOnly) dispatch(deleteGroupAction(uid));
  };

  const selectItem = (uid: string) => {
    dispatch(selectItemAction(uid));
  };

  const updateChildItems = (payload: IUpdateChildItemsPayload) => {
    if (!state.readOnly) dispatch(updateChildItemsAction(payload));
  };

  const getItem = (uid: string): ButtonGroupItemProps => {
    return getItemById(state.items, uid);
  };

  const updateItem = (payload: IUpdateItemSettingsPayload) => {
    if (!state.readOnly) dispatch(updateItemAction(payload));
  };

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  return (
    <ButtonGroupConfiguratorStateContext.Provider value={state}>
      <ButtonGroupConfiguratorActionsContext.Provider
        value={{
          addButton,
          deleteButton,
          addGroup,
          deleteGroup,
          selectItem,
          updateChildItems,
          getItem,
          updateItem,
          //getChildItems,
          /* NEW_ACTION_GOES_HERE */
        }}
      >
        {children}
      </ButtonGroupConfiguratorActionsContext.Provider>
    </ButtonGroupConfiguratorStateContext.Provider>
  );
};

function useButtonGroupConfiguratorState() {
  const context = useContext(ButtonGroupConfiguratorStateContext);

  if (context === undefined) {
    throw new Error('useButtonGroupConfiguratorState must be used within a ButtonGroupConfiguratorProvider');
  }

  return context;
}

function useButtonGroupConfiguratorActions() {
  const context = useContext(ButtonGroupConfiguratorActionsContext);

  if (context === undefined) {
    throw new Error('useButtonGroupConfiguratorActions must be used within a ButtonGroupConfiguratorProvider');
  }

  return context;
}

function useButtonGroupConfigurator() {
  return { ...useButtonGroupConfiguratorState(), ...useButtonGroupConfiguratorActions() };
}

export { ButtonGroupConfiguratorProvider, useButtonGroupConfigurator };
