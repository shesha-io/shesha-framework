import React, { FC } from 'react';
import { Tooltip, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import ShaIcon, { IconType } from '@/components/shaIcon';
import { ISidebarMenuItem } from '@/interfaces/sidebar';
import { useStyles } from '@/components/listEditor/styles/styles';
import { getActualModel, useAvailableConstantsData } from '@/index';

const { Text } = Typography;

export interface ISidebarMenuItemProps {
  item: ISidebarMenuItem;
}

export const SidebarListItem: FC<ISidebarMenuItemProps> = ({ item }) => {
  const { styles } = useStyles();
  const allData = useAvailableConstantsData();
  const actialItem = getActualModel(item, allData);

  return (
    <>
      {actialItem.itemType === 'button' && (
        <>
          {actialItem.icon && <ShaIcon iconName={actialItem.icon as IconType} />}
          <span className={styles.listItemName}>{actialItem.title}</span>
          {actialItem.tooltip && (
            <Tooltip title={actialItem.tooltip}>
              <QuestionCircleOutlined className={styles.helpIcon} />
            </Tooltip>
          )}
        </>
      )}
      {actialItem.itemType === 'divider' && (<Text type="secondary">— divider —</Text>)}
      {/* {isDynamicItem(actialItem) && (<DynamicGroupDetails {...actialItem} />)} */}
    </>
  );
};