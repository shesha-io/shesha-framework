import { CSSProperties } from 'react';
import { IFontValue } from '../../designer-components/_settings/utils/font/interfaces';

export interface IIconConfig {
  icon?: string;
  size?: number;
  color?: string;
  style?: CSSProperties;
}

export interface ITitleConfig {
  text?: string;
  font?: IFontValue;
  style?: CSSProperties;
  align?: 'left' | 'center' | 'right';
}

export interface IPrefixConfig {
  text?: string;
  icon?: string;
  color?: string;
  iconSize?: number;
  style?: CSSProperties;
}

export interface ISuffixConfig {
  text?: string;
  icon?: string;
  color?: string;
  iconSize?: number;
  style?: CSSProperties;
}

export interface IAdvancedStatisticProps {
  value?: number | string;
  precision?: number;

  // Side icons
  leftIcon?: IIconConfig;
  rightIcon?: IIconConfig;

  // Titles
  topTitle?: ITitleConfig;
  bottomTitle?: ITitleConfig;

  // Prefix and suffix
  prefix?: IPrefixConfig;
  suffix?: ISuffixConfig;

  // Value styling
  valueFont?: IFontValue;
  valueStyle?: CSSProperties;

  // Container styling
  containerStyle?: CSSProperties;

  // Events
  onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}
