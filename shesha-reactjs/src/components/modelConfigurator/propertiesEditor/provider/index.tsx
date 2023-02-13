import React, { FC, useContext, PropsWithChildren, useRef } from 'react';
import modelReducer from './reducer';
import useThunkReducer from 'react-hook-thunk-reducer';
import {
  IUpdateChildItemsPayload,
  IUpdateItemSettingsPayload,
  PropertiesEditorActionsContext,
  PropertiesEditorStateContext,
  PROPERTIES_EDITOR_CONTEXT_INITIAL_STATE,
} from './contexts';
import {
  addItemAction,
  deleteItemAction,
  selectItemAction,
  updateChildItemsAction,
  updateItemAction,
  /* NEW_ACTION_IMPORT_GOES_HERE */
} from './actions';
import { getItemById } from './utils';
import { IModelItem } from '../../../../interfaces/modelConfigurator';
import { Action } from 'redux-actions';
import { nanoid } from 'nanoid/non-secure';

export interface IPropertiesEditorProviderProps {
  id?: string;
  items: IModelItem[];
  onChange?: (items: IModelItem[]) => void;
}

const PropertiesEditorProvider: FC<PropsWithChildren<IPropertiesEditorProviderProps>> = props => {
  const { children } = props;
  const selRef = useRef(null);
  const [state, dispatch] = useThunkReducer(modelReducer, {
    ...PROPERTIES_EDITOR_CONTEXT_INITIAL_STATE,
    items: props.items?.filter(x => !x.isFrameworkRelated) || [],
    onChange: props.onChange,
    selectedItemRef: selRef,
  });
  /*
  const dispatchDeferred = (action: Action<any>) => {
    return new Promise<void>((resolve) => {
      dispatch((dispatch, _getState) => {
        dispatch(action);
        resolve();
      });
    });
  }
  */
  const dispatchAndFire = (action: Action<any>) => {
    dispatch((dispatchThunk, getState) => {
      dispatchThunk(action);
      if (props.onChange) {
        const updatedItems = getState()?.items;
        props.onChange(updatedItems);
      }        
    });
  }

  const addItem = (parentId?: string) => {
    //return dispatchDeferred
    return new Promise<IModelItem>((resolve) => {
      const item: IModelItem = {
        id: nanoid(),
      };
      dispatchAndFire(addItemAction({ parentId, item }));
      resolve(item);
    });
  };

  const deleteItem = (uid: string) => {
    dispatchAndFire(deleteItemAction(uid));
  };

  const selectItem = (uid: string) => {
    if (state.selectedItemId !== uid) {
      dispatch(selectItemAction(uid));
    }
  };

  const updateChildItems = (payload: IUpdateChildItemsPayload) => {
    dispatchAndFire(updateChildItemsAction(payload));
  };

  const getItem = (uid: string): IModelItem => {
    return getItemById(state.items, uid);
  };

  const updateItem = (payload: IUpdateItemSettingsPayload) => {
    dispatchAndFire(updateItemAction(payload));
  };

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  return (
    <PropertiesEditorStateContext.Provider value={{ ...state }}>
      <PropertiesEditorActionsContext.Provider
        value={{
          addItem,
          deleteItem,
          selectItem,
          updateChildItems,
          getItem,
          updateItem,
          /* NEW_ACTION_GOES_HERE */
        }}
      >
        {children}
      </PropertiesEditorActionsContext.Provider>
    </PropertiesEditorStateContext.Provider>
  );
};

function usePropertiesEditorState() {
  const context = useContext(PropertiesEditorStateContext);

  if (context === undefined) {
    throw new Error('usePropertiesEditorState must be used within a PropertiesEditorProvider');
  }

  return context;
}

function usePropertiesEditorActions() {
  const context = useContext(PropertiesEditorActionsContext);

  if (context === undefined) {
    throw new Error('usePropertiesEditorActions must be used within a PropertiesEditorProvider');
  }

  return context;
}

function usePropertiesEditor() {
  return { ...usePropertiesEditorState(), ...usePropertiesEditorActions() };
}

export { PropertiesEditorProvider, usePropertiesEditor };