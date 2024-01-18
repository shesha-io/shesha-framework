import React, { FC } from 'react';
import { Button, Tooltip } from 'antd';
import { DeleteFilled, QuestionCircleOutlined } from '@ant-design/icons';
import { useSidebarMenuConfigurator } from '@/providers/sidebarMenuConfigurator';
import DragHandle from './dragHandle';
import ShaIcon, { IconType } from '@/components/shaIcon';
import { ISidebarGroup, ISidebarMenuItem } from '@/interfaces/sidebar';
import classNames from 'classnames';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';

export interface IContainerRenderArgs {
  index?: number[];
  id?: string;
  items: ISidebarMenuItem[];
}

export interface ISidebarMenuGroupProps {
  item: ISidebarGroup;
  index: number[];
  containerRendering: (args: IContainerRenderArgs) => React.ReactNode;
}

export const SidebarMenuGroup: FC<ISidebarMenuGroupProps> = props => {
  const { deleteItem, selectedItemId } = useSidebarMenuConfigurator();
  const { styles } = useStyles();
  const { item } = props;

  const onDeleteClick = () => {
    deleteItem(item.id);
  };

  return (
    <div className={classNames(styles.shaToolbarItem, { selected: selectedItemId === item.id })}>
      <div className={styles.shaToolbarItemHeader}>
        <DragHandle id={item.id} />
        {item.icon && <ShaIcon iconName={item.icon as IconType} />}
        <span className={styles.shaToolbarItemName}>{item.title}</span>
        {item.tooltip && (
          <Tooltip title={item.tooltip}>
            <QuestionCircleOutlined className={styles.shaHelpIcon} />
          </Tooltip>
        )}
        <div className={styles.shaToolbarItemControls}>
          <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />
        </div>
        <div className={styles.shaToolbarGroupContainer}>
          {props.containerRendering({ index: props.index, items: item.childItems ?? [], id: item.id })}
        </div>
      </div>
    </div>
  );
};

export default SidebarMenuGroup;
