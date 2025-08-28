import { QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import React, { FC } from 'react';
import { IconType, ShaIcon } from '@/components';
import {
  ColumnsItemProps,
  IConfigurableActionColumnsProps,
} from '@/providers/datatableColumnsConfigurator/models';
import { useStyles } from '@/components/listEditor/styles/styles';

export interface IProps {
  item: ColumnsItemProps;
}

export const Column: FC<IProps> = ({ item }) => {
  const { styles } = useStyles();

  const actionProps = item.columnType === 'action' ? (item as IConfigurableActionColumnsProps) : null;

  return (
    <>
      {actionProps && actionProps.icon && <ShaIcon iconName={actionProps.icon as IconType} />}
      <span className={styles.listItemName}>{item.caption}</span>
      {item.description && item.columnType === "data" && (
        <Tooltip title={item.description}>
          <QuestionCircleOutlined className={styles.helpIcon} />
        </Tooltip>
      )}
    </>
  );
};