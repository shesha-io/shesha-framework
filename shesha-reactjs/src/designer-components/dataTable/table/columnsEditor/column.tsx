import { DeleteFilled, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import React, { FC } from 'react';
import { IconType, ShaIcon } from '@/components';
import { useColumnsConfigurator } from '@/providers/datatableColumnsConfigurator';
import {
  IConfigurableActionColumnsProps,
  IConfigurableColumnsProps,
} from '@/providers/datatableColumnsConfigurator/models';
import DragHandle from './dragHandle';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';
import classNames from 'classnames';

export interface IProps extends IConfigurableColumnsProps {
  index: number[];
}

export const Column: FC<IProps> = (props) => {
  const { deleteColumn: deleteButton, selectedItemId, readOnly } = useColumnsConfigurator();
  const { styles } = useStyles();

  const onDeleteClick = () => {
    deleteButton(props.id);
  };

  const actionProps = props.columnType === 'action' ? (props as IConfigurableActionColumnsProps) : null;

  return (
    <div className={classNames(styles.shaToolbarItem, { selected: selectedItemId === props.id })}>
      <div className={styles.shaToolbarItemHeader}>
        <DragHandle id={props.id} />
        {actionProps && actionProps.icon && <ShaIcon iconName={actionProps.icon as IconType} />}
        <span className={styles.shaToolbarItemName}>{props.caption}</span>
        {props.description && (
          <Tooltip title={props.description}>
            <QuestionCircleOutlined className={styles.shaHelpIcon} />
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

export default Column;
