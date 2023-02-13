import React, { FC } from 'react';
import {
  IConfigurableActionColumnsProps,
  IConfigurableColumnsProps,
} from '../../../../../../providers/datatableColumnsConfigurator/models';
import { Button, Tooltip } from 'antd';
import { DeleteFilled, QuestionCircleOutlined } from '@ant-design/icons';
import { useColumnsConfigurator } from '../../../../../../providers/datatableColumnsConfigurator';
import DragHandle from './dragHandle';
import ShaIcon, { IconType } from '../../../../../shaIcon';

export interface IProps extends IConfigurableColumnsProps {
  index: number[];
}

export const Column: FC<IProps> = props => {
  const { deleteColumn: deleteButton, selectedItemId, readOnly } = useColumnsConfigurator();

  const onDeleteClick = () => {
    deleteButton(props.id);
  };

  const classes = ['sha-toolbar-item'];
  if (selectedItemId === props.id) classes.push('selected');

  const actionProps = props.columnType === 'action' ? (props as IConfigurableActionColumnsProps) : null;

  return (
    <div className={classes.reduce((a, c) => a + ' ' + c)}>
      <div className="sha-toolbar-item-header">
        <DragHandle id={props.id} />
        {actionProps && actionProps.icon && <ShaIcon iconName={actionProps.icon as IconType} />}
        <span className="sha-toolbar-item-name">{props.caption}</span>
        {props.description && (
          <Tooltip title={props.description}>
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

export default Column;
