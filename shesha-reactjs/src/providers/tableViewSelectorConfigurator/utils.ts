import { ITableViewProps } from './models';

export const getItemById = (items: ITableViewProps[], id: string): ITableViewProps => {
  const position = getItemPositionById(items, id);
  return position ? position.ownerArray[position.index] : null;
};

export interface IItemPosition {
  ownerArray: ITableViewProps[];
  index: number;
}
export const getItemPositionById = (items: ITableViewProps[], id: string): IItemPosition => {
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    if (item.id === id)
      return {
        ownerArray: items,
        index,
      };
  }
  return null;
};
