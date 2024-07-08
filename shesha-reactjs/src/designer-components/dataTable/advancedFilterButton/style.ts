import { createStyles } from "antd-style";

export const useStyles = createStyles(({ token, css, cx }) => {
    const button = cx("filter-btn", css`
      &.ant-btn-icon-only {
        width: max-content;
        height: max-content;
        padding: 1px 1px;
      }
    `);
    const primaryColor = token.colorPrimary;
    const secondaryColor = token.colorPrimaryBgHover;
    const disabledColor = token.colorTextDisabled;

    return {
        secondaryColor,
        primaryColor,
        disabledColor,
        button
    };
});