export const getRefListItems = (referenceList: string) => {

  return {
    path: `/api/services/app/Entities/GetAll`,
    queryParams: {
      skipCount: 0,
      entityType: 'Shesha.Framework.ReferenceListItem',
      maxResultCount: -1,
      filter: JSON.stringify({"and": [{"==": [{"var": "referenceList"},referenceList]}]}),
    },
  };
};

import { IRefListItemGroup, RefListGroupItemProps } from './models';

export interface IItemPosition {
  ownerArray: RefListGroupItemProps[];
  index: number;
}

export const getItemPositionById = (items: RefListGroupItemProps[], id: string): IItemPosition => {
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    if (item.id === id)
      return {
        ownerArray: items,
        index,
      };

    const children = (item as IRefListItemGroup)?.childItems;

    if (children) {
      const itemPosition = getItemPositionById(children, id);
      if (itemPosition) return itemPosition;
    }
  }

  return null;
};

export const getItemById = (items: RefListGroupItemProps[], id: string): RefListGroupItemProps => {
  const position = getItemPositionById(items, id);
  return position ? position.ownerArray[position.index] : null;
};

export const getComponentModel = (item: RefListGroupItemProps) => ({
  ...item,
  visible: true,
  allowChangeVisibility: true,
});


export function fadeColor(hex: string, fadePercentage: number): string {
  // Ensure hex is a valid format
  if (!/^#([0-9A-F]{3}){1,2}$/i.test(hex)) {
    throw new Error('Invalid hex color');
  }

  // Convert 3-digit hex to 6-digit
  if (hex.length === 4) {
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }

  // Parse the hex color
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);

  // Calculate the new alpha value (transparency) based on the fade percentage
  const alpha = (100 - fadePercentage) / 100;

  // Return the rgba string
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}