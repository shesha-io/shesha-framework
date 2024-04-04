import moment from 'moment';
import { getNumberFormat } from '@/utils/string';
import {
  ContentDisplay,
  FONT_SIZES,
  ITextTypographyProps,
  PADDING_SIZES,
  TypographyFontSize,
  TypographyPaddingSize,
} from './models';

export const getFontSizeStyle = (key: TypographyFontSize) => FONT_SIZES[key];
export const getPaddingSizeStyle = (key: TypographyPaddingSize) => PADDING_SIZES[key];

export const DEFAULT_CONTENT_TYPE = '';
export const DEFAULT_CONTENT_DISPLAY: ContentDisplay = 'content';
export const DEFAULT_PADDING_SIZE: TypographyPaddingSize = 'none';

export interface IContent {
  dataType?: ITextTypographyProps['dataType'];
  dateFormat?: ITextTypographyProps['dateFormat'];
  numberFormat?: ITextTypographyProps['numberFormat'];
  dataFormat?: string;
}

const formatDate = (dateText: string, dateFormat: string) => {
  return moment(dateText).isValid() ? moment(dateText).format(dateFormat || 'DD/MM/YYYY HH:mm') : dateText;
};

export const formatDateStringAndPrefix = (content: string, dateFormat: string) => {
  const regex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
  const match = content?.match(regex);

  if (match) {
    const dateString = match[0];
    return content.replace(regex, formatDate(dateString, dateFormat));
  } else {
    return content.replace(regex, formatDate(content, dateFormat));
  }
};

export const getContent = (content: string, { dataType = 'string', dateFormat, numberFormat }: IContent = {}) => {
  switch (dataType) {
    case 'boolean':
      return !!content ? 'Yes' : 'No';
    case 'date-time':
      return formatDateStringAndPrefix(content, dateFormat);

    case 'number':
      return getNumberFormat(content, numberFormat || 'round');

    default:
      return content;
  }
};