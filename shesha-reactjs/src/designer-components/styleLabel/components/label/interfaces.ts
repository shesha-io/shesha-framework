import { IConfigurableFormComponent, LabelAlign } from "@/providers";

export interface ILabelComponentProps extends IConfigurableFormComponent {
    value?: ILabelValue;
    onChange?: Function;
}

export interface ILabelValue {
    label: string;
    hidden?: boolean;
    align?: LabelAlign;
}