import React, { FC, useContext, PropsWithChildren, useRef } from 'react';
import modelReducer from './reducer';
import useThunkReducer from '@/hooks/thunkReducer';
import {
  IUpdateChildItemsPayload,
  IUpdateItemSettingsPayload,
  PropertiesEditorActionsContext,
  PropertiesEditorStateContext,
  PROPERTIES_EDITOR_CONTEXT_INITIAL_STATE,
  IPropertiesEditorStateContext,
  IPropertiesEditorActionsContext,
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
import { IModelItem } from '@/interfaces/modelConfigurator';
import { Action } from 'redux-actions';
import { nanoid } from '@/utils/uuid';

export interface IPropertiesEditorProviderProps {
  id?: string;
  items: IModelItem[];
  onChange?: (items: IModelItem[]) => void;
}

const PropertiesEditorProvider: FC<PropsWithChildren<IPropertiesEditorProviderProps>> = (props) => {
  const { children } = props;
  const selRef = useRef(null);
  const [state, dispatch] = useThunkReducer(modelReducer, {
    ...PROPERTIES_EDITOR_CONTEXT_INITIAL_STATE,
    items: props.items?.filter((x) => !x.isFrameworkRelated) || [],
    onChange: props.onChange,
    selectedItemRef: selRef,
  });

  const dispatchAndFire = (action: Action<any>): void => {
    dispatch((dispatchThunk, getState) => {
      dispatchThunk(action);
      if (props.onChange) {
        const updatedItems = getState()?.items;
        props.onChange(updatedItems);
      }
    });
  };

  const addItem = (parentId?: string): Promise<IModelItem> => {
    // return dispatchDeferred
    return new Promise<IModelItem>((resolve) => {
      const item: IModelItem = {
        id: nanoid(),
        dataType: '',
      };
      dispatchAndFire(addItemAction({ parentId, item }));
      resolve(item);
    });
  };

  const deleteItem = (uid: string): void => {
    dispatchAndFire(deleteItemAction(uid));
  };

  const selectItem = (uid: string): void => {
    if (state.selectedItemId !== uid) {
      dispatch(selectItemAction(uid));
    }
  };

  const updateChildItems = (payload: IUpdateChildItemsPayload): void => {
    dispatchAndFire(updateChildItemsAction(payload));
  };

  const getItem = (uid: string): IModelItem => {
    return getItemById(state.items, uid);
  };

  const updateItem = (payload: IUpdateItemSettingsPayload): void => {
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

function usePropertiesEditorState(): IPropertiesEditorStateContext {
  const context = useContext(PropertiesEditorStateContext);

  if (context === undefined) {
    throw new Error('usePropertiesEditorState must be used within a PropertiesEditorProvider');
  }

  return context;
}

function usePropertiesEditorActions(): IPropertiesEditorActionsContext {
  const context = useContext(PropertiesEditorActionsContext);

  if (context === undefined) {
    throw new Error('usePropertiesEditorActions must be used within a PropertiesEditorProvider');
  }

  return context;
}

function usePropertiesEditor(): IPropertiesEditorStateContext & IPropertiesEditorActionsContext {
  return { ...usePropertiesEditorState(), ...usePropertiesEditorActions() };
}

export { PropertiesEditorProvider, usePropertiesEditor };
