import { BaseButtonProps } from "antd/lib/button/button";
import { FC } from "react";
import { ShaButtonStyledWrapper } from "./styles";

interface IProps extends BaseButtonProps {
  htmlType?: "button" | "submit" | "reset";
}

const ShaButton: FC<IProps> = ({ children, ...props }) => (
  <ShaButtonStyledWrapper {...props}>{children}</ShaButtonStyledWrapper>
);

export default ShaButton;
