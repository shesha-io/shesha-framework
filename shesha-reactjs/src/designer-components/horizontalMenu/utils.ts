import { IStyleType } from "@/index";

export const defaultStyles = (): IStyleType => {
  return {
    background: { type: 'color' },
    font: { weight: '400', size: 14, color: '#000', type: 'Segoe UI' },
    border: {
      border: {
        all: { width: '0px', style: 'solid' },
        top: { width: '0px', style: 'solid' },
        bottom: { width: '0px', style: 'solid' },
        left: { width: '0px', style: 'solid' },
        right: { width: '0px', style: 'solid' },
      },
      radius: { all: 8, topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
      borderType: 'all',
      radiusType: 'all',
    },
    shadow: {
      color: '#000000',
      offsetX: 0,
      offsetY: 0,
      blurRadius: 0,
      spreadRadius: 0,
    },
    menuItemShadow: {
      color: '#000000',
      offsetX: 0,
      offsetY: 0,
      blurRadius: 0,
      spreadRadius: 0,
    },
    overflow: 'dropdown',
    dimensions: { width: '500px', height: '55px', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
  };
};
