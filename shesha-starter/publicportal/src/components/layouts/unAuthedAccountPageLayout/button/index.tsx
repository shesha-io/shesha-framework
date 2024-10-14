import { BaseButtonProps } from "antd/lib/button/button";
import { FC, MouseEventHandler } from "react";
import { ShaButtonStyledWrapper } from "./styles";

interface IProps<T = any> extends BaseButtonProps {
  htmlType?: "button" | "submit" | "reset";
  onClick?: MouseEventHandler<T> | undefined;
}

const ShaButton: FC<IProps> = ({ children, ...props }) => (
  <ShaButtonStyledWrapper {...props}>{children}</ShaButtonStyledWrapper>
);

export default ShaButton;
