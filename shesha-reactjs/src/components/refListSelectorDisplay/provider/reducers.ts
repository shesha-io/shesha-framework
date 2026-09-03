import {
  REF_LIST_ITEM_GROUP_CONTEXT_INITIAL_STATE,
} from './contexts';
import { IRefListGroupItemBase, isIRefListItemGroup, RefListGroupItemProps } from '@/components/refListSelectorDisplay/provider/models';
import { getItemPositionById } from '@/components/refListSelectorDisplay/provider/utils';
import { createReducer } from '@reduxjs/toolkit';
import { setItems, selectItemAction, updateItemAction, updateChildItemsAction, storeSettingsAction, syncConfiguredItemsAction } from './actions';
import { isDefined } from '@/utils/nullables';

/**
 * The reference list defines a flat set of items, so a group's children are never carried over
 * when its settings are reapplied.
 */
const withoutChildItems = (item: RefListGroupItemProps): IRefListGroupItemBase => {
  if (!isIRefListItemGroup(item)) return item;
  const { childItems: _childItems, ...rest } = item;
  return rest;
};

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
          // rest of the item configuration on each re-read.
          return {
            ...(isDefined(prior) ? withoutChildItems(prior) : {}),
            ...item,
            item: item.item ?? undefined,
            color: item.color ?? undefined,
            icon: item.icon ?? undefined,
          };
        }),
      };
    })
    .addCase(syncConfiguredItemsAction, (state, { payload }) => {
      // Adopt the configuration held by the host (the component model). The items are seeded into
      // the reducer only once, so without this a setting saved in the designer - a step hidden, an
      // action changed - was not reflected until the whole component was re-created.
      // The provider dispatches this only when the incoming configuration actually differs, so
      // rebuilding the items here cannot feed back into itself.
      if (payload.length === 0) return state;

      const configuredByValue = new Map<number, RefListGroupItemProps>();
      payload.forEach((configured) => {
        if (isDefined(configured.itemValue))
          configuredByValue.set(configured.itemValue, configured);
      });

      return {
        ...state,
        items: state.items.map<RefListGroupItemProps>((item) => {
          const configured = isDefined(item.itemValue) ? configuredByValue.get(item.itemValue) : undefined;
          if (!isDefined(configured)) return item;

          // The reference list owns the display data, the host owns the configuration.
          const { id: _id, item: _item, itemValue: _itemValue, color: _color, icon: _icon, ...settings } = withoutChildItems(configured);
          return { ...item, ...settings };
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
