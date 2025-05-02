import React, { FC } from 'react';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import ShaIcon, { IconType } from '@/components/shaIcon';
import { ISidebarGroup, ISidebarMenuItem } from '@/interfaces/sidebar';
import { useStyles } from '@/components/listEditor/styles/styles';
import { ItemChangeDetails } from '@/components/listEditor';
import { useActualContextData } from '@/hooks';

export interface IContainerRenderArgs {
  id?: string;
  items: ISidebarMenuItem[];
  onChange: (newValue: ISidebarMenuItem[], changeDetails: ItemChangeDetails) => void;
}

export interface ISidebarMenuGroupProps {
  item: ISidebarGroup;
  onChange: (newValue: ISidebarGroup, changeDetails: ItemChangeDetails) => void;
  containerRendering: (args: IContainerRenderArgs) => React.ReactNode;
}

export const SidebarListGroup: FC<ISidebarMenuGroupProps> = ({ item, onChange, containerRendering }) => {
  const { styles } = useStyles();
  const actialItem = useActualContextData(item);
  return (
    <>
      {actialItem.icon && <ShaIcon iconName={actialItem.icon as IconType} />}
      <span className={styles.listItemName}>{actialItem.title}</span>
      {actialItem.tooltip && (
        <Tooltip title={actialItem.tooltip}>
          <QuestionCircleOutlined className={styles.helpIcon} />
        </Tooltip>
      )}
      {containerRendering({
        items: item.childItems || [],
        onChange: (newItems, changeDetails) => {
          onChange({ ...item, childItems: [...newItems] }, changeDetails);
        }
      })}
    </>
  );
};