import { IConfigurableFormComponent } from '@/providers/form/models';

export interface IColorPickerComponentProps extends IConfigurableFormComponent {
  title?: string;
  allowClear?: boolean;
  showText?: boolean;
  disabledAlpha?: boolean;
  tooltip?: string;
  stylingBox?: string;
}
