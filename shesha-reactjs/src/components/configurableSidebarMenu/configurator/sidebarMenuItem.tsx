import React, { FC } from 'react';
import { Button, Tooltip } from 'antd';
import { DeleteFilled, QuestionCircleOutlined } from '@ant-design/icons';
import { useSidebarMenuConfigurator } from '../../../providers/sidebarMenuConfigurator';
import DragHandle from './dragHandle';
import ShaIcon, { IconType } from '../../shaIcon';
import classNames from 'classnames';
import { ISidebarMenuItem } from '../../../interfaces/sidebar';

export interface IProps extends ISidebarMenuItem {
  index: number[];
}

export const SidebarMenuItem: FC<IProps> = props => {
  const { deleteItem, selectedItemId } = useSidebarMenuConfigurator();

  const onDeleteClick = () => {
    deleteItem(props.id);
  };

  const { icon } = props;

  const renderedIcon = icon ? (
    typeof icon === 'string' ? (
      <ShaIcon iconName={icon as IconType} />
    ) : React.isValidElement(icon) ? (
      icon
    ) : null
  ) : null;

  return (
    <div className={classNames('sha-sidebar-item', { selected: selectedItemId === props.id })}>
      <div className="sha-sidebar-item-header">
        <DragHandle id={props.id} />
        {renderedIcon}
        <span className="sha-sidebar-item-name">{props.title}</span>

        {props.tooltip && (
          <Tooltip title={props.tooltip}>
            <QuestionCircleOutlined className="sha-help-icon" />
          </Tooltip>
        )}
        <div className="sha-sidebar-item-controls">
          <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />
        </div>
      </div>
    </div>
  );
};

export default SidebarMenuItem;
