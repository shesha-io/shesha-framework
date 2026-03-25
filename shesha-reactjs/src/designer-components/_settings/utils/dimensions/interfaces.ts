import { IConfigurableFormComponent } from "@/providers";

export interface IDimensionsProps extends IConfigurableFormComponent {
  value?: IDimensionsValue;
  onChange?: Function;
}

export interface IDimensionsValue {
  width?: string | number | undefined;
  height?: string | number | undefined;
  minWidth?: string | number | undefined;
  minHeight?: string | number | undefined;
  maxWidth?: string | number | undefined;
  maxHeight?: string | number | undefined;
}

export interface IDimensionsType {
  readOnly?: boolean;
  value?: IDimensionsValue;
}
