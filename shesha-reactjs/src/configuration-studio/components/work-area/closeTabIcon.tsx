import React, { FC } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { createStyles } from '@/styles';
import { CircleFilled } from './circle-icon';

export const useStyles = createStyles(({ css, cx, iconPrefixCls }) => {
  const defaultIcon = "default-icon";
  const hoverIcon = "hover-icon";
  const iconContainer = cx("hover-icon-container", css`
    cursor: pointer;
    transition: color 0.3s ease;

    .${iconPrefixCls} {
        margin: 0 !important;
    }
    .${defaultIcon} {
        display: block;
    }

    .${hoverIcon} {
        display: none;
    }

    &:hover {
        .${defaultIcon} {
            display: none;
        }
        .${hoverIcon} {
            display: block;
        }
    } 
`);
  return {
    iconContainer,
    defaultIcon,
    hoverIcon,
  };
});

export const HoverCloseIcon: FC = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.iconContainer}>
      <CircleFilled className={styles.defaultIcon} />
      <CloseOutlined className={styles.hoverIcon} />
    </div>
  );
};
