import { screenSize } from "@/styles/variables";
import styled from "styled-components";

export const LoginLayoutContainer = styled.div`
  height: 100vh;
  width: 100%;

  .sha-login-layout {
    display: flex;
    height: 100%;

    .sha-login-layout-logo {
      background: #eaeaea;

      .ant-image {
        display: flex;
        margin: auto;
        justify-content: center;
        align-items: center;
        height: 100%;

        .sha-login-layout-logo-icon {
        }
      }
    }

    .sha-login-layout-sign-in {
      padding: 200px;

      @media (max-width: ${screenSize.laptopL}) {
        padding: 10%;
      }

      @media (max-width: ${screenSize.laptop}) {
        padding: 7%;
      }

      @media (max-width: ${screenSize.tablet}) {
        padding: 12%;
      }
    }
  }
`;
