import { Form } from "antd";
import styled from "styled-components";

export const ShaInputStyledWrapper = styled(Form.Item)`
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

  .sha-input-comp {
    border-radius: 5px;
    box-shadow: 0px 2px 4px 0px #ededed;
  }

  .sha-input-comp-error {
    border-color: red;
  }

  .sha-input-comp-label {
    color: #4a4a4a;
    display: block;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 8px;
  }
`;
