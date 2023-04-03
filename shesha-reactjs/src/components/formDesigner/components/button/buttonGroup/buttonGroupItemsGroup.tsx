import React, { FC } from 'react';
import { Button } from 'antd';
import { DeleteFilled } from '@ant-design/icons';
import { ButtonGroupItemProps, IButtonGroup } from '../../../../../providers/buttonGroupConfigurator/models';
import { useButtonGroupConfigurator } from '../../../../../providers/buttonGroupConfigurator';
import DragHandle from './dragHandle';
import ShaIcon, { IconType } from '../../../../shaIcon';

export interface IContainerRenderArgs {
  index?: number[];
  id?: string;
  items: ButtonGroupItemProps[];
}

export interface IButtonGroupItemsGroupProps extends IButtonGroup {
  index: number[];
  containerRendering: (args: IContainerRenderArgs) => React.ReactNode;
}

export const ButtonGroupItemsGroup: FC<IButtonGroupItemsGroupProps> = props => {
  const { deleteGroup, selectedItemId, readOnly } = useButtonGroupConfigurator();

  const onDeleteClick = () => {
    deleteGroup(props.id);
  };

  const classes = ['sha-button-group-item'];
  if (selectedItemId === props.id) classes.push('selected');

  return (
    <div className={classes.reduce((a, c) => a + ' ' + c)}>
      <div className="sha-button-group-group-header">
        <DragHandle id={props.id} />
        {props.icon && <ShaIcon iconName={props.icon as IconType} />}
        <span className="sha-button-group-item-name">{props.label || props.name}</span>
        {!readOnly && (
          <div className="sha-button-group-item-controls">
            <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />
          </div>
        )}
      </div>
      <div className="sha-button-group-group-container">
        {props.containerRendering({ index: props.index, items: props.childItems || [], id: props.id })}
      </div>
    </div>
  );
};

export default ButtonGroupItemsGroup;
