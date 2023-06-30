export interface IColor {
  hsl: IHsl;
  hex: string;
  rgb: IRgb;
  hsv: IHsv;
  oldHue: number;
  source: string;
}

export interface IHsl {
  h: number;
  s: number;
  l: number;
  a: number;
}

export interface IRgb {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface IHsv {
  h: number;
  s: number;
  v: number;
  a: number;
}
