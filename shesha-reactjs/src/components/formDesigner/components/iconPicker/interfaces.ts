import { IConfigurableFormComponent } from '../../../../providers/form/models';
import { ColorResult } from 'react-color';

export interface IIconPickerComponentProps extends IConfigurableFormComponent {
    readOnly?: boolean;
    fontSize?: number;
    color?: ColorResult;
    customIcon?: string;
    customColor?: string;
}