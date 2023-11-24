import { nanoid } from 'nanoid/non-secure';
import React, { FC, PropsWithChildren, useContext, useMemo, useReducer } from 'react';
import { usePrevious } from 'react-use';
import { InsertMode } from '../../interfaces';
import { treeToList } from '@/utils/tree';
import { FormMarkup } from '../form/models';
import {
  addGroupAction,
  addItemAction,
  deleteGroupAction,
  deleteItemAction,
  selectItemAction,
  updateChildItemsAction,
  updateItemAction,
} from './actions';
import {
  IConfigurableItemBase,
  IConfigurableItemGroup,
  IItemsOptions,
  ITEM_LIST_CONFIGURATOR_CONTEXT_INITIAL_STATE,
  IUpdateChildItemsPayload,
  IUpdateItemSettingsPayload,
  ItemListConfiguratorProviderActionsContext,
  ItemListConfiguratorStateContext,
} from './contexts';
import itemListConfiguratorReducer from './reducer';
import { getItemById } from './utils';

export interface IItemListConfiguratorProviderPropsBase {
  baseUrl?: string;
}

export interface IItemListConfiguratorProviderProps {
  items: IConfigurableItemBase[];
  options: IItemsOptions;
  itemTypeMarkup?: FormMarkup;
  groupTypeMarkup?: FormMarkup;
  insertMode?: InsertMode;
}

const ItemListConfiguratorProvider: FC<PropsWithChildren<IItemListConfiguratorProviderProps>> = ({
  items,
  options: { onAddNewItem, onAddNewGroup } = {},
  children,
  itemTypeMarkup,
  groupTypeMarkup,
  insertMode = 'before',
}) => {
  const [state, dispatch] = useReducer(itemListConfiguratorReducer, {
    ...ITEM_LIST_CONFIGURATOR_CONTEXT_INITIAL_STATE,
    items: items || [],
    insertMode,
  });

  // We don't wanna rerender if selectItem is called with the same selected value
  const previousSelectedItem = usePrevious(state?.selectedItemId);

  const addItem = () => {
    const itemTypeLength = treeToList(state.items as IConfigurableItemGroup[], 'childItems').filter(
      (i) => i.itemType === 'item'
    ).length;
    const itemProps: IConfigurableItemBase = {
      id: nanoid(),
      title: `New item`,
      selected: false,
    };

    dispatch(
      addItemAction(typeof onAddNewItem === 'function' ? onAddNewItem(state?.items, itemTypeLength) : itemProps)
    );
  };

  const deleteItem = (uid: string) => {
    dispatch(deleteItemAction(uid));
  };

  const selectItem = (uid: string) => {
    if (previousSelectedItem !== uid) {
      dispatch(selectItemAction(uid));
    }
  };

  const updateChildItems = (payload: IUpdateChildItemsPayload) => {
    dispatch(updateChildItemsAction(payload));
  };

  const addGroup = () => {
    const groupTypeLength = treeToList(state.items as IConfigurableItemGroup[], 'childItems').filter(
      (i) => i.itemType === 'group'
    ).length;

    const groupProps: IConfigurableItemGroup = {
      id: nanoid(),
      itemType: 'group',
      sortOrder: groupTypeLength,
      name: `Group${groupTypeLength + 1}`,
      title: `Group ${groupTypeLength + 1}`,
      selected: false,
    };

    dispatch(
      addGroupAction(typeof onAddNewGroup === 'function' ? onAddNewGroup(state?.items, groupTypeLength) : groupProps)
    );
  };

  const deleteGroup = (uid: string) => {
    dispatch(deleteGroupAction(uid));
  };

  const getItem = (uid: string): IConfigurableItemBase => {
    return getItemById(state.items, uid);
  };

  const updateItem = (payload: IUpdateItemSettingsPayload) => {
    dispatch(updateItemAction(payload));
  };

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  const memoizedSelectedItemId = useMemo(() => state?.selectedItemId, [state.selectedItemId]);

  return (
    <ItemListConfiguratorStateContext.Provider
      value={{ ...state, selectedItemId: memoizedSelectedItemId, itemTypeMarkup, groupTypeMarkup }}
    >
      <ItemListConfiguratorProviderActionsContext.Provider
        value={{
          addItem,
          deleteItem,
          selectItem,
          updateChildItems,
          getItem,
          updateItem,
          addGroup,
          deleteGroup,
          /* NEW_ACTION_GOES_HERE */
        }}
      >
        {children}
      </ItemListConfiguratorProviderActionsContext.Provider>
    </ItemListConfiguratorStateContext.Provider>
  );
};

function useItemListConfiguratorState() {
  const context = useContext(ItemListConfiguratorStateContext);

  if (context === undefined) {
    throw new Error('useItemListConfiguratorState must be used within a ItemListConfiguratorProvider');
  }

  return context;
}

function useItemListConfiguratorActions() {
  const context = useContext(ItemListConfiguratorProviderActionsContext);

  if (context === undefined) {
    throw new Error('useItemListConfiguratorActions must be used within a ItemListConfiguratorProvider');
  }

  return context;
}

function useItemListConfigurator() {
  return { ...useItemListConfiguratorState(), ...useItemListConfiguratorActions() };
}

export { ItemListConfiguratorProvider, useItemListConfigurator };
