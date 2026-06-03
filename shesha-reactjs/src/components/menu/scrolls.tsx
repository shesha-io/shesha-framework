import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import React, { FC } from "react";

interface IScrollButtonProps {
  styles: { [key in string]: any };
  onClick: () => void;
  direction: 'left' | 'right';
}

export const ScrollButton: FC<IScrollButtonProps> = ({
  styles,
  onClick,
  direction,
}) => {
  return (
    <div className={styles.scrollButton} onClick={onClick}>
      {direction === 'left' ? <LeftOutlined /> : <RightOutlined />}
    </div>
  );
};

export default ScrollButton;
