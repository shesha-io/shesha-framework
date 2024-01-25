import React, { FC } from 'react';
import { Tag, Tooltip } from 'antd';
import { QuestionCircleOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { usePropertiesEditor } from '../provider';
import DragHandle from './dragHandle';
import { IModelItem } from '@/interfaces/modelConfigurator';
import GenericOutlined from '@/icons/genericOutlined';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';
import classNames from 'classnames';

export interface IProps extends IModelItem {
  index: number[];
}

export const GenericEntityProperty: FC<IProps> = props => {
  const { selectedItemId, selectedItemRef } = usePropertiesEditor();
  const { styles } = useStyles();

  return (
    <div className={classNames(styles.shaToolbarItem, { selected: selectedItemId === props.id })} ref={selectedItemId === props.id ? selectedItemRef : undefined}>
      <div className={styles.shaToolbarItemHeader}>
        <DragHandle id={props.id} />
        {props.suppress && <span><EyeInvisibleOutlined /> </span>}
        <GenericOutlined />
        <span className={styles.shaToolbarItemName}>{props.name} {props.label && <>({props.label})</>}: <i>Generic entity reference</i></span>
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

export default GenericEntityProperty;
