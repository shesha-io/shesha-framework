import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token }, { fontWeight, fontFamily, textAlign }) => {

    const textField = cx("sha-textField", css`
        .ant-input {
            font-weight: ${fontWeight};
            font-family: ${fontFamily};
            text-align: ${textAlign};
        }

        :hover {
            border-color: ${token.colorPrimary} !important;
            border-top-color: ${token.colorPrimary} !important;
            border-bottom-color: ${token.colorPrimary} !important;
            border-left-color: ${token.colorPrimary} !important;
        }

  `);
    return {
        textField,
    };
});