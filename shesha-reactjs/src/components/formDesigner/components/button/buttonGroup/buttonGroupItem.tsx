import React, { FC } from 'react';
import { IButtonGroupButton } from '../../../../../providers/buttonGroupConfigurator/models';
import { Button, Tooltip } from 'antd';
import { DeleteFilled, QuestionCircleOutlined } from '@ant-design/icons';
import { useButtonGroupConfigurator } from '../../../../../providers/buttonGroupConfigurator';
import DragHandle from './dragHandle';
import ShaIcon, { IconType } from '../../../../shaIcon';

export interface IButtonGroupItemProps extends IButtonGroupButton {
  index: number[];
}

export const ButtonGroupItem: FC<IButtonGroupItemProps> = props => {
  const { deleteButton, selectedItemId, readOnly } = useButtonGroupConfigurator();

  const onDeleteClick = () => {
    deleteButton(props.id);
  };

  const classes = ['sha-button-group-item'];
  if (selectedItemId === props.id) classes.push('selected');

  return (
    <div className={classes.reduce((a, c) => a + ' ' + c)}>
      <div className="sha-button-group-item-header">
        <DragHandle id={props.id} />
        {props.icon && <ShaIcon iconName={props.icon as IconType} />}
        <span className="sha-button-group-item-name">{props.label || props.name}</span>
        {props.tooltip && (
          <Tooltip title={props.tooltip}>
            <QuestionCircleOutlined className="sha-help-icon" />
          </Tooltip>
        )}
        {!readOnly && (
          <div className="sha-button-group-item-controls">
            <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />
          </div>
        )}
      </div>
    </div>
  );
};

export default ButtonGroupItem;
