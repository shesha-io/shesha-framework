import { IEventHandlers } from '@/components/formDesigner/components/utils';
import { IToolboxComponent } from '@/interfaces';
import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';

export interface ITextAreaComponentProps extends IConfigurableFormComponent, IInputStyles {
  placeholder?: string;
  showCount?: boolean;
  autoSize?: boolean;
  allowClear?: boolean;
  initialValue?: string;
  passEmptyStringByDefault?: boolean;
  spellCheck?: boolean;
  desktop?: IInputStyles;
}

interface ITextFieldComponentCalulatedValues {
  defaultValue?: string;
  eventHandlers?: IEventHandlers;
}

export type TextAreaComponentDefinition = IToolboxComponent<ITextAreaComponentProps, ITextFieldComponentCalulatedValues>;
