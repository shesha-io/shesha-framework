import { IConfigurableFormComponent } from "@/providers";

export interface ISizeComponentProps extends IConfigurableFormComponent {
    value?: IDimensionsValue;
    onChange?: Function;
}

export interface IInputUnits {
    value: number | string;
    unit: string;
}

export interface IDimensionsValue {
    width?: IInputUnits;
    height?: IInputUnits;
    minWidth?: IInputUnits;
    minHeight?: IInputUnits;
    maxWidth?: IInputUnits;
    maxHeight?: IInputUnits;
    overflow?: string;
}

export interface ISizeType {
    onChange?: (value) => void;
    value?: IDimensionsValue;
    readOnly?: boolean;
    model?: any;
    noOverflow?: boolean;
    renderSettingsItem?: (name: string, label: string, component: React.ReactNode) => React.ReactNode;
}