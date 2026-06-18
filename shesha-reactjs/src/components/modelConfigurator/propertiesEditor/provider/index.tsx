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
} from './actions';
import { getItemById } from './utils';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { nanoid } from '@/utils/uuid';
import { throwError } from '@/utils/errors';
import { PayloadAction } from '@reduxjs/toolkit';
import { useDeepCompareMemo } from '@/hooks';

export interface IPropertiesEditorProviderProps {
  id?: string;
  items: IModelItem[];
  onChange?: ((items: IModelItem[]) => void) | undefined;
}

const PropertiesEditorProvider: FC<PropsWithChildren<IPropertiesEditorProviderProps>> = (props) => {
  const { children } = props;
  const selRef = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useThunkReducer(modelReducer, {
    ...PROPERTIES_EDITOR_CONTEXT_INITIAL_STATE,
    items: props.items.filter((x) => !x.isFrameworkRelated),
    onChange: props.onChange,
  });

  const dispatchAndFire = <P = void, T extends string = string>(action: PayloadAction<P, T>): void => {
    dispatch((dispatchThunk, getState) => {
      dispatchThunk(action);
      if (props.onChange) {
        const updatedItems = getState().items;
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

  const getItem = (uid: string): IModelItem | undefined => {
    return getItemById(state.items, uid);
  };

  const updateItem = (payload: IUpdateItemSettingsPayload): void => {
    dispatchAndFire(updateItemAction(payload));
  };

  const localState = useDeepCompareMemo(() => {
    return { ...state, selectedItemRef: selRef };
  }, [state]);

  const actions = useDeepCompareMemo(() => {
    return { addItem, deleteItem, selectItem, updateChildItems, getItem, updateItem /* NEW_ACTION_GOES_HERE */ };
  }, [state]);

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  return (
    <PropertiesEditorStateContext.Provider value={localState}>
      <PropertiesEditorActionsContext.Provider value={actions}>
        {children}
      </PropertiesEditorActionsContext.Provider>
    </PropertiesEditorStateContext.Provider>
  );
};

const usePropertiesEditorState = (): IPropertiesEditorStateContext => useContext(PropertiesEditorStateContext) ?? throwError("usePropertiesEditorState must be used within a PropertiesEditorProvider");

const usePropertiesEditorActions = (): IPropertiesEditorActionsContext => useContext(PropertiesEditorActionsContext) ?? throwError("usePropertiesEditorActions must be used within a PropertiesEditorProvider");

const usePropertiesEditor = (): IPropertiesEditorStateContext & IPropertiesEditorActionsContext => {
  return { ...usePropertiesEditorState(), ...usePropertiesEditorActions() };
};

export { PropertiesEditorProvider, usePropertiesEditor };
