import { createStyles } from "antd-style";

export const useStyles = createStyles(({ token }) => {

    const primaryColor = token.colorPrimary;
    const secondaryColor = token.colorPrimaryBgHover;
    const disabledColor = token.colorTextDisabled;

    return {
        secondaryColor,
        primaryColor,
        disabledColor
    };
});