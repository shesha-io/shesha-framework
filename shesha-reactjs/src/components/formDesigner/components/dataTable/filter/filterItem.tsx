import React, { FC } from 'react';
import { ITableViewProps } from '../../../../../providers/tableViewSelectorConfigurator/models';
import { Button, Tooltip } from 'antd';
import { DeleteFilled, QuestionCircleOutlined } from '@ant-design/icons';
import { useTableViewSelectorConfigurator } from '../../../../../providers/tableViewSelectorConfigurator';
import DragHandle from './dragHandle';
import classNames from 'classnames';

export interface IFilterItemProps extends ITableViewProps {
  index: number[];
}

export const FilterItem: FC<IFilterItemProps> = props => {
  const { deleteItem: deleteButton, selectedItemId, readOnly } = useTableViewSelectorConfigurator();

  const onDeleteClick = () => {
    deleteButton(props.id);
  };

  return (
    <div className={classNames('sha-toolbar-item', { selected: selectedItemId === props.id })}>
      <div className="sha-toolbar-item-header">
        <DragHandle id={props.id} />
        {props.name}
        {props.tooltip && (
          <Tooltip title={props.tooltip} className="sha-tooltip-icon">
            <QuestionCircleOutlined />
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

export default FilterItem;
