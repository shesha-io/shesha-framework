import { CSSProperties } from 'react';

type WidthCssProp = CSSProperties['width'];
export const getWidth = (type: string, width: WidthCssProp): WidthCssProp => {
  switch (type) {
    case 'numberField': return width || 100;
    case 'button': return width || 24;
    case 'dropdown': return width || 120;
    case 'radio': return width;
    case 'colorPicker': return width || 24;
    case 'iconPicker': return width || 24;
    case 'customDropdown': return width || 120;
    default: return width || 50;
  }
};
