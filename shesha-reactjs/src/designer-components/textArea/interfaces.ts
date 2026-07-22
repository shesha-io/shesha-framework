import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';

export interface ITextAreaComponentProps extends IConfigurableFormComponent, IInputStyles {
  placeholder?: string | undefined;
  showCount?: boolean | undefined;
  autoSize?: boolean | undefined;
  allowClear?: boolean | undefined;
  initialValue?: string | undefined;
  passEmptyStringByDefault?: boolean | undefined;
  spellCheck?: boolean | undefined;
  desktop?: IInputStyles | undefined;
}

export type TextAreaComponentDefinition = ComponentDefinition<"textArea", ITextAreaComponentProps>;
