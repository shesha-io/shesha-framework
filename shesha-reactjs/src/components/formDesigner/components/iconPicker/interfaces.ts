import { IConfigurableFormComponent } from '@/providers/form/models';

export interface IIconPickerComponentProps extends IConfigurableFormComponent {
    readOnly?: boolean;
    fontSize?: number;
    color?: string;
    customIcon?: string;
    customColor?: string;
}