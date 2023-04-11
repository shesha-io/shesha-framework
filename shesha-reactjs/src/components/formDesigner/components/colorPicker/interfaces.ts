import { IConfigurableFormComponent } from '../../../../providers/form/models';
import { ColorResult } from 'react-color';

export interface IColorPickerComponentProps extends IConfigurableFormComponent {
    title?: string;
    color?: ColorResult;
}