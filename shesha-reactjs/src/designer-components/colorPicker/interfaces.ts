import { IConfigurableFormComponent } from '@/providers/form/models';
import { ComponentDefinition } from '@/interfaces';

export interface IColorPickerComponentProps extends IConfigurableFormComponent {
  title?: string;
  allowClear?: boolean;
  showText?: boolean;
  disabledAlpha?: boolean;
  tooltip?: string | undefined;
  stylingBox?: string | undefined;
}

export type ColorPickerComponentDefinition = ComponentDefinition<"colorPicker", IColorPickerComponentProps>;
