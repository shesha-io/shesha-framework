import { IConfigurableFormComponent } from '@/providers/form/models';
import { IBorderValue } from '../styleBorder/components/border/interfaces';
import { IBackgroundValue } from '../styleBackground/components/background/interfaces';
import { IFontValue } from '../styleFont/components/font/interfaces';
import { IconType } from '@/components';
import { IShadowValue } from '../styleShadow/components/shadow/interfaces';
import { IDimensionsValue } from '../styleDimensions/components/size/interfaces';

export type TextType = 'text' | 'password';

export interface ITextFieldComponentProps extends IConfigurableFormComponent {
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  suffixIcon?: IconType;
  prefixIcon?: IconType;
  hideBorder?: boolean;
  initialValue?: string;
  textType?: TextType;
  border?: IBorderValue;
  background?: IBackgroundValue;
  dimensions?: IDimensionsValue;
  font?: IFontValue;
  shadow?: IShadowValue;
}
