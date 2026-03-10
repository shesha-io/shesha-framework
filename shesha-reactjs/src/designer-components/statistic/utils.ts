import { IFontValue } from '@/designer-components/_settings/utils/font/interfaces';
import { IStyleType } from '@/providers/form/models';
import { CSSProperties } from 'react';

type DefaultStyles = Omit<IStyleType, 'style'> & {
  titleFont: IFontValue;
  valueFont: IFontValue;
  style: IStyleType['style'] | CSSProperties;
};

export const defaultStyles = (): DefaultStyles => {
  return {
    background: { type: 'color', color: '#fff' },
    titleFont: { weight: '300', size: 20, color: '#000', type: 'Segoe UI', align: 'center' },
    valueFont: { weight: '300', size: 35, color: '#000', type: 'Segoe UI', align: 'center' },
    border: {
      hideBorder: false,
      radiusType: 'all',
      borderType: 'all',
      border: {
        all: { width: '1px', style: 'solid', color: '#d9d9d9' },
        top: { width: '1px', style: 'solid', color: '#d9d9d9' },
        bottom: { width: '1px', style: 'solid', color: '#d9d9d9' },
        left: { width: '3px', style: 'solid', color: 'primary' },
        right: { width: '1px', style: 'solid', color: '#d9d9d9' },
      },
      radius: { all: 8 },
    },
    dimensions: {
      width: '100%',
      height: 'auto',
      minHeight: '0px',
      maxHeight: 'auto',
      minWidth: '0px',
      maxWidth: 'auto',
    },
    style: { padding: '0px', margin: '0px auto', verticalAlign: 'middle', textAlign: 'center' },
    shadow: {
      color: '#96aab480',
      offsetX: 0,
      offsetY: 7,
      blurRadius: 30,
      spreadRadius: -10,
    },
  };
};
