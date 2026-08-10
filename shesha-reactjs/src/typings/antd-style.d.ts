// src/types/antd-style.d.ts
import 'antd-style';
import type { Interpolation } from '@emotion/react';
import { GlobalTheme } from "antd-style/lib/factories/createGlobalStyle";

declare module 'antd-style' {
  /**
   * Override the signature of createGlobalStyle to support a generic Props type.
   * This matches the actual runtime behavior (based on Emotion).
   */
  export function createGlobalStyle<Props = object>(
    strings: TemplateStringsArray,
    ...interpolations: Array<Interpolation<Props & GlobalTheme>>
  ): React.NamedExoticComponent<Props>;
}
