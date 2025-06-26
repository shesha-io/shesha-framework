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


export function fadeColor(color: string, fadePercentage: number): string {
  // Helper function to parse RGB values from different formats

  //handle simple colors
  if (/^[a-zA-Z]+$/.test(color)) {
    return color;
  }

  function getRGBValues(color: string): [number, number, number] | string {
    // Handle hex
    if (color.startsWith('#')) {
      if (!/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
        throw new Error('Invalid hex color');
      }

      // Convert 3-digit hex to 6-digit
      if (color.length === 4) {
        color = `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
      }

      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return [r, g, b];
    }

    // Handle rgb/rgba format
    if (color.startsWith('rgb')) {
      const matches = color.match(/\d+/g);
      if (!matches || matches.length < 3) {
        throw new Error('Invalid rgb/rgba color');
      }
      return matches.slice(0, 3).map(Number) as [number, number, number];
    }

    throw new Error('Color must be in hex (#RRGGBB) or rgb(r,g,b) format');
  }

  try {
    const [r, g, b] = getRGBValues(color);
    const alpha = (100 - fadePercentage) / 100;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } catch {
    throw new Error(`Could not parse color: ${color}`);
  }
}