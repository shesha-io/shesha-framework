import { EllipsisConfig } from 'antd/lib/typography/Base';
import { CSSProperties } from 'react';
import { IConfigurableFormComponent } from '@/providers';
import { IBorderValue } from '../_settings/utils/border/interfaces';
import { IFontValue } from '../_settings/utils/font/interfaces';
import { IShadowValue } from '../_settings/utils/shadow/interfaces';
import { IDimensionsValue } from '../_settings/utils/dimensions/interfaces';
import { IBackgroundValue } from '../_settings/utils/background/interfaces';

type LevelType = 1 | 2 | 3 | 4 | 5;

export type ContentType = 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'danger' | 'custom';
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

export interface ITypographyProps {
  code?: boolean;
  copyable?: boolean;
  delete?: boolean;
  ellipsis?: boolean | Omit<EllipsisConfig, 'rows' | 'expandable' | 'onExpand'>;
  mark?: boolean;
  underline?: boolean;
  keyboard?: boolean;
  italic?: boolean;
  styles?: CSSProperties;
  contentDisplay?: ContentDisplay;
  dataType?: 'string' | 'date-time' | 'number' | 'boolean';
  dateFormat?: string;
  numberFormat?: string;
  value?: any;
  textAlign?: string;
  level?: LevelType | TypographyFontSize;
  textType: 'span' | 'paragraph' | 'title';
  content?: string;
  contentType?: ContentType;
  color?: string;
  backgroundColor?: string;
  fontSize?: TypographyFontSize;
  padding?: TypographyPaddingSize;
  border?: IBorderValue;
  hideBorder?: boolean;
  borderSize?: number;
  borderRadius?: number;
  borderColor?: string;
  fontColor?: string;
  font?: IFontValue;
  shadow?: IShadowValue;
  dimensions?: IDimensionsValue;  
  background?: IBackgroundValue;
  strong?: boolean;

}

export interface ITextTypographyProps extends ITypographyProps, IConfigurableFormComponent {
}
