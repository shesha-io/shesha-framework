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
      }
    }

    .sha-login-layout-sign-in {
      display: flex;
      justify-content: center;
      align-items: center;

      .ant-form {
        min-width: 600px;
      }

      @media (max-width: ${screenSize.laptopL}) {
        padding: 10%;

        .ant-form {
          min-width: 80%;
        }
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
