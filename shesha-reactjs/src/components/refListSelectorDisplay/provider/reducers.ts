import {
  REF_LIST_ITEM_GROUP_CONTEXT_INITIAL_STATE,
} from './contexts';
import { IRefListItemGroup, isIRefListItemGroup, RefListGroupItemProps } from '@/components/refListSelectorDisplay/provider/models';
import { getItemPositionById } from '@/components/refListSelectorDisplay/provider/utils';
import { createReducer } from '@reduxjs/toolkit';
import { setItems, selectItemAction, updateItemAction, updateChildItemsAction, storeSettingsAction } from './actions';
import { isDefined } from '@/utils/nullables';

export const RefListItemGroupReducer = createReducer(REF_LIST_ITEM_GROUP_CONTEXT_INITIAL_STATE, (builder) => {
  builder
    .addCase(setItems, (state, { payload }) => {
      // Preserve the per-item configuration the user already set, matched by itemValue, so
      // re-reading the reference list does not wipe saved settings (the cause of #5125).
      const priorByValue = new Map<number, RefListGroupItemProps>();
      const indexPriorItems = (items: RefListGroupItemProps[]): void => {
        items.forEach((prior) => {
          const value = prior.itemValue;
          if (isDefined(value))
            priorByValue.set(value, prior);
          // grouped items keep their settings under childItems, so recurse to preserve nested config too
          if (isIRefListItemGroup(prior) && isDefined(prior.childItems))
            indexPriorItems(prior.childItems);
        });
      };
      indexPriorItems(state.items);
      return {
        ...state,
        items: payload.map<RefListGroupItemProps>((item) => {
          const prior = priorByValue.get(item.itemValue);
          // Keep every setting the user configured for the item and refresh only the data the
          // reference list owns. Listing the preserved properties one by one silently dropped the
          // rest of the item configuration on each re-read. `childItems` is not carried over: the
          // reference list defines a flat set of items.
          const { childItems: _childItems, ...priorSettings } = (prior ?? {}) as IRefListItemGroup;
          return {
            ...priorSettings,
            ...item,
            item: item.item ?? undefined,
            color: item.color ?? undefined,
            icon: item.icon ?? undefined,
          };
        }),
      };
    })
    .addCase(storeSettingsAction, (state, { payload }) => {
      return {
        ...state,
        userSettings: {
          // Keep the existing settings
          ...state.userSettings,
          // Update only the specific columnId with its collapse state
          [payload.columnId]: payload.isCollapsed,
        },
      };
    })
    .addCase(selectItemAction, (state, { payload }) => {
      return {
        ...state,
        selectedItemId: payload,
      };
    })
    .addCase(updateItemAction, (state, { payload }) => {
      const newItems = [...state.items];

      const position = getItemPositionById(newItems, payload.id);
      if (!position) return state;

      const newArray = position.ownerArray;
      newArray[position.index] = {
        ...newArray[position.index],
        ...payload.settings,
      };

      return {
        ...state,
        items: newItems,
      };
    })
    .addCase(updateChildItemsAction, (state, { payload }) => {
      const { index, childs: childIds } = payload;
      if (!Boolean(index) || index.length === 0) {
        return {
          ...state,
          items: childIds,
        };
      }
      // copy all items
      const newItems = [...state.items];
      // blockIndex - full index of the current container
      const blockIndex = [...index];
      // lastIndex - index of the current element in its' parent
      const lastIndex = blockIndex.pop();
      if (!lastIndex) return state;

      // search for a parent item
      // const lastArr = blockIndex.reduce((arr, i) => (arr[i] as IRefListItemGroup).childItems, newItems);
      const lastArr = blockIndex.reduce((arr, i) => isDefined(arr[i]) && isIRefListItemGroup(arr[i]) ? arr[i].childItems ?? [] : [], newItems);

      const parent = lastArr[lastIndex];

      // and set a list of childs
      if (isDefined(parent) && isIRefListItemGroup(parent))
        parent.childItems = childIds;

      return {
        ...state,
        items: newItems,
      };
    })
  ;
});

export default RefListItemGroupReducer;
