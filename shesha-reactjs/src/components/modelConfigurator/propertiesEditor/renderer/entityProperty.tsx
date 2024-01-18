import React, { FC } from 'react';
import { Tag, Tooltip } from 'antd';
import { QuestionCircleOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { usePropertiesEditor } from '../provider';
import DragHandle from './dragHandle';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { getIconByDataType } from '@/utils/metadata';
import ShaIcon from '@/components/shaIcon';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';
import classNames from 'classnames';

export interface IProps extends IModelItem {
  index: number[];
}

export const EntityProperty: FC<IProps> = props => {
  const { selectedItemId, selectedItemRef } = usePropertiesEditor();
  const { styles } = useStyles();

  const icon = getIconByDataType(props.dataType);

  return (
    <div className={classNames(styles.shaToolbarItem, { selected: selectedItemId === props.id })} ref={selectedItemId === props.id ? selectedItemRef : undefined}>
      <div className={styles.shaToolbarItemHeader}>
        <DragHandle id={props.id} />
        {props.suppress && <span><EyeInvisibleOutlined /> </span>}
        {icon && <ShaIcon iconName={icon} />}
        <span className={styles.shaToolbarItemName}>{props.name} {props.label && <>({props.label})</>}: <i>{props.entityType ?? 'udefined' }</i></span>
        {props.description && (
          <Tooltip title={props.description}>
            <QuestionCircleOutlined className={styles.shaHelpIcon} />
          </Tooltip>
        )}
        <div className={styles.shaToolbarItemControls}>
          <Tag>App</Tag>
        </div>
      </div>
    </div>
  );
};

export default EntityProperty;
