import moment from 'moment';
import { getNumberFormat } from '../../../../utils/string';
import { ContentDisplay, FONT_SIZES, ITextTypographyProps, PADDING_SIZES, TypographyFontSize, TypographyPaddingSize } from './models';

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
