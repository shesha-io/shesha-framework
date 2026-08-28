import {
  ContentDisplay,
  FONT_SIZES,
  FontSizeProps,
  ITextComponentPropsV0,
  PADDING_SIZES,
  PaddingProps,
  TypographyFontSize,
  TypographyPaddingSize,
} from './models';
import { IStyleValue } from '@/interfaces';

export const getFontSizeStyle = (key: TypographyFontSize): FontSizeProps | undefined => FONT_SIZES[key];
export const getPaddingSizeStyle = (key: TypographyPaddingSize): PaddingProps | undefined => PADDING_SIZES[key];

export const DEFAULT_CONTENT_TYPE = '';
export const DEFAULT_CONTENT_DISPLAY: ContentDisplay = 'content';
export const DEFAULT_PADDING_SIZE: TypographyPaddingSize = 'none';

export const defaultStyles = (model?: ITextComponentPropsV0 | undefined): IStyleValue & { level: number } => {
  return {
    level: 0,
    font: { color: '#000', type: 'Segoe UI', align: 'left', weight: '400', size: model?.textType === 'title' ? undefined : 14 },
    background: { type: 'color', color: '' },
    border: {
      border: {
        all: { width: 1, style: 'none', color: '#d9d9d9' },
      },
      radius: { all: 8 },
      borderType: 'all',
      radiusType: 'all',
    },
    dimensions: {
      width: '100%',
      height: 'auto',
      minHeight: '0px',
      maxHeight: 'auto',
      minWidth: '0px',
      maxWidth: 'auto',
    },
    stylingBoxJson: { _type: 'styleBox', paddingLeft: '0', paddingBottom: '0', paddingTop: '0', paddingRight: '0', marginLeft: '0', marginBottom: '0', marginTop: '0', marginRight: '0' },
  };
};

export const remToPx = (remValue: string | number | undefined, rootFontSize = 14): number => {
  if (typeof remValue !== 'string') return rootFontSize;
  const match = remValue.trim().match(/^([0-9.]+)rem$/);
  if (!match) return rootFontSize;
  const rem = parseFloat(match[1] ?? "");
  if (isNaN(rem)) return rootFontSize;
  return rem * rootFontSize;
};
