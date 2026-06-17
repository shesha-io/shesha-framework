import React, { FC } from 'react';
import { IModelItem, ISortableItem } from '@/interfaces/modelConfigurator';
import { ReactSortable } from 'react-sortablejs';
import { usePropertiesEditor } from '../provider';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';
import { Item } from './item';
import { ItemChangeDetails } from '@/components/listEditor';
import { useDeepCompareMemo } from '@/hooks';
import { isEqual } from 'lodash';

export interface IContainerRenderArgs {
  index?: number[];
  items: IModelItem[];
  parent?: IModelItem | undefined;
  disableDrag?: boolean;
  onChange?: (items: IModelItem[], changeDetails?: ItemChangeDetails) => void;
}

export type ContainerRenderer = (args: IContainerRenderArgs) => React.ReactNode;

export interface IItemsContainerProps {
  index?: number[];
  items: IModelItem[];
  parent?: IModelItem | undefined;
  disableDrag?: boolean;
}

export const ItemsContainer: FC<IItemsContainerProps> = (props) => {
  const { updateChildItems, selectItem } = usePropertiesEditor();
  const { styles } = useStyles();

  const onSetList = (newState: ISortableItem<IModelItem>[]): void => {
    const chosen = newState.find((item) => item.chosen === true);
    if (chosen) {
      selectItem(chosen.data.id);
      return;
    }

    const newItems = newState.map((item) => item.data);
    if (!isEqual(props.items, newItems)) {
      updateChildItems({ index: props.index ?? [], childs: newItems });
    }
  };

  const items = useDeepCompareMemo((): ISortableItem<IModelItem>[] => {
    return props.items.map((item, index) => ({ data: { ...item }, id: index }));
  }, [props.items]);

  return (
    <ReactSortable<ISortableItem<IModelItem>>
      list={items}
      disabled={props.disableDrag}
      setList={onSetList}
      fallbackOnBody={true}
      swapThreshold={0.5}
      group={{
        name: 'toolbarItems',
      }}
      sort={true}
      draggable={`.${styles.shaToolbarItem}`}
      animation={75}
      ghostClass={styles.shaToolbarItemGhost}
      emptyInsertThreshold={20}
      handle={`.${styles.shaToolbarItemDragHandle}`}
      scroll={true}
      bubbleScroll={true}
    >
      {props.items.map((item, index) => (
        <Item
          itemProps={item}
          index={[...(props.index ?? []), index]}
          key={index.toString()}
          parent={props.parent}
          containerRendering={(args) => (<ItemsContainer {...args} />)}
        />
      ),
      )}
    </ReactSortable>
  );
};
export default ItemsContainer;
