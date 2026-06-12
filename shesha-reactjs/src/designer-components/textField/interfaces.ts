import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';
import { IconType } from '@/components/shaIcon';
import { ComponentDefinition } from '@/interfaces';

export type TextType = 'text' | 'password';

export interface ITextFieldComponentProps extends IConfigurableFormComponent, IInputStyles {
  placeholder?: string | undefined;
  prefix?: string | undefined;
  suffix?: string | undefined;
  suffixIcon?: IconType | undefined;
  prefixIcon?: IconType | undefined;
  initialValue?: string | undefined;
  textType?: TextType | undefined;
  desktop?: IInputStyles | undefined;
  mobile?: IInputStyles | undefined;
  tablet?: IInputStyles | undefined;
  spellCheck?: boolean | undefined;
  regExp?: string | undefined;
}

export type TextFieldComponentDefinition = ComponentDefinition<"textField", ITextFieldComponentProps>;
