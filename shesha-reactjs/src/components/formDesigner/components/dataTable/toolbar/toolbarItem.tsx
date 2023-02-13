import React, { FC } from 'react';
import { IToolbarButton } from '../../../../../providers/toolbarConfigurator/models';
import { Button, Tooltip } from 'antd';
import { DeleteFilled, QuestionCircleOutlined } from '@ant-design/icons';
import { useToolbarConfigurator } from '../../../../../providers/toolbarConfigurator';
import DragHandle from './dragHandle';
import ShaIcon, { IconType } from '../../../../shaIcon';

export interface IToolbarItemProps extends IToolbarButton {
  index: number[];
}

export const ToolbarItem: FC<IToolbarItemProps> = props => {
  const { deleteButton, selectedItemId, readOnly } = useToolbarConfigurator();

  const onDeleteClick = () => {
    deleteButton(props.id);
  };

  const classes = ['sha-toolbar-item'];
  if (selectedItemId === props.id) classes.push('selected');

  return (
    <div className={classes.reduce((a, c) => a + ' ' + c)}>
      <div className="sha-toolbar-item-header">
        <DragHandle id={props.id} />
        {props.icon && <ShaIcon iconName={props.icon as IconType} />}
        <span className="sha-toolbar-item-name">{props.name}</span>
        {props.tooltip && (
          <Tooltip title={props.tooltip}>
            <QuestionCircleOutlined className="sha-help-icon" />
          </Tooltip>
        )}
        {!readOnly && (
          <div className="sha-toolbar-item-controls">
            <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolbarItem;
