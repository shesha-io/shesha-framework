import { DeleteFilled, QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Space, Tooltip } from 'antd';
import classNames from 'classnames';
import React, { FC, useState } from 'react';
import { useTableViewSelectorConfigurator } from '@/providers/tableViewSelectorConfigurator';
import { ITableViewProps } from '@/providers/tableViewSelectorConfigurator/models';
import DragHandle from './dragHandle';

export interface IProps extends ITableViewProps {
  index: number[];
  onConfigClick?: (selectedItemId: string) => void;
}

interface ITableViewState {
  edit?: boolean;
  text?: string;
}

export const TableView: FC<IProps> = ({ onConfigClick, tooltip, id, name }) => {
  const { deleteItem: deleteButton, selectedItemId, readOnly } = useTableViewSelectorConfigurator();
  const [] = useState<ITableViewState>();

  const onDeleteClick = () => {
    deleteButton(id);
  };

  const onEditBtnClick = () => {
    if (onConfigClick) {
      onConfigClick(id);
    }
  };

  return (
    <div className={classNames('sha-toolbar-item', { selected: selectedItemId === id })}>
      <div className="sha-toolbar-item-header">
        <DragHandle id={id} />
        <Space>
          {name}

          {tooltip && (
            <Tooltip title={tooltip} className="sha-tooltip-icon">
              <QuestionCircleOutlined />
            </Tooltip>
          )}
        </Space>
        <div className="sha-toolbar-item-controls">
          <Button icon={<SettingOutlined />} onClick={onEditBtnClick} size="small" />

          {!readOnly && <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />}
        </div>
      </div>
    </div>
  );
};

export default TableView;
