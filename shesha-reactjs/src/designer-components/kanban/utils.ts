import { IStyleType } from "@/index";

export const defaultStyles = (): IStyleType => {
    return {
      font: { color: '#000', size: 14, weight:  '400', type: 'Segoe UI' },
      background: { type: 'color', color: '#fff' },
      dimensions: {
        width: 'auto',
        height: 'auto',
        minHeight: '0px',
        maxHeight: 'auto',
        minWidth: '0px',
        maxWidth: 'auto',
      },
      border: {
        radiusType: 'all',
        borderType: 'custom',
        border: {
          all: { width: '1px', color: '#d9d9d9', style: 'solid' },
          top: { width: '1px', color: '#d9d9d9', style: 'solid' },
          bottom: { width: '1px', color: '#d9d9d9', style: 'solid' },
          left: { width: '1px', color: '#d9d9d9', style: 'solid' },
          right: { width: '1px', color: '#d9d9d9', style: 'solid' },
        },
        radius: { all: 0 },
      },
      shadow: { blurRadius: 0, color: 'rgba(0, 0, 0, 0.15)', offsetX: 0, offsetY: 0, spreadRadius: 0 },
      stylingBox: '{"marginBottom":"5","paddingLeft":"8","paddingBottom":"8","paddingTop":"8","paddingRight":"8"}',
    };
  };
  
  export const defaultColumnStyles = (): IStyleType => {
    return {
      font: { color: '#000', size: 14, weight:  '400', type: 'Segoe UI' },
      background: { type: 'color', color: '#00000005' },
      dimensions: { width: '300px', height: '500px', minHeight: '500px', maxHeight: '500px', minWidth: '300px', maxWidth: '300px' },
      shadow: { blurRadius: 0, color: 'rgba(0, 0, 0, 0.15)', offsetX: 0, offsetY: 0, spreadRadius: 0 },
      border: {
        radiusType: 'all',
        borderType: 'all',
        border: {
                all: { width: '1px', color: '#d9d9d9', style: 'solid' },
                top: { width: '1px', color: '#d9d9d9', style: 'solid' },
                bottom: { width: '1px', color: '#d9d9d9', style: 'solid' },
                left: { width: '1px', color: '#d9d9d9', style: 'solid' },
                right: { width: '1px', color: '#d9d9d9', style: 'solid' },
        },
        radius: { all: 0 },
      },
      stylingBox: '{"paddingLeft":"8","paddingBottom":"8","paddingTop":"8","paddingRight":"8"}',
    };
  };