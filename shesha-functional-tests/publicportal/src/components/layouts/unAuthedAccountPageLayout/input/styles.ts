import { Form } from "antd";
import { lgSpace } from "src/styles/global";
import styled from "styled-components";

export const ShaInputStyledWrapper = styled(Form.Item)`
  margin-bottom: ${lgSpace} !important;

  * {
    margin: 0;
    padding: 0;
  }

  .ant-input {
    padding: 12px 16px !important;
  }

  .ant-input-suffix {
    .ant-input-password-icon {
      padding: 12px;
    }
  }

  .sha-input {
    border-radius: 5px;
    box-shadow: 0px 2px 4px 0px #ededed;
  }

  .sha-input-error {
    border-color: red;
  }

  .sha-input-label {
    color: #4a4a4a;
    display: block;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 8px;
  }
`;
