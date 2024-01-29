import { Layout } from "antd";
import styled from "styled-components";

export const MainLayoutStyle = styled(Layout)`
  min-height: 100vh;

  .ant-layout-header {
    border: none;
    box-shadow: 1px 1px 5px 2px #d7d7d7;
    display: flex;
    justify-content: space-between;
    background: #fff;
    height: 80px;
    border-bottom: 1px solid #d9d9d9;
  }

  .ant-space-item-split {
    .ant-divider-vertical {
      font-size: 40px;
      border-left: 2px solid #d9d9d9;
    }
  }
`;
