import React, { FC } from 'react';
import { Button, Tag, Tooltip } from 'antd';
import { DeleteFilled, QuestionCircleOutlined, PlusOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { usePropertiesEditor } from '../provider';
import DragHandle from './dragHandle';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { getIconByDataType } from '@/utils/metadata';
import { ShaIcon } from '../../..';
import { MetadataSourceType } from '@/interfaces/metadata';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';
import classNames from 'classnames';

export interface IContainerRenderArgs {
  index?: number[];
  items: IModelItem[];
}

export interface IProps extends IModelItem {
  index: number[];
  containerRendering: (args: IContainerRenderArgs) => React.ReactNode;
}

export const ComplexProperty: FC<IProps> = props => {
  const { deleteItem, addItem, selectedItemId, selectedItemRef } = usePropertiesEditor();
  const { styles } = useStyles();

  const icon = getIconByDataType(props.dataType);

  const onDeleteClick = () => {
    deleteItem(props.id);
  };

  const onAddChildClick = () => {
    addItem(props.id);
  };

  return (
    <div className={classNames(styles.shaToolbarItem, { selected: selectedItemId === props.id })} ref={selectedItemId === props.id ? selectedItemRef : undefined}>
      <div className={styles.shaToolbarItemHeader}>
        <DragHandle id={props.id} />
        {props.suppress && <span><EyeInvisibleOutlined /> </span>}
        {icon && <ShaIcon iconName={icon} />}
        <span className={styles.shaToolbarItemName}>{props.name}</span>
        {props.description && (
          <Tooltip title={props.description}>
            <QuestionCircleOutlined className={styles.shaHelpIcon} />
          </Tooltip>
        )}
        <Button icon={<PlusOutlined color="red" />} onClick={onAddChildClick} size="small">Add child</Button>

        <div className={styles.shaToolbarItemControls}>
          {
            props.source === MetadataSourceType.UserDefined
              ? <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />
              : <Tag>APP</Tag>
          }
        </div>
        <div className={styles.shaToolbarGroupContainer}>
          {props.containerRendering({ index: props.index, items: props.properties || [] })}
        </div>
      </div>
    </div>
  );
};

export default ComplexProperty;
