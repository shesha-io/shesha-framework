import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token }) => {
    const primary = "primary";
    const info = "info";
    const typographyText = cx("typography-text", css`
        &.ant-form-item-control-input {
          margin: 0px;
          padding: 0px;
        }
          
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