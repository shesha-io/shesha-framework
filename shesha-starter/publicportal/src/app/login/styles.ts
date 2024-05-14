import { LoginPageLayout } from "@/components";
import { getPrimaryColor } from "@/styles/utils";
import { lgSpace, smSpace } from "@/styles/variables";
import styled from "styled-components";

export const LoginPageWrapper = styled(LoginPageLayout)`
  * {
    font-family: "Roboto", sans-serif;
  }

  .sha-error {
    margin-top: ${smSpace};

    .ant-alert {
      background: none;
      border: none;
      padding: 0;
    }

    .ant-alert-message {
      color: #dc3545;
      font-family: "Roboto", sans-serif;
      font-size: 15px;
      text-align: center;
    }

    .anticon {
      display: none;
    }
  }

  .sha-space-inline {
    display: flex;
    justify-content: space-between;
    margin-bottom: ${lgSpace};

    .sha-dont-have-password {
      font-size: 15px;
    }

    .sha-forget-password-link {
      color: ${({ colorTheme }) => getPrimaryColor(colorTheme)};
      font-size: 16px;
      font-style: italic;
    }

    .sha-remember-me-check {
      gap: 4px;

      span:last-child {
        font-size: 15px;
      }

      .ant-checkbox-checked {
        .ant-checkbox-inner {
          background: ${({ colorTheme }) => getPrimaryColor(colorTheme)};
          border: ${({ colorTheme }) => getPrimaryColor(colorTheme)};
        }
      }
    }
  }

  .lg-margin-bottom {
    margin-bottom: ${lgSpace} !important;
  }

  .lg-margin-top {
    margin-top: ${lgSpace};
  }
`;
