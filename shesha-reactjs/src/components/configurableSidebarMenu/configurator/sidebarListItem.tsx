import React, { FC } from 'react';
import { Tooltip, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import ShaIcon, { IconType } from '@/components/shaIcon';
import { ISidebarMenuItem } from '@/interfaces/sidebar';
import { useStyles } from '@/components/listEditor/styles/styles';

const { Text } = Typography;

export interface ISidebarMenuItemProps {
  item: ISidebarMenuItem;
}

export const SidebarListItem: FC<ISidebarMenuItemProps> = ({ item }) => {
  const { styles } = useStyles();

  return (
    <>
      {item.itemType === 'button' && (
        <>
          {item.icon && <ShaIcon iconName={item.icon as IconType} />}
          <span className={styles.listItemName}>{item.title}</span>
          {item.tooltip && (
            <Tooltip title={item.tooltip}>
              <QuestionCircleOutlined className={styles.helpIcon} />
            </Tooltip>
          )}
        </>
      )}
      {item.itemType === 'divider' && (<Text type="secondary">— divider —</Text>)}
      {/* {isDynamicItem(item) && (<DynamicGroupDetails {...item} />)} */}
    </>
  );
};