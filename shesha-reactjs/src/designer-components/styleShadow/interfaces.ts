import { IConfigurableFormComponent } from "@/providers";

export interface IShadowComponentProps extends IConfigurableFormComponent {
    value?: IShadowValue;
    onChange?: Function;
    readonly?: boolean;
};

interface IValue {
    offsetX?: number;
    offsetY?: number;
    blurRadius?: number;
    spreadRadius?: number;
    color: string;
}
export interface IShadowValue {
    type: 'text' | 'box';
    text?: IValue;
    box?: IValue;
};