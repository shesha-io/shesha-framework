export const getRefListItems = (referenceList: string): FetcherOptions => {
  return {
    path: `/api/services/app/Entities/GetAll`,
    queryParams: {
      skipCount: 0,
      entityType: 'Shesha.Framework.ReferenceListItem',
      maxResultCount: -1,
      filter: JSON.stringify({ and: [{ "==": [{ var: "referenceList" }, referenceList] }] }),
    },
  };
};

import { FetcherOptions } from '@/utils/fetchers';
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

export const getComponentModel = (item: RefListGroupItemProps): RefListGroupItemProps & { visible: boolean; allowChangeVisibility: boolean } => ({
  ...item,
  visible: true,
  allowChangeVisibility: true,
});


export function fadeColor(color: string, fadePercentage: number): string {
  // Helper function to parse RGB values from different formats

  if (!color || typeof color !== 'string') {
    return 'rgba(0, 0, 0, 0.3)'; // Default fallback
  }


  if (/^[a-zA-Z]+$/.test(color)) {
    return color;
  }

  if (/^[a-zA-Z\s\-]+$/.test(color)) {
    return color;
  }

  function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number): number => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  function getRGBValues(color: string): [number, number, number] | null {
    // Handle hex
    if (color.startsWith('#')) {
      if (!/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
        return null;
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
        return null;
      }
      return matches.slice(0, 3).map(Number) as [number, number, number];
    }

    if (color.startsWith('hsl')) {
      const matches = color.match(/-?\d+(\.\d+)?/g);
      if (!matches || matches.length < 3) {
        return null;
      }
      const h = parseFloat(matches[0]);
      const s = parseFloat(matches[1].replace('%', ''));
      const l = parseFloat(matches[2].replace('%', ''));
      return hslToRgb(h / 360, s / 100, l / 100);
    }

    return null;
  }

  try {
    const rgbValues = getRGBValues(color);

    if (rgbValues) {
      const [r, g, b] = rgbValues;
      const alpha = (100 - fadePercentage) / 100;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    return color;
  } catch {
    // Final fallback - return original color
    return color;
  }
}
