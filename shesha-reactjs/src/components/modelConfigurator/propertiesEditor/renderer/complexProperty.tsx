import React, { FC } from 'react';
import { Button, Tag, Tooltip } from 'antd';
import { DeleteFilled, QuestionCircleOutlined, PlusOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { usePropertiesEditor } from '../provider';
import DragHandle from './dragHandle';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { getIconTypeByDataType } from '@/utils/metadata';
import { ShaIcon } from '../../..';
import { MetadataSourceType } from '@/interfaces/metadata';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';
import classNames from 'classnames';
import { ItemChangeDetails } from '@/components/listEditor';

export interface IContainerRenderArgs {
  index?: number[];
  items: IModelItem[];
  onChange?: (items: IModelItem[], changeDetails: ItemChangeDetails) => void;
}

export type ContainerRenderer = (args: IContainerRenderArgs) => React.ReactNode;

export interface IProps {
  index: number[];
  data: IModelItem;
  containerRendering: ContainerRenderer;
  onChange?: (newValue: IModelItem, changeDetails: ItemChangeDetails) => void;
}

export const ComplexProperty: FC<IProps> = props => {
  const { deleteItem, addItem, selectedItemId, selectedItemRef } = usePropertiesEditor();
  const { styles } = useStyles();

  const icon = getIconTypeByDataType(props.data.dataType);

  const onDeleteClick = () => {
    deleteItem(props.data.id);
  };

  const onAddChildClick = () => {
    addItem(props.data.id);
  };

  return (
    <div className={classNames(styles.shaToolbarItem, { selected: selectedItemId === props.data.id })} ref={selectedItemId === props.data.id ? selectedItemRef : undefined}>
      <div className={styles.shaToolbarItemHeader}>
        <DragHandle id={props.data.id} />
        {props.data.suppress && <span><EyeInvisibleOutlined /> </span>}
        {icon && <ShaIcon iconName={icon} />}
        <span className={styles.shaToolbarItemName}>{props.data.name}</span>
        {props.data.description && (
          <Tooltip title={props.data.description}>
            <QuestionCircleOutlined className={styles.shaHelpIcon} />
          </Tooltip>
        )}
        <Button icon={<PlusOutlined color="red" />} onClick={onAddChildClick} size="small">Add child</Button>

        <div className={styles.shaToolbarItemControls}>
          {
            props.data.source === MetadataSourceType.UserDefined
              ? <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />
              : <Tag>APP</Tag>
          }
        </div>
        <div className={styles.shaToolbarGroupContainer}>
          {props.containerRendering({
            index: props.index,
            items: props.data.properties || [],
            onChange: (newItems, changeDetails) => {
              if (props.onChange)
                props.onChange({...props.data, properties: [...newItems]}, changeDetails);
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default ComplexProperty;
