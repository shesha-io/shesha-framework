import { createStyles } from '@/styles';
import { sheshaStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, prefixCls }) => {
    const shaValidationErrorAlert = cx("sha-validation-error-alert", css`
        margin-bottom: ${sheshaStyles.paddingMD}px !important;
        padding: ${sheshaStyles.paddingLG}px !important;

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