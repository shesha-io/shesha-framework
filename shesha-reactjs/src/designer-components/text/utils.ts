import { numberToFormattedString } from '@/utils/string';
import {
  ContentDisplay,
  FONT_SIZES,
  FontSizeProps,
  ITextComponentProps,
  PADDING_SIZES,
  PaddingProps,
  TypographyFontSize,
  TypographyPaddingSize,
} from './models';
import { IStyleType } from '@/interfaces';
import { formatDateStringAndPrefix } from '@/utils/formatting';

export const getFontSizeStyle = (key: TypographyFontSize): FontSizeProps => FONT_SIZES[key];
export const getPaddingSizeStyle = (key: TypographyPaddingSize): PaddingProps => PADDING_SIZES[key];

export const DEFAULT_CONTENT_TYPE = '';
export const DEFAULT_CONTENT_DISPLAY: ContentDisplay = 'content';
export const DEFAULT_PADDING_SIZE: TypographyPaddingSize = 'none';

export interface IContent {
  dataType?: ITextComponentProps['dataType'] | undefined;
  dateFormat?: ITextComponentProps['dateFormat'] | undefined;
  numberFormat?: ITextComponentProps['numberFormat'] | undefined;
  dataFormat?: string | undefined;
}

export const getContent = (content: string, { dataType = 'string', dateFormat, numberFormat }: IContent = {}): string => {
  switch (dataType) {
    case 'boolean':
      return content ? 'Yes' : 'No';
    case 'date-time':
      return formatDateStringAndPrefix(content, dateFormat);
    case 'number':
      return numberToFormattedString(content, numberFormat || 'round');
    default:
      return content;
  }
};

export const defaultStyles = (textType: string): IStyleType => {
  return {
    font: {
      color: '#000',
      type: 'Segoe UI',
      size: textType === 'title' ? undefined : 14,
    },
    background: { type: 'color', color: '' },
    border: {
      border: {
        all: {
          width: 1,
          style: 'none',
          color: '#d9d9d9',
        },
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
  };
};

export const remToPx = (remValue: string | number, rootFontSize = 14): number | null => {
  if (typeof remValue !== 'string') return rootFontSize;
  const match = remValue.trim().match(/^([0-9.]+)rem$/);
  if (!match) return rootFontSize;
  const rem = parseFloat(match[1]);
  if (isNaN(rem)) return rootFontSize;
  return rem * rootFontSize;
};
