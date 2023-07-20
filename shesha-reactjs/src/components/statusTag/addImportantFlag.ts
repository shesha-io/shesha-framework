import { IAnyObject } from 'interfaces';
import { CSSProperties } from 'react';

export const addImportant = (styleObj: IAnyObject): CSSProperties => {
  const newObj = {};
  for (const prop in styleObj) {
    if (prop.startsWith('margin') || prop.startsWith('padding')) {
      let value = styleObj[prop];
      if (typeof value === 'number') {
        value = `${value}px !important`;
      } else {
        value = `${value} !important`;
      }
      newObj[prop] = value;
    } else {
      newObj[prop] = styleObj[prop];
    }
  }
  return newObj;
};
