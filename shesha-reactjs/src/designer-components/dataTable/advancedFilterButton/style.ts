import { createStyles } from "antd-style";

export const useStyles = createStyles(({ token }) => {

    const primaryColor = token.colorPrimary;
    const secondaryColor = token.colorPrimaryBgHover;
    const buttonDisabledColor = token.colorTextDisabled;

    return {
        secondaryColor,
        primaryColor,
        buttonDisabledColor
    };
});