import styled from 'styled-components';

/**
 * There was an error
 * TS4023: Exported variable 'xxx' has or is using name 'zzz' from external module "yyy" but cannot be named.
 *
 * found a solution
 * https://stackoverflow.com/questions/43900035/ts4023-exported-variable-x-has-or-is-using-name-y-from-external-module-but
 *
 */

export const UnAuthedLayoutContainer: any = styled.div`
  display: flex;
  overflow-x: hidden;
  background: #ebeeef;
  height: 100vh;
  align-items: center;

  .un-authed-account-page-layout-form-container {
    width: 100%;
    margin-bottom: 45px;

    .un-authed-account-page-layout-heading,
    .un-authed-account-page-layout-hint {
      text-align: center;
    }

    .un-authed-account-page-layout-form {
      .un-authed-account-page-layout-logo {
        display: flex;
        justify-content: center;
        margin-bottom: 15px;

        img {
          height: 120px;
        }
      }

      .ant-alert {
        text-align: left;
        margin-bottom: 10px;
      }

      .ant-row {
        &.ant-form-item {
          margin-bottom: 20px;

          &.un-authed-btn-container {
            margin-bottom: 15px;
          }
        }
      }

      .ant-form-item-control:not(.has-error) {
        .ant-form-explain {
          display: none !important;
        }
      }
    }
  }
`;
