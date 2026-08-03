export interface IDimensionsValue {
  width?: string | number | undefined;
  height?: string | number | undefined;
  minWidth?: string | number | undefined;
  minHeight?: string | number | undefined;
  maxWidth?: string | number | undefined;
  maxHeight?: string | number | undefined;
  gridColumn?: number | undefined;
  gridRow?: number | undefined;
}

export interface IDimensionsType {
  readOnly?: boolean;
  value?: IDimensionsValue;
}
