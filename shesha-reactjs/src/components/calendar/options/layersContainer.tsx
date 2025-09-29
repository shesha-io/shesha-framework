import React, { FC } from 'react';
import { ItemInterface, ReactSortable } from 'react-sortablejs';
import LayerItem from './layerItem';
import { useStyles } from './styles/styles';
import { useLayerGroupConfigurator } from '@/providers/calendar';
import { LayerGroupItemProps } from '@/providers/calendar/models';

export interface ILayerItemsContainerProps {
  index?: number[];
  id?: string;
  items: LayerGroupItemProps[];
  onConfigClick?: (selectedItemId: string) => void;
  readOnly?: boolean;
}

export const LayerItemsContainer: FC<ILayerItemsContainerProps> = (props) => {
  const { styles } = useStyles();
  const { readOnly, updateChildItems } = useLayerGroupConfigurator();

  const onSetList = (newState: ItemInterface[]) => {
    const listChanged = true;

    if (listChanged) {
      const newChilds = newState.map<LayerGroupItemProps>((item) => item as LayerGroupItemProps);
      updateChildItems({ index: props.index, childs: newChilds });
    }
  };

  return (
    <div className={styles.sidebarContainerMainArea}>
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
          <LayerItem index={[index]} {...item} onConfigClick={props.onConfigClick} key={item.id} />
        ))}
      </ReactSortable>
    </div>
  );
};
export default LayerItemsContainer;
