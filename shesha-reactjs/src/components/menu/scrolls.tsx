import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import React, { FC } from "react";

interface IScrollButtonProps {
  className?: string | undefined;
  onClick: () => void;
  direction: 'left' | 'right';
}

export const ScrollButton: FC<IScrollButtonProps> = ({
  className,
  onClick,
  direction,
}) => {
  return (
    <div className={className} onClick={onClick}>
      {direction === 'left' ? <LeftOutlined /> : <RightOutlined />}
    </div>
  );
};

export default ScrollButton;
