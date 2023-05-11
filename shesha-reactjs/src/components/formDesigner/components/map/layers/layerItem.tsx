import React, { FC } from 'react';
import { Button, Space, Tooltip } from 'antd';
import { DeleteFilled, QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons';
import ShaIcon, { IconType } from '../../../../shaIcon';
import DragHandle from './dragHandle';
import { ILayerFormModel } from 'providers/layersConfigurator/models';
import { useLayerGroupConfigurator } from 'providers/layersConfigurator';
import classNames from 'classnames';

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

  const classes = ['sha-button-group-item'];
  if (selectedItemId === props.id) classes.push('selected');

  return (
    // <div className={classes.reduce((a, c) => a + ' ' + c)}>
    //   <div className="sha-button-group-item-header">
    //     <DragHandle id={props.id} />
    //     {props.icon && <ShaIcon iconName={props.icon as IconType} />}
    //     <span className="sha-button-group-item-name">{props.label || props.name}</span>
    //     {props.tooltip && (
    //       <Tooltip title={props.tooltip}>
    //         <QuestionCircleOutlined className="sha-help-icon" />
    //       </Tooltip>
    //     )}
    //     <div className="sha-toolbar-item-controls">
    //       <Button icon={<SettingOutlined />} onClick={onEditBtnClick} size="small" />

    //       {!readOnly && <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />}
    //     </div>
    //   </div>
    // </div>
    <div className={classNames('sha-toolbar-item', { selected: selectedItemId === props.id })}>
      <div className="sha-toolbar-item-header" style={{ display: 'flex', padding: '10px', marginBottom: '5px' }}>
        <DragHandle id={props.id} />
        <Space>
          {props.name}
          {props.icon && <ShaIcon iconName={props.icon as IconType} />}
          {props.tooltip && (
            <Tooltip title={props.tooltip} className="sha-tooltip-icon">
              <QuestionCircleOutlined />
            </Tooltip>
          )}
        </Space>
        <div className="sha-toolbar-item-controls">
          <Button icon={<SettingOutlined />} onClick={onEditBtnClick} size="small" />

          {!readOnly && <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />}
        </div>
      </div>
    </div>
  );
};

export default LayerItem;
