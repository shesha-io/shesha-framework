import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import React, { FC } from "react";

interface IProps {
  styles: { [key in string]: any };
  scrollLeft: () => void;
  scrollRight: () => void;
  containerStyle?: React.CSSProperties;
}

export const ScrollControls: FC<IProps> = ({
  styles,
  scrollLeft,
  scrollRight,
  containerStyle,
}) => {
  const bgStyle = containerStyle
    ? { background: containerStyle.background, backgroundColor: containerStyle.backgroundColor }
    : undefined;

  return (
    <div className={styles.scrollButtons} style={bgStyle}>
      <div className={styles.scrollButton} onClick={scrollLeft} style={bgStyle}>
        <LeftOutlined />
      </div>
      <div className={styles.scrollButton} onClick={scrollRight} style={bgStyle}>
        <RightOutlined />
      </div>
    </div>
  );
};

export default ScrollControls;
