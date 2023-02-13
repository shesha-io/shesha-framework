import React, { FC } from 'react';
import { Tag, Tooltip } from 'antd';
import { QuestionCircleOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { usePropertiesEditor } from '../provider';
import DragHandle from './dragHandle';
import { IModelItem } from '../../../../interfaces/modelConfigurator';
import { getIconByDataType } from '../../../../utils/metadata';
import ShaIcon from '../../../shaIcon';

export interface IProps extends IModelItem {
  index: number[];
}

export const EntityProperty: FC<IProps> = props => {
  const { selectedItemId, selectedItemRef } = usePropertiesEditor();

  const icon = getIconByDataType(props.dataType);

  const classes = ['sha-sidebar-item'];
  if (selectedItemId === props.id) {
    classes.push('selected');
  }

  return (
    <div className={classes.reduce((a, c) => a + ' ' + c)} ref={selectedItemId === props.id ? selectedItemRef : undefined}>
      <div className="sha-sidebar-item-header">
        <DragHandle id={props.id} />
        {props.suppress && <span><EyeInvisibleOutlined /> </span>}
        {icon && <ShaIcon iconName={icon} />}
        <span className="sha-sidebar-item-name">{props.name} {props.label && <>({props.label})</>}: <i>{props.entityType ?? 'udefined' }</i></span>
        {props.description && (
          <Tooltip title={props.description}>
            <QuestionCircleOutlined className="sha-help-icon" />
          </Tooltip>
        )}
        <div className="sha-sidebar-item-controls">
          <Tag>App</Tag>
        </div>
      </div>
    </div>
  );
};

export default EntityProperty;
