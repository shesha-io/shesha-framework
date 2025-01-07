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
