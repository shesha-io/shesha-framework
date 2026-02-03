import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
    const shaPhoneNumberWrapper = cx("sha-phone-number-wrapper", css`
        width: 100%;

        /* Main phone input wrapper - created by the antd-phone-input component */
        .ant-phone-input-wrapper {
            width: 100%;
        }

        /* Antd Input wrappers - maintain full width */
        .ant-input-group-wrapper {
            width: 100%;
        }

        .ant-input-wrapper {
            width: 100%;
        }

        .ant-input-group {
            width: 100%;
        }

        /* The actual phone number input field - make transparent so parent styles show through */
        .ant-input {
            width: 100%;
            background: transparent !important;
        }

        /* Make the dropdown selector transparent too for consistency */
        .ant-input-group-addon {
            background: transparent !important;

            .ant-select {
                .ant-select-selector {
                    background: transparent !important;
                }
            }
        }
    `);

    const shaPhoneNumberValidationMessage = cx("sha-phone-number-validation-message", css`
        color: #ff4d4f;
        font-size: 14px;
        margin-top: 4px;
        line-height: 1.5715;
    `);

    return {
        shaPhoneNumberWrapper,
        shaPhoneNumberValidationMessage,
    };
});
