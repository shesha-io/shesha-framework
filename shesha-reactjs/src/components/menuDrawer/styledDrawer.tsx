import { smSpace } from "@/styles/variables";
import { Drawer, DrawerProps } from "antd";
import { createStyles } from "antd-style";
import React, { FC } from "react";

const useStyles = createStyles(({ css }) => ({
  drawerBody: css`
    padding: 0;

    .menu-item {
      color: #000;
      display: flex;
      justify-content: space-between;
      padding: ${smSpace} 24px;

      &:hover {
        background: #efefef;
        cursor: pointer;
      }

      .sha-icon {
        color: #7f959b;
        font-size: 19px;
        font-weight: 200;
        margin-right: ${smSpace};
      }
    }
  `,
}));

export const ShaMenuDrawerStyledWrapper: FC<DrawerProps> = (props) => {
  const { styles } = useStyles();
  return <Drawer {...props} rootClassName={styles.drawerBody} />;
};
