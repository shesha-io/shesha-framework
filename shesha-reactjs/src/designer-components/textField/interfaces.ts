import { IConfigurableFormComponent } from '@/providers/form/models';

export type TextType = 'text' | 'password';

export interface ITextFieldComponentProps extends IConfigurableFormComponent {
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  suffixIcon?: string;
  prefixIcon?: string;
  hideBorder?: boolean;
  initialValue?: string;
  passEmptyStringByDefault?: boolean;
  textType?: TextType;
  borderSize?: number;
  borderRadius?: number;
  borderType?: string;
  borderColor?: string;
  fontColor?: string;
  fontWeight?: string | number;
  fontSize?: string;
  stylingBox?: string;
  height?: string;
  width?: string;
  backgroundColor?: string;
}
