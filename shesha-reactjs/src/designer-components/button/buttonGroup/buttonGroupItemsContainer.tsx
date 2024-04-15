import React, { FC, useMemo } from 'react';
import { ButtonGroupItem } from './buttonGroupItem';
import { ButtonGroupItemsGroup } from './buttonGroupItemsGroup';
import { useButtonGroupConfigurator } from '@/providers/buttonGroupConfigurator';
import {
  IButtonGroup,
  IButtonGroupItem,
  ButtonGroupItemProps,
} from '@/providers/buttonGroupConfigurator/models';
import { ReactSortable, ItemInterface } from 'react-sortablejs';
import { getActualModel, useAvailableConstantsData } from '@/providers/form/utils';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';

export interface IButtonGroupItemsContainerProps {
  index?: number[];
  id?: string;
  items: ButtonGroupItemProps[];
}

export const ButtonGroupItemsContainer: FC<IButtonGroupItemsContainerProps> = props => {
  const { styles } = useStyles();
  const { updateChildItems, readOnly } = useButtonGroupConfigurator();
  const allData = useAvailableConstantsData();
  
  const actualItems = useMemo(() => {
    return props.items.map((item) => getActualModel(item, allData));
  }, [props.items, allData.contexts.lastUpdate, allData.data, allData.formMode, allData.globalState, allData.selectedRow]);

  const renderItem = (item: ButtonGroupItemProps, index: number) => {
    switch (item.itemType) {
      case 'item':
        const itemProps = item as IButtonGroupItem;
        return <ButtonGroupItem key={item.id} index={[...props.index, index]} {...itemProps} />;

      case 'group':
        const groupProps = item as IButtonGroup;
        return (
          <ButtonGroupItemsGroup 
            key={item.id} 
            {...groupProps} 
            index={[...props.index, index]}
            containerRendering={(args) => (<ButtonGroupItemsContainer {...args}/>)}
          />);
      default:
        return null;
    }
  };

  const onSetList = (newState: ItemInterface[], _sortable, _store) => {
    // temporary commented out, the behavoiur of the sortablejs differs sometimes
    const listChanged = true; //!newState.some(item => item.chosen !== null && item.chosen !== undefined);

    if (listChanged && newState?.length) {
      const newChildren = newState.map<ButtonGroupItemProps>(item => item as ButtonGroupItemProps);

      updateChildItems({ index: props.index, id: props.id, children: newChildren });
    }

    return;
  };

  return (
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
      {actualItems.map((item, index) => renderItem(item, index))}
    </ReactSortable>
  );
};
export default ButtonGroupItemsContainer;
