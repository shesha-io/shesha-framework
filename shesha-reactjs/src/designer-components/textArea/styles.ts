import { createStyles } from '@/styles';
import { CSSProperties } from 'react';

type StylesArgs = {
  fontWeight: string | undefined;
  fontFamily: string | undefined;
  textAlign: string | undefined;
  color: string | undefined;
  fontSize: CSSProperties['fontSize'] | undefined;
};

type StylesResponse = {
  textArea: string;
};

export const useStyles = createStyles<StylesArgs, StylesResponse>(({ css, cx }, { fontWeight, fontFamily, textAlign, color, fontSize }) => {
  const textArea = cx("sha-text-area", css`
        .ant-input {
          ${fontWeight ? `font-weight: ${fontWeight};` : ''}
          ${fontFamily ? `font-family: ${fontFamily};` : ''}
          ${textAlign ? `text-align: ${textAlign};` : ''}
          ${color ? `color: ${color};` : ''}
          ${fontSize ? `font-size: ${fontSize};` : ''}
        }
  `);
  return {
    textArea,
  };
});
