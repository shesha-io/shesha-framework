import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import React, { FC } from "react";

interface IProps {
  styles: { [key in string]: any };
  scrollLeft: () => void;
  scrollRight: () => void;
}

export const ScrollControls: FC<IProps> = ({
  styles,
  scrollLeft,
  scrollRight
}) => (
  <div className={styles.scrollButtons}>
    <div className={styles.scrollButton} onClick={scrollLeft}>
      <LeftOutlined />
    </div>
    <div className={styles.scrollButton} onClick={scrollRight}>
      <RightOutlined />
    </div>
  </div>
);

export default ScrollControls;
