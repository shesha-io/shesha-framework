import { IConfigurableFormComponent } from '@/providers/form/models';
import { IBorderValue } from '../styleBorder/interfaces';
import { IBackgroundValue } from '../styleBackground/interfaces';
import { IFontValue } from '../styleFont/interfaces';
import { IconType } from '@/components';
import { IDimensionsValue } from '../styleDimensions/interfaces';
import { IShadowValue } from '../styleShadow/interfaces';

export type TextType = 'text' | 'password';

export interface IStyleType {
  border?: IBorderValue;
  background?: IBackgroundValue;
  font?: IFontValue;
  shadow?: IShadowValue;
  dimensions?: IDimensionsValue;
}
export interface ITextFieldComponentProps extends IConfigurableFormComponent {
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  suffixIcon?: any;
  prefixIcon?: any;
  hideBorder?: boolean;
  initialValue?: string;
  textType?: TextType;
  styles?: IStyleType;
}
