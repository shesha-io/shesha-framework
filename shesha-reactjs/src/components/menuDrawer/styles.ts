import { Drawer } from "antd";
import { smSpace } from "@/styles/variables";
import styled from "styled-components";

export const ShaMenuDrawerStyledWrapper = styled<any>(Drawer)`
  .ant-drawer-body {
    padding: 0;

    .menu-item {
      color: #000;
      display: flex;
      justify-content: space-between;
      padding: ${smSpace} 24px;

      &:hover {
        background: #efefef;
        cursor: pointer;
      }

      .sha-icon {
        color: #7f959b;
        font-size: 19px;
        font-weight: 200;
        margin-right: ${smSpace};
      }
    }
  }
`;
