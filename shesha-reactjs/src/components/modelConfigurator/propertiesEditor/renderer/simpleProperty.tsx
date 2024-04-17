import React, { FC } from 'react';
import { Button, Tooltip, Tag } from 'antd';
import { DeleteFilled, EyeInvisibleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { usePropertiesEditor } from '../provider';
import DragHandle from './dragHandle';
import classNames from 'classnames';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { getIconByDataType } from '@/utils';
import { ShaIcon } from '../../..';
import { MetadataSourceType } from '@/interfaces/metadata';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';

export interface IProps extends IModelItem {
  index: number[];
}

export const SimpleProperty: FC<IProps> = props => {
  const { deleteItem, selectedItemId, selectedItemRef } = usePropertiesEditor();
  const { styles } = useStyles();

  const icon = getIconByDataType(props.dataType);

  const onDeleteClick = () => {
    deleteItem(props.id);
  };

  return (
    <div className={classNames(styles.shaToolbarItem, { selected: selectedItemId === props.id })} ref={selectedItemId === props.id ? selectedItemRef : undefined}>
      <div className={styles.shaToolbarItemHeader}>
        <DragHandle id={props.id} />
        {props.suppress && <span><EyeInvisibleOutlined /> </span>}
        {icon && <ShaIcon iconName={icon} />}
        
        <span className={styles.shaToolbarItemName}>{props.name} {props.label && <>({props.label})</>}</span>

        {props.description && (
          <Tooltip title={props.description}>
            <QuestionCircleOutlined className={styles.shaHelpIcon} />
          </Tooltip>
        )}
        <div className={styles.shaToolbarItemControls}>
          {
            props.source === MetadataSourceType.UserDefined 
              ? <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />
              : <Tag>APP</Tag>
          }
        </div>
      </div>
    </div>
  );
};

export default SimpleProperty;
