import { Modal } from 'antd';
import { UnAuthedAccountPageLayout } from '@/components';
import styled from 'styled-components';

export const ForgotPasswordPage = styled(UnAuthedAccountPageLayout)`
  .back-to-login-btn {
    text-align: center;
  }
`;

// The style below should be outside as the modal will not be nested within this page
export const VerifyOtpModal = styled(Modal)`
  .ant-alert {
    margin-bottom: 10px;

    &:not(.ant-alert-error) {
      text-align: center;
    }
  }
`;
