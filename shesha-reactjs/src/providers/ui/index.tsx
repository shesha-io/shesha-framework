import React, { FC, PropsWithChildren, useContext, useReducer } from 'react';
import { getFlagSetters } from '../utils/flagsSetters';
import {
  setControlsSizeAction,
  toggleModalInvisibleAction,
  togglePersonPickerVisibleAction,
  toggleRoleAppointmentVisibleAction,
} from './actions';
import { ControlSize, IUiStateContext, UI_CONTEXT_INITIAL_STATE, UiActionsContext, UiStateContext } from './contexts';
import { uiReducer } from './reducer';

export interface UiProviderProps {
  settings?: IUiStateContext;
}

const UiProvider: FC<PropsWithChildren<UiProviderProps>> = ({ children, settings }) => {
  const [state, dispatch] = useReducer(uiReducer, settings || UI_CONTEXT_INITIAL_STATE);

  const setControlsSize = (size: ControlSize) => {
    dispatch(setControlsSizeAction(size));
  };

  const toggleModalInvisible = () => {
    dispatch(toggleModalInvisibleAction());

    getFlagSetters(dispatch).resetAllFlag();
  };

  const toggleRoleAppointmentVisible = (visible: boolean) => {
    dispatch(toggleRoleAppointmentVisibleAction(visible));
  };

  const togglePersonPickerVisible = (visible: boolean) => {
    dispatch(togglePersonPickerVisibleAction(visible));
  };

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  return (
    <UiStateContext.Provider value={state}>
      <UiActionsContext.Provider
        value={{
          ...getFlagSetters(dispatch),
          setControlsSize,
          toggleModalInvisible,
          toggleRoleAppointmentVisible,
          togglePersonPickerVisible,
          /* NEW_ACTION_GOES_HERE */
        }}
      >
        {children}
      </UiActionsContext.Provider>
    </UiStateContext.Provider>
  );
};

function useUiState() {
  const context = useContext(UiStateContext);

  if (context === undefined) {
    throw new Error('useUiState must be used within a UiProvider');
  }
  return context;
}

function useUiActions() {
  const context = useContext(UiActionsContext);

  if (context === undefined) {
    throw new Error('useUiActions must be used within a UiProvider');
  }

  return context;
}

function useUi() {
  return { ...useUiState(), ...useUiActions() };
}

export { UiProvider, useUi, useUiActions, useUiState };
