import { IConfigurableFormComponent } from "@/providers";

export interface IFontComponentProps extends IConfigurableFormComponent {
    font?: IFontValue;
    onChange?: Function;
}

export interface IFontValue {
    size?: number;
    type?: string;
    weight?: number;
    color?: string;
    align?: AlignSetting;
    transform?: string;
}