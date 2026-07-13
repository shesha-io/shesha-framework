import { IConfigurableFormComponent } from "@/providers";

export type IBorderType = "dashed" | "dotted" | "none" | "solid";
export type BorderStyle = {
  width?: string | number | undefined;
  unit?: string | undefined;
  color?: string | undefined;
  style?: IBorderType | undefined;
};

export type BorderType = "all" | "top" | "right" | "bottom" | "left" | "middle";

export interface IBorderValue {
  radius?: {
    all?: string | number | undefined;
    topLeft?: string | number | undefined;
    topRight?: string | number | undefined;
    bottomLeft?: string | number | undefined;
    bottomRight?: string | number | undefined;
  };
  border?: {
    [key in BorderType]?: BorderStyle | undefined;
  } | undefined;
  radiusType?: string | undefined;
  borderType?: BorderType | 'custom' | undefined;
  hideBorder?: boolean | undefined;
}

export interface IBorderProps extends IConfigurableFormComponent {
  onChange?: (value: IBorderValue) => void;
  value?: IBorderValue;
}
