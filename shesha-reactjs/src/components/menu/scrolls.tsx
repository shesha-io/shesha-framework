import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import React, { FC } from "react";

interface IProps {
  scrollButtonClassName: string;
  scrollButtonsClassName: string;
  scrollLeft: () => void;
  scrollRight: () => void;
  containerStyle?: React.CSSProperties | undefined;
}

export const ScrollControls: FC<IProps> = ({
  scrollButtonsClassName,
  scrollButtonClassName,
  scrollLeft,
  scrollRight,
  containerStyle,
}) => {
  const bgStyle = containerStyle
    ? { background: containerStyle.background, backgroundColor: containerStyle.backgroundColor }
    : undefined;

  return (
    <div className={scrollButtonsClassName} style={bgStyle}>
      <div className={scrollButtonClassName} onClick={scrollLeft} style={bgStyle}>
        <LeftOutlined />
      </div>
      <div className={scrollButtonClassName} onClick={scrollRight} style={bgStyle}>
        <RightOutlined />
      </div>
    </div>
  );
};

export default ScrollControls;
