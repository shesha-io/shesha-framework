import { DeleteFilled, SettingOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { FC } from 'react';
import DragHandle from './dragHandle';
import { useStyles } from './styles/styles';
import classNames from 'classnames';
import { useLayerGroupConfigurator } from '@/providers/layersProvider';
import { IconType, ShaIcon } from '@/index';
import { ILayerFormModel } from '@/providers/layersProvider/models';

export interface ILayerGroupItemProps extends ILayerFormModel {
  index: number[];
  onConfigClick?: (selectedItemId: string) => void;
}

export const LayerItem: FC<ILayerGroupItemProps> = (props) => {
  const { styles } = useStyles();
  const { deleteLayer, selectedItemId, readOnly } = useLayerGroupConfigurator();

  const onDeleteClick = () => {
    deleteLayer(props.id);
  };

  const onEditBtnClick = () => {
    if (props.onConfigClick) {
      props.onConfigClick(props.id);
    }
  };

  return (
    <div className={classNames(styles.shaToolbarItem, { selected: selectedItemId === props.id })}>
      <div className={classNames(styles.shaToolbarItemHeader)} style={{ display: 'flex'}}>
        <DragHandle id={props.id} />
        <span className={styles.shaToolbarItemName}>
          {props.icon && <ShaIcon iconName={props.icon as IconType} />}
          {props.label || props.name}
        </span>
        <div className={styles.shaToolbarItemControls}>
          <Button icon={<SettingOutlined />} onClick={onEditBtnClick} size="small" />

          {!readOnly && <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />}
        </div>
      </div>
    </div>
  );
};

export default LayerItem;
