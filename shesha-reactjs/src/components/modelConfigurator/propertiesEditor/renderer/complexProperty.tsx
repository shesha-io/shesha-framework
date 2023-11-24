import React, { FC } from 'react';
import { Button, Tag, Tooltip } from 'antd';
import { DeleteFilled, QuestionCircleOutlined, PlusOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { usePropertiesEditor } from '../provider';
import DragHandle from './dragHandle';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { getIconByDataType } from '@/utils/metadata';
import { ShaIcon } from '../../..';
import { MetadataSourceType } from '@/interfaces/metadata';

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

  const icon = getIconByDataType(props.dataType);

  const onDeleteClick = () => {
    deleteItem(props.id);
  };

  const classes = ['sha-sidebar-item'];
  if (selectedItemId === props.id) {
    classes.push('selected');
  }

  const onAddChildClick = () => {
    addItem(props.id);
  };

  return (
    <div className={classes.reduce((a, c) => a + ' ' + c)} ref={selectedItemId === props.id ? selectedItemRef : undefined}>
      <div className="sha-sidebar-item-header">
        <DragHandle id={props.id} />
        {props.suppress && <span><EyeInvisibleOutlined /> </span>}
        {icon && <ShaIcon iconName={icon} />}
        <span className="sha-sidebar-item-name">{props.name}</span>
        {props.description && (
          <Tooltip title={props.description}>
            <QuestionCircleOutlined className="sha-help-icon" />
          </Tooltip>
        )}
        <Button icon={<PlusOutlined color="red" />} onClick={onAddChildClick} size="small">Add child</Button>

        <div className="sha-sidebar-item-controls">
          {
            props.source === MetadataSourceType.UserDefined
              ? <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />
              : <Tag>APP</Tag>
          }
        </div>
        <div className="sha-sidebar-group-container">
          {props.containerRendering({ index: props.index, items: props.properties || [] })}
        </div>
      </div>
    </div>
  );
};

export default ComplexProperty;
