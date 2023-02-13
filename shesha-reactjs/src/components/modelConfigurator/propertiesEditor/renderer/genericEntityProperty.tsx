import React, { FC } from 'react';
import { Tag, Tooltip } from 'antd';
import { QuestionCircleOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { usePropertiesEditor } from '../provider';
import DragHandle from './dragHandle';
import { IModelItem } from '../../../../interfaces/modelConfigurator';
import GenericOutlined from '../../../../icons/genericOutlined';


export interface IProps extends IModelItem {
  index: number[];
}

export const GenericEntityProperty: FC<IProps> = props => {
  const { selectedItemId, selectedItemRef } = usePropertiesEditor();

  const classes = ['sha-sidebar-item'];
  if (selectedItemId === props.id) {
    classes.push('selected');
  }

  return (
    <div className={classes.reduce((a, c) => a + ' ' + c)} ref={selectedItemId === props.id ? selectedItemRef : undefined}>
      <div className="sha-sidebar-item-header">
        <DragHandle id={props.id} />
        {props.suppress && <span><EyeInvisibleOutlined /> </span>}
        <GenericOutlined />
        <span className="sha-sidebar-item-name">{props.name} {props.label && <>({props.label})</>}: <i>Generic entity reference</i></span>
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

export default GenericEntityProperty;
