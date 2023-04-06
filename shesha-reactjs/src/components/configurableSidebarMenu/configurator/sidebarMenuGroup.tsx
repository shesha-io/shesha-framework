import React, { FC } from 'react';
import { Button, Tooltip } from 'antd';
import { DeleteFilled, QuestionCircleOutlined } from '@ant-design/icons';
import { useSidebarMenuConfigurator } from '../../../providers/sidebarMenuConfigurator';
import DragHandle from './dragHandle';
import ShaIcon, { IconType } from '../../shaIcon';
import { ISidebarMenuItem } from '../../../interfaces/sidebar';
import classNames from 'classnames';

export interface IContainerRenderArgs {
  index?: number[];
  id?: string;
  items: ISidebarMenuItem[];
}

export interface ISidebarMenuGroupProps extends ISidebarMenuItem {
  index: number[];
  containerRendering: (args: IContainerRenderArgs) => React.ReactNode;
}

export const SidebarMenuGroup: FC<ISidebarMenuGroupProps> = props => {
  const { deleteItem, selectedItemId } = useSidebarMenuConfigurator();

  const onDeleteClick = () => {
    deleteItem(props.id);
  };

  return (
    <div className={classNames('sha-sidebar-item', { selected: selectedItemId === props.id })}>
      <div className="sha-sidebar-item-header">
        <DragHandle id={props.id} />
        {props.icon && <ShaIcon iconName={props.icon as IconType} />}
        <span className="sha-sidebar-item-name">{props.title}</span>
        {props.tooltip && (
          <Tooltip title={props.tooltip}>
            <QuestionCircleOutlined className="sha-help-icon" />
          </Tooltip>
        )}
        <div className="sha-sidebar-item-controls">
          <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />
        </div>
        <div className="sha-sidebar-group-container">
          {props.containerRendering({ index: props.index, items: props.childItems || [], id: props.id })}
        </div>
      </div>
    </div>
  );
};

export default SidebarMenuGroup;
