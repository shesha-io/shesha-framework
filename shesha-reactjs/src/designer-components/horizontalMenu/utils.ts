import { IStyleType } from "@/index";

export const defaultStyles = (): IStyleType => {
  return {
    background: { type: 'color', color: 'transparent' },
    font: { weight: '400', size: 14, color: '#000', type: 'Segoe UI' },
    border: {
      border: {
        all: { width: '0px', style: 'none', color: 'transparent' },
        top: { width: '0px', style: 'none', color: 'transparent' },
        bottom: { width: '0px', style: 'none', color: 'transparent' },
        left: { width: '0px', style: 'none', color: 'transparent' },
        right: { width: '0px', style: 'none', color: 'transparent' },
      },
      radius: { all: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 },
      borderType: 'none',
      radiusType: 'all',
    },
    dimensions: { width: '100%', height: '55px', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
  };
};
