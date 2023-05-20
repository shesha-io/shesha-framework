import React, { FC } from 'react';
import { Button } from 'antd';
import { DeleteFilled, SettingOutlined } from '@ant-design/icons';
import ShaIcon, { IconType } from '../../../../../shaIcon';
import DragHandle from './dragHandle';
import { ILayerFormModel } from 'providers/layersConfigurator/models';
import { useLayerGroupConfigurator } from 'providers/layersConfigurator';

export interface ILayerGroupItemProps extends ILayerFormModel {
  index: number[];
  onConfigClick?: (selectedItemId: string) => void;
}

export const LayerItem: FC<ILayerGroupItemProps> = (props) => {
  const { deleteLayer, selectedItemId, readOnly } = useLayerGroupConfigurator();

  const onDeleteClick = () => {
    deleteLayer(props.id);
  };

  const onEditBtnClick = () => {
    if (props.onConfigClick) {
      props.onConfigClick(props.id);
    }
  };

  const classes = ['sha-button-group-item', 'sha-toolbar-item'];
  if (selectedItemId === props.id) classes.push('selected');

  return (
    <div className={classes.reduce((a, c) => a + ' ' + c)}>
      <div className="sha-toolbar-item-header" style={{ display: 'flex', padding: '10px', marginBottom: '5px' }}>
        <DragHandle id={props.id} />
        <span className="sha-button-group-item-name">
          {props.icon && <ShaIcon iconName={props.icon as IconType} />}
          {props.label || props.name}
        </span>
        <div className="sha-toolbar-item-controls">
          <Button icon={<SettingOutlined />} onClick={onEditBtnClick} size="small" />

          {!readOnly && <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />}
        </div>
      </div>
    </div>
  );
};

export default LayerItem;
