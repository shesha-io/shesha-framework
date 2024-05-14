import { UnAuthedAccountPageLayout } from '@/components';
import styled from 'styled-components';

export const LoginPageWrapper = styled(UnAuthedAccountPageLayout)`
  .custom-form-item {
    display: flex;
    justify-content: space-between;
  }

  .activate-link {
    margin-top: 28px;
  }

  .ant-form-item {
    margin-bottom: 12px !important;
  }

  .ant-form-item-with-help {
    .ant-form-item-explain {
      min-height: unset;
    }

    &:not(.ant-form-item-has-error) {
      .ant-form-item-control {
        .ant-form-item-explain {
          display: none;
        }
      }
    }
  }
`;
