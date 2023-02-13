import { ISidebarMenuItem } from '../../interfaces/sidebar';

export const getItemById = (items: ISidebarMenuItem[], id: string): ISidebarMenuItem => {
  const position = getItemPositionById(items, id);
  return position ? position.ownerArray[position.index] : null;
};

export interface IItemPosition {
  ownerArray: ISidebarMenuItem[];
  index: number;
}
export const getItemPositionById = (items: ISidebarMenuItem[], id: string): IItemPosition => {
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    if (item.id === id)
      return {
        ownerArray: items,
        index,
      };

    const childs = item.childItems;
    if (childs) {
      const itemPosition = getItemPositionById(childs, id);
      if (itemPosition) return itemPosition;
    }
  }
  return null;
};
