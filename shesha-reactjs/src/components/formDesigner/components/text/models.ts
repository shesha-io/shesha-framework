import { BaseType, EllipsisConfig } from 'antd/lib/typography/Base';
import { CSSProperties } from 'react';
import { ColorResult } from 'react-color';
import { IConfigurableFormComponent } from '../../../../providers';
import { ContentDisplay, ContentType, TypographyFontSize, TypographyPaddingSize } from './utils';

declare const TITLE_ELE_LIST: [1, 2, 3, 4, 5];

type LevelType = typeof TITLE_ELE_LIST[number];

export interface ITypographyProps {
  code?: boolean;
  copyable?: boolean;
  delete?: boolean;
  ellipsis?: boolean | Omit<EllipsisConfig, 'rows' | 'expandable' | 'onExpand'>;
  mark?: boolean;
  underline?: boolean;
  keyboard?: boolean;
  italic?: boolean;
  type?: BaseType;
  style?: CSSProperties;
}

export interface ITextTypographyProps extends IConfigurableFormComponent {
  textType: 'span' | 'paragraph' | 'title';
  content: string;
  contentType?: ContentType;
  contentDisplay: ContentDisplay;
  color?: ColorResult;
  backgroundColor?: ColorResult;
  level?: LevelType | TypographyFontSize;
  fontSize?: TypographyFontSize;
  padding?: TypographyPaddingSize;
  dataType?: 'string' | 'date-time' | 'number' | 'boolean';
  dateFormat?: string;
  numberFormat?: string;
  code?: boolean;
  italic?: boolean;
  copyable?: boolean;
  delete?: boolean;
  ellipsis?: boolean;
  mark?: boolean;
  underline?: boolean;
  keyboard?: boolean;
  strong?: boolean;
  value?: string;
}
