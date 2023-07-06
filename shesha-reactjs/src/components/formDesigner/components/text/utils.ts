import moment from 'moment';
import { getNumberFormat } from '../../../../utils/string';
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
      return formatDateStringAndPrefix(content, dateFormat);

    case 'number':
      return getNumberFormat(content, numberFormat || 'round');

    default:
      return content;
  }
};

export const formatDateStringAndPrefix = (content: string, dateFormat: string) => {
  const regex = /^\s*([\S\s]+?)\s+(\d{4}-\d{2}-\d{2})/;
  const match = content.match(regex);

  if (match) {
    const prefix = match[1] || '';
    const dateString = match[2];

    const formatedDate = moment(dateString).isValid()
      ? moment(dateString).format(dateFormat || 'DD/MM/YYYY HH:mm')
      : dateString;

    return `${prefix} ${formatedDate}`;
  } else {
    return content;
  }
};
