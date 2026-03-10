import { IModelItem } from '@/interfaces/modelConfigurator';

export interface IItemPosition {
  ownerArray: IModelItem[];
  index: number;
}
export const getItemPositionById = (items: IModelItem[], id: string): IItemPosition => {
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    if (item.id === id)
      return {
        ownerArray: items,
        index,
      };

    const childs = item.properties;
    if (childs) {
      const itemPosition = getItemPositionById(childs, id);
      if (itemPosition) return itemPosition;
    }
  }
  return null;
};

export const getItemById = (items: IModelItem[], id: string): IModelItem => {
  const position = getItemPositionById(items, id);
  return position ? position.ownerArray[position.index] : null;
};
