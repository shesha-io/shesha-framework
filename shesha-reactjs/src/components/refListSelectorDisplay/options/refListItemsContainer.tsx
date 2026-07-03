import React, { FC } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { useStyles } from './styles/styles';
import { RefListGroupItemProps } from '../provider/models';
import { useRefListItemGroupConfigurator } from '../provider';
import RefListItem from './refListItem';
import { ISortableItem } from '@/interfaces/modelConfigurator';
import { useDeepCompareMemo } from '@/hooks';
import { isEqual } from 'lodash';

export interface IRefListItemsContainerProps {
  index?: number[] | undefined;
  id?: string | undefined;
  items: RefListGroupItemProps[];
  onConfigClick?: ((selectedItemId: string) => void) | undefined;
  readOnly?: boolean | undefined;
}

export const RefListItemsContainer: FC<IRefListItemsContainerProps> = (props) => {
  const { styles } = useStyles();
  const { readOnly, updateChildItems } = useRefListItemGroupConfigurator();

  const onSetList = (newState: ISortableItem<RefListGroupItemProps>[]): void => {
    const newChilds = newState.map<RefListGroupItemProps>((item) => item.data);
    if (!isEqual(props.items, newChilds)) {
      updateChildItems({ index: props.index ?? [], childs: newChilds });
    }
  };

  // ReactSortable/sortablejs mutates list items (e.g. adds a `chosen` property), but the
  // items coming from the configurator reducer are frozen by Immer. Wrap each item in a
  // fresh, extensible sortable wrapper so sortablejs mutates the wrapper, not the frozen data.
  const sortableItems = useDeepCompareMemo((): ISortableItem<RefListGroupItemProps>[] => {
    return props.items.map((item) => ({ data: item, id: item.id }));
  }, [props.items]);

  if (props.items.length === 0) {
    return <>No items have been configured</>;
  }

  return (
    <div className={styles.sidebarContainerMainArea} style={{ marginTop: '5px' }}>
      <ReactSortable<ISortableItem<RefListGroupItemProps>>
        disabled={readOnly}
        list={sortableItems}
        setList={onSetList}
        fallbackOnBody={true}
        swapThreshold={0.5}
        group={{
          name: 'buttonGroupItems',
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
          <RefListItem index={[index]} {...item} onConfigClick={props.onConfigClick} key={item.id} />
        ))}
      </ReactSortable>
    </div>
  );
};
export default RefListItemsContainer;
