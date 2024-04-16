import React, { FC } from 'react';
import { Button } from 'antd';
import { DeleteFilled } from '@ant-design/icons';
import { ButtonGroupItemProps, IButtonGroup } from '@/providers/buttonGroupConfigurator/models';
import { useButtonGroupConfigurator } from '@/providers/buttonGroupConfigurator';
import DragHandle from './dragHandle';
import ShaIcon, { IconType } from '@/components/shaIcon';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';
import classNames from 'classnames';

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
  const { styles } = useStyles();
  const { deleteGroup, selectedItemId, readOnly } = useButtonGroupConfigurator();

  const onDeleteClick = () => {
    deleteGroup(props.id);
  };

  return (
    <div className={classNames(styles.shaToolbarItem, { selected: selectedItemId === props.id })}>
      <div className={styles.shaToolbarGroupHeader}>
        <DragHandle id={props.id} />
        {props.icon && <ShaIcon iconName={props.icon as IconType} />}
        <span className={styles.shaToolbarItemName}>{props.label || props.name}</span>
        {!readOnly && (
          <div className={styles.shaToolbarItemControls}>
            <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />
          </div>
        )}
      </div>
      <div className={styles.shaToolbarGroupContainer}>
        {props.containerRendering({ index: props.index, items: props.childItems || [], id: props.id })}
      </div>
    </div>
  );
};

export default ButtonGroupItemsGroup;
