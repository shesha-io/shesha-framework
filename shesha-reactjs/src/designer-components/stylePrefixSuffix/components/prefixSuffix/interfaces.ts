import { IConfigurableFormComponent } from "@/providers";

export interface ISizeComponentProps extends IConfigurableFormComponent {
    value?: IValue;
    onChange?: Function;
}

export interface IInputUnits {
    unit?: string;
}

export interface IValue {
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
}