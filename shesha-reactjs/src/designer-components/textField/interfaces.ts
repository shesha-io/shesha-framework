import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';
import { IconType } from '@/components';
import { IEventHandlers } from '@/components/formDesigner/components/utils';
import { ComponentDefinition } from '@/interfaces';

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

interface ITextFieldComponentCalulatedValues {
  eventHandlers?: IEventHandlers;
}

export type TextFieldComponentDefinition = ComponentDefinition<"textField", ITextFieldComponentProps, ITextFieldComponentCalulatedValues>;
