import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }, { fontWeight, fontFamily, textAlign }) => {

    const numberField = cx("sha-inputNumber", css`
        .ant-input {
            font-weight: ${fontWeight};
            font-family: ${fontFamily};
            text-align: ${textAlign};
        }
  `);
    return {
        numberField,
    };
});