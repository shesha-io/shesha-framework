import React, { PropsWithChildren, ReactNode, useContext, useReducer } from 'react';
import { setActionFlagAction, setToolbarRightButtonAction } from './actions';
import {
  FORM_INFO_CONTENT_STATE_CONTEXT_INITIAL_STATE,
  FormInfoContentStateActionsContext,
  FormInfoContentStateStateContext,
} from './contexts';
import { IFormDesignerActionFlag } from './models';
import reducer from './reducer';

export interface IFormInfoContentStateProvider {}

function FormInfoContentProvider({ children }: PropsWithChildren<IFormInfoContentStateProvider>) {
  const [state, dispatch] = useReducer(reducer, { ...FORM_INFO_CONTENT_STATE_CONTEXT_INITIAL_STATE });

  const setActionFlag = (payload: IFormDesignerActionFlag) => {
    dispatch(setActionFlagAction(payload));
  };

  const setToolbarRightButton = (payload: ReactNode) => {
    dispatch(setToolbarRightButtonAction(payload));
  };

  return (
    <FormInfoContentStateStateContext.Provider value={state}>
      <FormInfoContentStateActionsContext.Provider
        value={{
          setActionFlag,
          setToolbarRightButton,
          /* NEW_ACTION_GOES_HERE */
        }}
      >
        {children}
      </FormInfoContentStateActionsContext.Provider>
    </FormInfoContentStateStateContext.Provider>
  );
}

function useFormInfoContentState() {
  const context = useContext(FormInfoContentStateStateContext);

  if (context === undefined) {
    throw new Error('useFormInfoContentState must be used within a FormInfoContentProvider');
  }

  return context;
}

function useFormInfoContentActions() {
  const context = useContext(FormInfoContentStateActionsContext);

  if (context === undefined) {
    throw new Error('useFormInfoContentActions must be used within a FormInfoContentProvider');
  }

  return context;
}

function useFormInfoContent() {
  return {
    ...useFormInfoContentState(),
    ...useFormInfoContentActions(),
  };
}

export default FormInfoContentProvider;

export { FormInfoContentProvider, useFormInfoContent, useFormInfoContentActions, useFormInfoContentState };
