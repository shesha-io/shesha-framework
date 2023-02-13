import { IButtonGroup, ToolbarItemProps } from './models';

export const getItemById = (items: ToolbarItemProps[], id: string): ToolbarItemProps => {
  const position = getItemPositionById(items, id);
  return position ? position.ownerArray[position.index] : null;
};

export interface IItemPosition {
  ownerArray: ToolbarItemProps[];
  index: number;
}
export const getItemPositionById = (items: ToolbarItemProps[], id: string): IItemPosition => {
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    if (item.id === id)
      return {
        ownerArray: items,
        index,
      };

    const childs = (item as IButtonGroup)?.childItems;
    if (childs) {
      const itemPosition = getItemPositionById(childs, id);
      if (itemPosition) return itemPosition;
    }
  }
  return null;
};
