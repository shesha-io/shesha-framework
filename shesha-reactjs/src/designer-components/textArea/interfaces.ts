import { IConfigurableFormComponent } from '@/providers/form/models';

export interface ITextAreaComponentProps extends IConfigurableFormComponent {
  placeholder?: string;
  showCount?: boolean;
  autoSize?: boolean;
  allowClear?: boolean;
  hideBorder?: boolean;
  initialValue?: string;
  passEmptyStringByDefault?: boolean;
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