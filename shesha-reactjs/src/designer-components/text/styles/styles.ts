import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx, token }) => {
    const primary = "primary";
    const info = "info";
    const typographyText = cx("typography-text", css`
        &.primary {
          color: ${token.colorPrimary};
        }
      
        &.info {
          color: ${token.colorInfo}
        }
    `);
    return {
        typographyText,
        primary,
        info,
    };
});