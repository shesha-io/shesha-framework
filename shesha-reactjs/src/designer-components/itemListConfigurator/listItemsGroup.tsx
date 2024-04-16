import classNames from 'classnames';
import DragHandle from './dragHandle';
import React, { FC } from 'react';
import ShaIcon, { IconType } from '@/components/shaIcon';
import { Button } from 'antd';
import { DeleteFilled } from '@ant-design/icons';
import { IConfigurableItemBase, IConfigurableItemGroup } from '@/providers/itemListConfigurator/contexts';
import { useItemListConfigurator } from '@/providers';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';

export interface IContainerRenderArgs {
  index?: number[];
  id?: string;
  items: IConfigurableItemBase[];
}

export interface IListItemsGroupProps extends IConfigurableItemGroup {
  index: number[];
  containerRendering: (args: IContainerRenderArgs) => React.ReactNode;
}

export const ListItemsGroup: FC<IListItemsGroupProps> = ({ id, label, title, name, childItems, index, icon, containerRendering }) => {
  const { deleteGroup, selectedItemId } = useItemListConfigurator();
  const { styles } = useStyles();

  const onDeleteClick = () => {
    deleteGroup(id);
  };

  return (
    <div className={classNames(styles.shaToolbarItem, { selected: selectedItemId === id })}>
      <div className={styles.shaToolbarGroupHeader}>
        <DragHandle id={id} />

        {icon && <ShaIcon iconName={icon as IconType} />}

        <span className={styles.shaToolbarItemName}>{title || label || name}</span>

        <div className={styles.shaToolbarItemControls}>
          <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />
        </div>
      </div>

      <div className={styles.shaToolbarGroupContainer}>
        {containerRendering({ index: index, items: childItems || [], id: id })}
      </div>
    </div>
  );
};

export default ListItemsGroup;
