import { ShaIconTypes } from '@/components/iconPicker';
import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';
import { CSSProperties } from 'react';

export interface IIconPickerComponentProps extends IConfigurableFormComponent, IInputStyles {
    readOnly?: boolean;
    fontSize?: number;
    color?: string;
    customIcon?: string;
    customColor?: string;
    borderWidth?: number;
    borderColor?: string;
    borderRadius?: number;
    backgroundColor?: string;
    stylingBox?: string;
    defaultIcon?: ShaIconTypes;
    textAlign?: string;
    additionalStyles?: CSSProperties;
};