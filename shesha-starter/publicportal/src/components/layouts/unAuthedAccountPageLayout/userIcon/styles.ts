import { Dropdown } from "antd";
import { smSpace } from "@/styles/variables";
import styled from "styled-components";

export const ShaUserIconStyledWrapper = styled(Dropdown)`
  margin-left: 25px;

  .sha-arrow-down {
    font-size: 14px;
  }

  .sha-user-icon {
    color: #756f86;
    margin-left: 50px;

    .anticon {
      border-radius: 50%;
      border: 2px solid;
      font-size: 22px;
      padding: 2px;
    }
  }

  .sha-user-name {
    color: #000;
    font-size: 16px;
    margin-right: ${smSpace};

    @media (max-width: 500px) {
      display: none;
      visibility: hidden;
    }
  }
`;
