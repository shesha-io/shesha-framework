import { UnAuthedAccountPageLayout } from '@/components/unAuthedAccountPageLayout';
import styled from 'styled-components';

/**
 * There was an error
 * TS4023: Exported variable 'xxx' has or is using name 'zzz' from external module "yyy" but cannot be named.
 *
 * found a solution
 * https://stackoverflow.com/questions/43900035/ts4023-exported-variable-x-has-or-is-using-name-y-from-external-module-but
 *
 */

export const LoginPageWrapper: any = styled(UnAuthedAccountPageLayout)`
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
