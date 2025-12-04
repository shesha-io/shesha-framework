import React, { FC, PropsWithChildren } from 'react';
import { Button, Tag, Tooltip } from 'antd';
import { DeleteFilled, EyeInvisibleOutlined, InfoCircleOutlined, WarningFilled } from '@ant-design/icons';
import { usePropertiesEditor } from '../provider';
import DragHandle from './dragHandle';
import classNames from 'classnames';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { MetadataSourceType } from '@/interfaces/metadata';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';
import { DataTypes, useModelConfigurator } from '@/index';
import { ArrayFormats } from '@/interfaces/dataTypes';
import { EntityInitFlags } from '@/apis/modelConfigurations';

export interface IProps extends IModelItem {
  index: number[];
  parent?: IModelItem;
}

export const PropertyWrapper: FC<PropsWithChildren<IProps>> = (props) => {
  const { deleteItem, selectedItemId, selectedItemRef } = usePropertiesEditor();
  const { errors } = useModelConfigurator();
  const { styles } = useStyles();

  const onDeleteClick = (): void => {
    deleteItem(props.id);
  };

  const hasInputError = errors
    .filter((x) => typeof x !== 'string' && x.propertyName === props.name)
    .map((x) => typeof x === 'string' ? x : x.errors)
    .join('; ');

  const needRestart =
    props.source !== 1 &&
    Boolean(props.initStatus & (EntityInitFlags.DbActionRequired | EntityInitFlags.InitializationRequired)) && // eslint-disable-line no-bitwise
    !props.inheritedFromId &&
    !props.parent &&
    props.dataType !== DataTypes.advanced;

  const hasError =
    props.source !== 1 &&
    Boolean(props.initStatus & (EntityInitFlags.DbActionFailed | EntityInitFlags.InitializationFailed)) && // eslint-disable-line no-bitwise
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
          <Tooltip
            title={hasError
              ? `This property has initialization errors which require a fix and an application restart: ${props.initMessage ?? 'undefined'}`
              : "This property has changes which require an application restart before they can take effect"}
          >
            <span style={{ color: 'red' }}><WarningFilled /> </span>
          </Tooltip>
        )}
        {hasInputError && (
          <Tooltip title={`This property has configuration errors: ${hasInputError}`}>
            <span style={{ color: 'red' }}><InfoCircleOutlined /> </span>
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
