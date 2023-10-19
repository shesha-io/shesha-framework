import { IConfigurableFormComponent } from '../../providers/form/models';

export type TextType = 'text' | 'password';

export interface ITextFieldComponentProps extends IConfigurableFormComponent {
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  hideBorder?: boolean;
  initialValue?: string;
  passEmptyStringByDefault?: boolean;
  textType?: TextType;
}
