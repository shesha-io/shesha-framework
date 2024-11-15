import { IConfigurableFormComponent } from '@/providers/form/models';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { CSSProperties } from 'styled-components';

export type TextType = 'text' | 'password';

export interface IInputStyles {
  size?: SizeType;
  borderSize?: string | number;
  borderRadius?: number;
  borderType?: string;
  borderColor?: string;
  fontColor?: string;
  fontWeight?: string | number;
  fontSize?: string | number;
  stylingBox?: string;
  height?: string | number;
  width?: string | number;
  backgroundColor?: string;
  hideBorder?: boolean;
  style?: string;
}
export interface ITextFieldComponentProps extends IConfigurableFormComponent, IInputStyles {
  desktop?: CSSProperties;
  tablet?: CSSProperties;
  mobile?: CSSProperties;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  suffixIcon?: string;
  prefixIcon?: string;
  initialValue?: string;
  passEmptyStringByDefault?: boolean;
  textType?: TextType;
}