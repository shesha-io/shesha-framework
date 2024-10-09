import { IConfigurableFormComponent } from '@/providers/form/models';
import { IBorderValue } from '../styleBorder/interfaces';
import { IBackgroundValue } from '../styleBackground/interfaces';
import { IFontValue } from '../styleFont/interfaces';
import { IconType } from '@/components';
import { IDimensionsValue } from '../styleDimensions/interfaces';
import { IShadowValue } from '../styleShadow/interfaces';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

export type TextType = 'text' | 'password';

export interface IStyleType {
  border?: IBorderValue;
  background?: IBackgroundValue;
  font?: IFontValue;
  shadow?: IShadowValue;
  dimensions?: IDimensionsValue;
}


export interface IInputStyles {
  size?: SizeType;
  borderSize?: number;
  borderRadius?: number;
  borderType?: string;
  borderColor?: string;
  fontColor?: string;
  fontWeight?: string | number;
  fontSize?: string | number;
  stylingBox?: string;
  height?: string;
  width?: string;
  backgroundColor?: string;
  hideBorder?: boolean;
  styles?: IStyleType;
}
export interface ITextFieldComponentProps extends IConfigurableFormComponent {
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  suffixIcon?: IconType;
  prefixIcon?: IconType;
  initialValue?: string;
  textType?: TextType;
  styles?: IStyleType;
  width?: string;
  height?: string;
  hideBorder?: boolean;
  borderSize?: number;
  borderRadius?: number;
  borderColor?: string;
  fontSize?: string;
  fontColor?: string;
  backgroundColor?: string;
  stylingBox?: string;
  desktop?: IInputStyles | IStyleType;
  mobile?: IInputStyles | IStyleType;
  tablet?: IInputStyles | IStyleType;
}
