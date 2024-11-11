import { IConfigurableFormComponent } from "@/providers";

export interface IDimensionsProps extends IConfigurableFormComponent {
    value?: IDimensionsValue;
    onChange?: Function;
}

export interface IDimensionsValue {
    width?: string;
    height?: string;
    minWidth?: string;
    minHeight?: string;
    maxWidth?: string;
    maxHeight?: string;
    overflow?: string;
}

export interface IDimensionsType {
    readOnly?: boolean;
    value?: IDimensionsValue;
    noOverflow?: boolean;
}