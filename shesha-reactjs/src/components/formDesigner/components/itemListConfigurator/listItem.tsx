import React, { FC } from 'react';
import { Button, Tooltip } from 'antd';
import { DeleteFilled, QuestionCircleOutlined } from '@ant-design/icons';
import DragHandle from './dragHandle';
import ShaIcon, { IconType } from '../../../shaIcon';
import { useItemListConfigurator } from '../../../../providers';
import { IConfigurableItemBase } from '../../../../providers/itemListConfigurator/contexts';
import classNames from 'classnames';

export interface IListItemProps extends IConfigurableItemBase {
  index: number[];
}

export const ListItem: FC<IListItemProps> = ({ id, label, title, name, tooltip, icon }) => {
  const { deleteItem, selectedItemId } = useItemListConfigurator();

  const onDeleteClick = () => {
    deleteItem(id);
  };

  return (
    <div className={classNames('sha-button-group-item', { selected: selectedItemId === id })}>
      <div className="sha-button-group-item-header">
        <DragHandle id={id} />

        {icon && <ShaIcon iconName={icon as IconType} />}

        <span className="sha-button-group-item-name">{title || label || name}</span>

        {tooltip && (
          <Tooltip title={tooltip}>
            <QuestionCircleOutlined className="sha-help-icon" />
          </Tooltip>
        )}

        <div className="sha-button-group-item-controls">
          <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />
        </div>
      </div>
    </div>
  );
};

export default ListItem;
