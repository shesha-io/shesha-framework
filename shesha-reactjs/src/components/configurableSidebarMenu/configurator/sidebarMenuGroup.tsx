import React, { FC } from 'react';
import { Button, Tooltip } from 'antd';
import { DeleteFilled, QuestionCircleOutlined } from '@ant-design/icons';
import { useSidebarMenuConfigurator } from '@/providers/sidebarMenuConfigurator';
import DragHandle from './dragHandle';
import ShaIcon, { IconType } from '@/components/shaIcon';
import { ISidebarGroup, ISidebarMenuItem } from '@/interfaces/sidebar';
import classNames from 'classnames';

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
  const { item } = props;

  const onDeleteClick = () => {
    deleteItem(item.id);
  };

  return (
    <div className={classNames('sha-sidebar-item', { selected: selectedItemId === item.id })}>
      <div className="sha-sidebar-item-header">
        <DragHandle id={item.id} />
        {item.icon && <ShaIcon iconName={item.icon as IconType} />}
        <span className="sha-sidebar-item-name">{item.title}</span>
        {item.tooltip && (
          <Tooltip title={item.tooltip}>
            <QuestionCircleOutlined className="sha-help-icon" />
          </Tooltip>
        )}
        <div className="sha-sidebar-item-controls">
          <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />
        </div>
        <div className="sha-sidebar-group-container">
          {props.containerRendering({ index: props.index, items: item.childItems ?? [], id: item.id })}
        </div>
      </div>
    </div>
  );
};

export default SidebarMenuGroup;
