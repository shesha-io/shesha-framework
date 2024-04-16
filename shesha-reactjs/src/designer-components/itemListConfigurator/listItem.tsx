import React, { FC } from 'react';
import { Button, Tooltip } from 'antd';
import { DeleteFilled, QuestionCircleOutlined } from '@ant-design/icons';
import DragHandle from './dragHandle';
import ShaIcon, { IconType } from '@/components/shaIcon';
import { useItemListConfigurator } from '@/providers';
import { IConfigurableItemBase } from '@/providers/itemListConfigurator/contexts';
import classNames from 'classnames';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';

export interface IListItemProps extends IConfigurableItemBase {
  index: number[];
}

export const ListItem: FC<IListItemProps> = ({ id, label, title, name, tooltip, icon }) => {
  const { deleteItem, selectedItemId } = useItemListConfigurator();
  const { styles } = useStyles();

  const onDeleteClick = () => {
    deleteItem(id);
  };

  return (
    <div className={classNames(styles.shaToolbarItem, { selected: selectedItemId === id })}>
      <div className={styles.shaToolbarItemHeader}>
        <DragHandle id={id} />

        {icon && <ShaIcon iconName={icon as IconType} />}

        <span className={styles.shaToolbarItemName}>{title || label || name}</span>

        {tooltip && (
          <Tooltip title={tooltip}>
            <QuestionCircleOutlined className={styles.shaTooltipIcon} />
          </Tooltip>
        )}

        <div className={styles.shaToolbarItemControls}>
          <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />
        </div>
      </div>
    </div>
  );
};

export default ListItem;
