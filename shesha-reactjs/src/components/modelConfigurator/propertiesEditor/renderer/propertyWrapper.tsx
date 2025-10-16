import React, { FC, PropsWithChildren } from 'react';
import { Button, Tag, Tooltip } from 'antd';
import { DeleteFilled, EyeInvisibleOutlined, WarningFilled } from '@ant-design/icons';
import { usePropertiesEditor } from '../provider';
import DragHandle from './dragHandle';
import classNames from 'classnames';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { MetadataSourceType } from '@/interfaces/metadata';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';
import { DataTypes } from '@/index';
import { ArrayFormats } from '@/interfaces/dataTypes';

export interface IProps extends IModelItem {
  index: number[];
  parent?: IModelItem;
}

export const PropertyWrapper: FC<PropsWithChildren<IProps>> = (props) => {
  const { deleteItem, selectedItemId, selectedItemRef } = usePropertiesEditor();
  const { styles } = useStyles();

  const onDeleteClick = (): void => {
    deleteItem(props.id);
  };

  const needRestart =
    props.source !== 1 &&
    !props.createdInDb &&
    !props.inheritedFromId &&
    !props.parent &&
    !(props.dataType === DataTypes.array && props.dataFormat === ArrayFormats.entityReference) &&
    props.dataType !== DataTypes.advanced;

  return (
    <div
      className={classNames(styles.shaToolbarItem, { selected: selectedItemId === props.id })}
      ref={selectedItemId === props.id ? selectedItemRef : undefined}
      style={{ color: props.suppress ? 'silver' : props.inheritedFromId ? 'green' : undefined }}
    >
      <div className={styles.shaToolbarItemHeader}>
        <DragHandle id={props.id} />
        {props.suppress && !props.isItemsType && <span><EyeInvisibleOutlined /> </span>}
        {needRestart && (
          <Tooltip title="This property has changes which require an application restart before they can take effect">
            <span style={{ color: 'red' }}><WarningFilled /> </span>
          </Tooltip>
        )}
        {props.children}
        <div className={styles.shaToolbarItemControls}>
          {
            Boolean(props.inheritedFromId)
              ? <Tag>Inherited</Tag>
              : props.source === MetadataSourceType.ApplicationCode
                ? <Tag>APP</Tag>
                : <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />
          }
        </div>
      </div>
    </div>
  );
};

export default PropertyWrapper;
