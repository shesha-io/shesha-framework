import UnAuthedAccountPageLayout from '@/components/unAuthedAccountPageLayout';
import { Modal } from 'antd';
import styled from 'styled-components';

/**
 * There was an error
 * [!] (plugin typescript) RollupError: @rollup/plugin-typescript
 * TS4023: Exported variable 'ForgotPasswordPage' has or is using name 'IStyledComponentBase' from external module "D:/a/1/s/shesha-reactjs/node_modules/styled-components/dist/types" but cannot be named.
 * src/app-components/pages/account/forgot-password/styles.ts (5:14)
 *
 * found a solution
 * https://stackoverflow.com/questions/43900035/ts4023-exported-variable-x-has-or-is-using-name-y-from-external-module-but
 *
 */

export const ForgotPasswordPage: any = styled(UnAuthedAccountPageLayout)`
  .back-to-login-btn {
    text-align: center;
  }
`;

// The style below should be outside as the modal will not be nested within this page
export const VerifyOtpModal: any = styled(Modal)`
  .ant-alert {
    margin-bottom: 10px;

    &:not(.ant-alert-error) {
      text-align: center;
    }
  }
`;
