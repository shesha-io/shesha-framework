import { Layout } from "antd";
import styled from "styled-components";

export const MainLayoutStyle = styled(Layout)`
  min-height: 100vh;

  .ant-layout-header {
    border: none;
    box-shadow: 1px 1px 5px 2px #d7d7d7;
    display: flex;
    justify-content: space-between;
  }

  .ant-space-item-split {
    .ant-divider-vertical {
      font-size: 40px;
      border-left: 2px solid #d9d9d9;
    }
  }

  .sha-login-space {
    .ant-space-item {
      height: 100%;
    }
  }
`;
