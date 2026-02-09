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
}) => (
  <div
    className={styles.scrollButtons}
    style={{
      background: containerStyle?.background,
      backgroundColor: containerStyle?.backgroundColor,
    }}
  >
    <div
      className={styles.scrollButton}
      onClick={scrollLeft}
      style={{
        background: containerStyle?.background,
        backgroundColor: containerStyle?.backgroundColor,
      }}
    >
      <LeftOutlined />
    </div>
    <div
      className={styles.scrollButton}
      onClick={scrollRight}
      style={{
        background: containerStyle?.background,
        backgroundColor: containerStyle?.backgroundColor,
      }}
    >
      <RightOutlined />
    </div>
  </div>
);

export default ScrollControls;
