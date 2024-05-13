import { getNumberFormat } from '@/utils/string';
import {
  ContentDisplay,
  FONT_SIZES,
  ITextTypographyProps,
  PADDING_SIZES,
  TypographyFontSize,
  TypographyPaddingSize,
} from './models';
import { DATE_TIME_FORMATS } from '../dateField/utils';
import { getMoment } from '@/utils/date';

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
  return getMoment(dateText).format(dateFormat);
};

export const formatDateStringAndPrefix = (content: string, dateFormat: string) => {
  const dateTimeRegexes = [
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/, // ISO 8601 format: YYYY-MM-DDTHH:mm:ssZ
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // YYYY-MM-DDTHH:mm:ss
    /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/, // YYYY-MM-DD HH:mm:ss
    /\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}/, // DD-MM-YYYY HH:mm:ss
    /\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/, // DD/MM/YYYY HH:mm:ss
    /\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}/, // YYYY/MM/DD HH:mm:ss
  ];
  const dateRegexes = [
    /\d{4}-\d{2}-\d{2}/,
    /\d{2}\/\d{2}\/\d{4}/,
    /\d{4}\/\d{2}\/\d{2}/,
    /\d{2}-\d{2}-\d{4}/,
  ];

  for (const regex of [...dateTimeRegexes, ...dateRegexes]) {
    const match = regex.exec(content);
    if (match) {
      const dateString = match[0];
      return content.replace(dateString, formatDate(dateString, dateFormat));
    }
  }

  return content;
};

export const getContent = (content: string, { dataType = 'string', dateFormat, numberFormat }: IContent = {}) => {
  switch (dataType) {
    case 'boolean':
      return content ? 'Yes' : 'No';
    case 'date-time':
      return formatDateStringAndPrefix(content, dateFormat || DATE_TIME_FORMATS.date);
    case 'number':
      return getNumberFormat(content, numberFormat || 'round');

    default:
      return content;
  }
};