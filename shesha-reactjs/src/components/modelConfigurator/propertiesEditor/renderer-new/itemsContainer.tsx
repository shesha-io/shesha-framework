import React, { FC } from 'react';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { ItemInterface, ReactSortable } from 'react-sortablejs';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';
import { Item } from './item';

export interface IItemsContainerProps {
  index?: number[];
  items: IModelItem[];
}

export const ItemsContainer: FC<IItemsContainerProps> = props => {
  //const { updateChildItems } = usePropertiesEditor();
  const { styles } = useStyles();

  const onSetList = (newState: ItemInterface[]) => {
    // temporary commented out, the behavoiur of the sortablejs differs sometimes
    const listChanged = true; //!newState.some(item => item.chosen !== null && item.chosen !== undefined);

    if (listChanged && newState?.length) {
      //const newChilds = newState.map<IModelItem>(item => item as any);
      //updateChildItems({ index: props.index, childs: newChilds });
    }
  };

  return (
    <div>
      container
      <ReactSortable
        list={props.items}
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
            index={[...props.index, index]}
            key={item?.id}
            containerRendering={(args) => (<ItemsContainer {...args} />)}
          />
        )
        )}
      </ReactSortable>
    </div>
  );
};