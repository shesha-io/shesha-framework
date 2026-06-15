import { ShaIconTypes } from '@/components/iconPicker';
import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';

export interface IIconPickerComponentProps extends IConfigurableFormComponent {
  fontSize?: number | undefined;
  color?: string | undefined;
  customIcon?: string | undefined;
  customColor?: string | undefined;
  borderWidth?: number | undefined;
  borderColor?: string | undefined;
  borderRadius?: number | undefined;
  backgroundColor?: string | undefined;
  stylingBox?: string | undefined;
  defaultIcon?: ShaIconTypes | undefined;
  textAlign?: string | undefined;
}

export type IconPickerComponentDefinition = ComponentDefinition<"iconPicker", IIconPickerComponentProps>;
