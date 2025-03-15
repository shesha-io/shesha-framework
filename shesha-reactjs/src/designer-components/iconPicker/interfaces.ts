import { ShaIconTypes } from '@/components/iconPicker';
import { IConfigurableFormComponent } from '@/providers/form/models';

export interface IIconPickerComponentProps extends IConfigurableFormComponent {
    readOnly?: boolean;
    fontSize?: string;
    color?: string;
    customIcon?: string;
    customColor?: string;
    borderWidth?: string;
    borderColor?: string;
    borderRadius?: string;
    backgroundColor?: string;
    stylingBox?: string;
    defaultIcon?: ShaIconTypes;
    textAlign?: string;
    width?: string;
    height?: string;
    fontWeight?: string;
    borderStyle?: 'dotted' | 'solid' | 'dashed';
}