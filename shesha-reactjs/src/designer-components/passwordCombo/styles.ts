import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }, { fontWeight, fontFamily, textAlign }) => {

    const textField = cx("sha-textField", css`
        .ant-input {
            font-weight: ${fontWeight};
            font-family: ${fontFamily};
            text-align: ${textAlign};
        }
  `);
    return {
        textField,
    };
});