import { IConfigurableFormComponent } from "@/providers";

export interface IFontComponentProps extends IConfigurableFormComponent {
  font?: IFontValue;
  onChange?: Function;
}

export interface IFontValue {
  size?: number;
  type?: string;
  weight?: string;
  color?: string;
  align?: AlignSetting;
  transform?: string;
}
