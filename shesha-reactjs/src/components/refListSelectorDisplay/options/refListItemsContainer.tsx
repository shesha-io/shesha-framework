import React, { FC } from 'react';
import { ItemInterface, ReactSortable } from 'react-sortablejs';
import { useStyles } from './styles/styles';
import { RefListGroupItemProps } from '../provider/models';
import { useRefListItemGroupConfigurator } from '../provider';
import RefListItem from './refListItem';

export interface IRefListItemsContainerProps {
  index?: number[];
  id?: string;
  items: RefListGroupItemProps[];
  onConfigClick?: (selectedItemId: string) => void;
  readOnly?: boolean;
}

export const RefListItemsContainer: FC<IRefListItemsContainerProps> = (props) => {
  const { styles } = useStyles();
  const { readOnly, updateChildItems } = useRefListItemGroupConfigurator();

  const onSetList = (newState: ItemInterface[]) => {
    const listChanged = true;

    if (listChanged) {
      const newChilds = newState.map<RefListGroupItemProps>((item) => item as RefListGroupItemProps);
      updateChildItems({ index: props.index, childs: newChilds });
    }
  };

  if (props.items.length === 0) {
    return <>No items have been configured</>;
  }

  return (
    <div className={styles.sidebarContainerMainArea} style={{marginTop: '5px'}}>
      <ReactSortable
        disabled={readOnly}
        list={props.items}
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
