import { IModelItem } from '@/interfaces/modelConfigurator';
import { isDefined } from '@/utils/nullables';

export interface IItemPosition {
  ownerArray: IModelItem[];
  index: number;
}
export const getItemPositionById = (items: IModelItem[], id: string): IItemPosition | undefined => {
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    if (!isDefined(item))
      continue;

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
  return undefined;
};

export const getItemById = (items: IModelItem[], id: string): IModelItem | undefined => {
  const position = getItemPositionById(items, id);
  return position ? position.ownerArray[position.index] : undefined;
};
