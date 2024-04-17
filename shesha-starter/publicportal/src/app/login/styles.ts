import { LoginPageLayout } from "@/components";
import { lgSpace, mdSpace, smSpace } from "@/styles/variables";
import { getPrimaryColor } from "@/styles/utils";
import styled from "styled-components";

export const LoginPageWrapper = styled(LoginPageLayout)`
  * {
    font-family: "Roboto", sans-serif;
  }

  .sha-oauth-btn {
    display: flex;
    gap: ${smSpace};
    margin: 32px 0;

    .sha-btn-facebook {
      background: #4267b2;
      color: #fff;
      flex: 1;
      width: 50%;
    }

    .sha-btn-google {
      color: #756f86;
      flex: 1;
      width: 50%;

      .anticon {
        color: #de5246;
      }
    }

    @media (max-width: 1700px) {
      display: block;

      .sha-btn-facebook {
        flex: unset;
        width: 100%;
      }

      .sha-btn-google {
        flex: unset;
        margin-bottom: ${mdSpace};
        width: 100%;
      }
    }
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
