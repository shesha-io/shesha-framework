import React, { FC } from 'react';
import { Tag, Tooltip } from 'antd';
import { QuestionCircleOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { usePropertiesEditor } from '../provider';
import DragHandle from './dragHandle';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { JsonOutlined } from '@/icons/jsonOutlined';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';
import classNames from 'classnames';

export interface IProps extends IModelItem {
  index: number[];
}

export const JsonProperty: FC<IProps> = props => {
  const { selectedItemId, selectedItemRef } = usePropertiesEditor();
  const { styles } = useStyles();

  return (
    <div className={classNames(styles.shaToolbarItem, { selected: selectedItemId === props.id })} ref={selectedItemId === props.id ? selectedItemRef : undefined}>
      <div className={styles.shaToolbarItemHeader}>
        <DragHandle id={props.id} />
        {props.suppress && <span><EyeInvisibleOutlined /> </span>}
        <JsonOutlined />
        <span className={styles.shaToolbarItemName}>{props.name} : <i>{props.entityType ?? 'udefined' }</i></span>
        {props.description && (
          <Tooltip title={props.description}>
            <QuestionCircleOutlined className={styles.shaHelpIcon} />
          </Tooltip>
        )}
        <div className={styles.shaToolbarItemControls}>
          <Tag>Json</Tag>
        </div>
      </div>
    </div>
  );
};

export default JsonProperty;
