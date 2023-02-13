import moment from 'moment';
import { getNumberFormat } from '../../../../utils/string';
import { ITextTypographyProps } from './models';

export type ContentType = 'secondary' | 'success' | 'warning' | 'danger' | 'custom';
export type ContentDisplay = 'content' | 'name';

export const FONT_SIZES = {
  'text-xxs': { fontSize: '0.6rem', lineHeight: '0.8rem' },
  'text-xs': { fontSize: '0.75rem', lineHeight: '1rem' },
  'text-sm': { fontSize: '0.875rem', lineHeight: '1.25rem' },
  'text-base': { fontSize: '1rem', lineHeight: '1.5rem' },
  'text-lg': { fontSize: '1.125rem', lineHeight: '1.75rem' },
  'text-xl': { fontSize: '1.25rem', lineHeight: '1.75rem' },
  'text-2xl': { fontSize: '1.5rem;', lineHeight: '2rem' },
  'text-3xl': { fontSize: '1.875rem', lineHeight: '2.25rem' },
  'text-4xl': { fontSize: '2.25rem', lineHeight: '2.5rem' },
  'text-5xl': { fontSize: '3rem', lineHeight: 1 },
  'text-6xl': { fontSize: '3.75rem;', lineHeight: 1 },
  'text-7xl': { fontSize: '4.5rem', lineHeight: 1 },
  'text-8xl': { fontSize: '6rem', lineHeight: 1 },
  'text-9xl': { fontSize: '8rem', lineHeight: 1 },
};

export const PADDING_SIZES = {
  none: { padding: '0' },
  'padding-xxs': { padding: '0.6rem' },
  'padding-xs': { padding: '0.75rem' },
  'padding-sm': { padding: '0.875rem' },
  'padding-base': { padding: '1rem' },
  'padding-lg': { padding: '1.125rem' },
  'padding-xl': { padding: '1.25rem' },
  'padding-2xl': { padding: '1.5rem' },
  'padding-3xl': { padding: '1.875rem' },
  'padding-4xl': { padding: '2.25rem' },
  'padding-5xl': { padding: '3rem' },
  'padding-6xl': { padding: '3.75rem' },
  'padding-7xl': { padding: '4.5rem' },
  'padding-8xl': { padding: '6rem' },
  'padding-9xl': { padding: '8rem' },
};

export type TypographyFontSize = keyof typeof FONT_SIZES;
export type TypographyPaddingSize = keyof typeof PADDING_SIZES;

export const getFontSizeStyle = (key: TypographyFontSize) => FONT_SIZES[key];
export const getPaddingSizeStyle = (key: TypographyPaddingSize) => PADDING_SIZES[key];

export const DEFAULT_CONTENT_TYPE = '';
export const DEFAULT_CONTENT_DISPLAY: ContentDisplay = 'content';
export const DEFAULT_PADDING_SIZE: TypographyPaddingSize = 'none';

interface IContent {
  dataType?: ITextTypographyProps['dataType'];
  dateFormat?: ITextTypographyProps['dateFormat'];
  numberFormat?: ITextTypographyProps['numberFormat'];
}

export const getContent = (content: string, { dataType = 'string', dateFormat, numberFormat }: IContent = {}) => {
  switch (dataType) {
    case 'boolean':
      return !!content ? 'Yes' : 'No';
    case 'date-time':
      return moment(content).isValid() ? moment(content).format(dateFormat || 'DD/MM/YYYY HH:mm') : content;
    case 'number':
      return getNumberFormat(content, numberFormat || 'round');

    default:
      return content;
  }
};
