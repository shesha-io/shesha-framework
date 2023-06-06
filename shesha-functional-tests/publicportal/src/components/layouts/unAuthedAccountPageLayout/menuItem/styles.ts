import { smSpace } from "src/styles/global";
import styled from "styled-components";

export const ShaMenuItemStyledWrapper = styled.ul`
  display: flex;
  height: 100%;
  list-style-type: none;
  margin: 0;
  padding: 0;
  overflow: hidden;

  .list-item {
    color: #000;
    display: flex;
    font-size: ${smSpace};
    padding: 0 25px;

    &:hover {
      background: #efefef;
      cursor: pointer;
      overflow: hidden;
    }

    .anticon {
      color: #7f959b;
      font-size: 19px;
      font-weight: 200;
      line-height: 4.5;
      margin-right: ${smSpace};
    }
  }
`;
