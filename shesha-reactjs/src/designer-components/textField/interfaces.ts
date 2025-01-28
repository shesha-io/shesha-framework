import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';
import { CSSProperties } from 'styled-components';

export type TextType = 'text' | 'password';

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
  spellCheck?: boolean;
}
