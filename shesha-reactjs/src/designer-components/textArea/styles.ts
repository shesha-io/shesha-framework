import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }, { fontWeight, fontFamily, textAlign, color, fontSize }) => {

    const textArea = cx("sha-text-area", css`
        .ant-input {
            font-weight: ${fontWeight};
            font-family: ${fontFamily};
            text-align: ${textAlign};
            color: ${color};
            font-size: ${fontSize};
        }
  `);
    return {
        textArea,
    };
});