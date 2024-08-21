import { createStyles } from '@/styles';
import { sheshaStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
    const shaValidationErrorAlert = cx("sha-validation-error-alert", css`
        margin-bottom: ${sheshaStyles.paddingMD}px !important;
  `);
    return {
        shaValidationErrorAlert,
    };
});