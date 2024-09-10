import { IConfigurableFormComponent } from '@/providers/form/models';

export interface IColorPickerComponentProps extends IConfigurableFormComponent {
    title?: string;
    showText?: boolean;
    disabledAlpha?: boolean;
}