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
import { DATE_TIME_FORMATS } from '../dateField/utils';
import { IStyleType } from '@/index';

// Common date formats to support
const SUPPORTED_DATE_FORMATS = [
  'YYYY-MM-DD', // 2004-12-01
  'DD-MM-YYYY', // 01-12-2004
  'MM-DD-YYYY', // 12-01-2004
  'YYYY/MM/DD', // 2004/12/01
  'DD/MM/YYYY', // 01/12/2004
  'MM/DD/YYYY', // 12/01/2004
  'YYYYMMDDTHHmmss', // 20041201T000000
  'YYYY-MM-DDTHH:mm:ss', // 2004-12-01T00:00:00
];

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

const isValidDate = (dateString: string): boolean => {
  // Try parsing with each supported format
  return SUPPORTED_DATE_FORMATS.some((format) => moment(dateString, format, true).isValid());
};

const parseDate = (dateString: string): moment.Moment | null => {
  for (const format of SUPPORTED_DATE_FORMATS) {
    const parsed = moment(dateString, format, true);
    if (parsed.isValid()) {
      return parsed;
    }
  }
  return null;
};

const formatDate = (dateText: string, targetFormat: string): string => {
  const parsed = parseDate(dateText);
  if (parsed) {
    return parsed.format(targetFormat);
  }
  return dateText; // Return original text if parsing fails
};

export const formatDateStringAndPrefix = (content: string, dateFormat: string = DATE_TIME_FORMATS.date) => {
  // Match any date-like pattern
  const datePattern =
    /\d{2}[-/]\d{2}[-/]\d{4}|\d{4}[-/]\d{2}[-/]\d{2}|\d{4}\d{2}\d{2}T\d{6}|\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g;

  return content?.replace(datePattern, (match) => {
    if (isValidDate(match)) {
      return formatDate(match, dateFormat);
    }
    return match;
  });
};

export const getContent = (content: string, { dataType = 'string', dateFormat, numberFormat }: IContent = {}) => {
  switch (dataType) {
    case 'boolean':
      return content ? 'Yes' : 'No';
    case 'date-time':
      return formatDateStringAndPrefix(content, dateFormat);
    case 'number':
      return getNumberFormat(content, numberFormat || 'round');
    default:
      return content;
  }
};

export const defaultStyles = (textType: string): IStyleType => {
  return {
    font: {
      color: '#000',
      type: 'Segoe UI',
      size:  textType === 'title' ? undefined : 14
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
      height: '100%',
      minHeight: '0px',
      maxHeight: 'auto',
      minWidth: '0px',
      maxWidth: 'auto',
    },
  };
};
