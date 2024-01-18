import { DeleteFilled, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import classNames from 'classnames';
import React, { FC } from 'react';
import { useTableViewSelectorConfigurator } from '@/providers/tableViewSelectorConfigurator';
import { ITableViewProps } from '@/providers/tableViewSelectorConfigurator/models';
import DragHandle from './dragHandle';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';

export interface IFilterItemProps extends ITableViewProps {
  index: number[];
}

export const FilterItem: FC<IFilterItemProps> = (props) => {
  const { deleteItem: deleteButton, selectedItemId, readOnly } = useTableViewSelectorConfigurator();
  const { styles } = useStyles();

  const onDeleteClick = () => {
    deleteButton(props.id);
  };

  return (
    <div className={classNames(styles.shaToolbarItem, { selected: selectedItemId === props.id })}>
      <div className={styles.shaToolbarItemHeader}>
        <DragHandle id={props.id} />
        {props.name}
        {props.tooltip && (
          <Tooltip title={props.tooltip} className={styles.shaTooltipIcon}>
            <QuestionCircleOutlined />
          </Tooltip>
        )}
        {!readOnly && (
          <div className={styles.shaToolbarItemControls}>
            <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterItem;
