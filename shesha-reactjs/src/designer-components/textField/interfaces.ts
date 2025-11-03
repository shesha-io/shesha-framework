import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';
import { IconType } from '@/components';

export type TextType = 'text' | 'password';

export interface ITextFieldComponentProps extends IConfigurableFormComponent, IInputStyles {
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  suffixIcon?: IconType;
  prefixIcon?: IconType;
  initialValue?: string;
  textType?: TextType;
  desktop?: IInputStyles;
  mobile?: IInputStyles;
  tablet?: IInputStyles;
  spellCheck?: boolean;
  regExp?: string;
}
