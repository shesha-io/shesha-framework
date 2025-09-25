import { createStyles, sheshaStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, prefixCls }) => {
  const shaValidationErrorAlert = cx("sha-validation-error-alert", css`

        .${prefixCls}-alert-description {
            >ul {
                margin: 0px ${sheshaStyles.paddingMD}px;
                padding: 0px 20px;
            }
        }
  `);
  return {
    shaValidationErrorAlert,
  };
});
