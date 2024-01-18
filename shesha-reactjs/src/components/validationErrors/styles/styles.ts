import { createStyles } from "antd-style";
import { sheshaStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
    const shaValidationErrorAlert = cx("sha-validation-error-alert", css`
        margin-bottom: ${sheshaStyles.paddingMD}px !important;
  `);
    return {
        shaValidationErrorAlert,
    };
});