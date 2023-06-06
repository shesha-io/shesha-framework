import { Drawer } from "antd";
import { smSpace } from "src/styles/global";
import styled from "styled-components";

export const ShaMenuDrawerWrapper = styled(Drawer)`
  .ant-drawer-body {
    padding: 0;

    .menu-item {
      padding: ${smSpace} 24px;

      &:hover {
        background: #efefef;
        cursor: pointer;
      }

      .anticon {
        color: #7f959b;
        font-size: 19px;
        font-weight: 200;
        margin-right: ${smSpace};
      }
    }
  }
`;
