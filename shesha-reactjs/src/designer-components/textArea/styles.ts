import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }, { fontWeight, fontFamily, textAlign }) => {

    const textArea = cx("sha-textArea", css`
        .ant-input {
            font-weight: ${fontWeight};
            font-family: ${fontFamily};
            text-align: ${textAlign};
        }
  `);
    return {
        textArea,
    };
});