import { ButtonGroupItemProps, IButtonGroup } from './models';

export interface IItemPosition {
  ownerArray: ButtonGroupItemProps[];
  index: number;
}

export const getItemPositionById = (items: ButtonGroupItemProps[], id: string): IItemPosition => {
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    if (item.id === id)
      return {
        ownerArray: items,
        index,
      };

    const children = (item as IButtonGroup)?.childItems;

    if (children) {
      const itemPosition = getItemPositionById(children, id);
      if (itemPosition) return itemPosition;
    }
  }

  return null;
};

export const getItemById = (items: ButtonGroupItemProps[], id: string): ButtonGroupItemProps => {
  const position = getItemPositionById(items, id);
  return position ? position.ownerArray[position.index] : null;
};

export const updateBranch = (items: ButtonGroupItemProps[], payload: { id: any; settings: any }): ButtonGroupItemProps[] | null => {
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    if (item.id === payload.id) {
      items[index] = { ...items[index], ...payload.settings };
      return [...items];
    }

    const parent = item as IButtonGroup;

    if (parent.childItems?.length > 0) {
      const array = updateBranch(parent.childItems, payload);
      if (!!array) {
        parent.childItems = array;
        return [...items];
      }
    }
  };

  return null;
};
