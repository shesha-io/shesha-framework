import { DeleteFilled, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import classNames from 'classnames';
import React, { FC } from 'react';
import { useTableViewSelectorConfigurator } from '@/providers/tableViewSelectorConfigurator';
import { ITableViewProps } from '@/providers/tableViewSelectorConfigurator/models';
import DragHandle from './dragHandle';

export interface IFilterItemProps extends ITableViewProps {
  index: number[];
}

export const FilterItem: FC<IFilterItemProps> = (props) => {
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
