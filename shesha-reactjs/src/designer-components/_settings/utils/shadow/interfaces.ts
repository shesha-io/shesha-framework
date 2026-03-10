import { IConfigurableFormComponent } from "@/providers";

export interface IShadowComponentProps extends IConfigurableFormComponent {
  value?: IShadowValue;
  onChange?: Function;
  readonly?: boolean;
};

export interface IShadowValue {
  offsetX?: number;
  offsetY?: number;
  blurRadius?: number;
  spreadRadius?: number;
  color: string;
}
