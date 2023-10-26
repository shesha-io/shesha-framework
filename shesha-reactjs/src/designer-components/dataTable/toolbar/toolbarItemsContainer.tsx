import React, { FC } from 'react';
import { ToolbarItem } from './toolbarItem';
import { ToolbarItemsGroup } from './toolbarItemsGroup';
import { useToolbarConfigurator } from '../../../providers/toolbarConfigurator';
import { IButtonGroup, IToolbarButton, ToolbarItemProps } from '../../../providers/toolbarConfigurator/models';
import { ReactSortable, ItemInterface } from 'react-sortablejs';
import { getActualModel, useApplicationContext } from 'utils/publicUtils';
import { useDeepCompareMemo } from 'hooks';

export interface IToolbarItemsContainerProps {
  index?: number[];
  id?: string;
  items: ToolbarItemProps[];
}

export const ToolbarItemsContainer: FC<IToolbarItemsContainerProps> = (props) => {
  const { updateChildItems, readOnly } = useToolbarConfigurator();
  const allData = useApplicationContext();

  const actualItems = useDeepCompareMemo(() =>
    props.items.map((item) => getActualModel(item, allData))
  , [props.items, allData.contexts.lastUpdate, allData.data, allData.formMode, allData.globalState, allData.selectedRow]);


  const renderItem = (item: ToolbarItemProps, index: number) => {
    switch (item.itemType) {
      case 'item':
        const itemProps = item as IToolbarButton;
        return <ToolbarItem key={item.id} index={[...props.index, index]} {...itemProps} />;

      case 'group':
        const groupProps = item as IButtonGroup;
        return (
          <ToolbarItemsGroup
            key={item.id}
            {...groupProps}
            index={[...props.index, index]}
            containerRendering={(args) => <ToolbarItemsContainer {...args} />}
          />
        );
      default: 
        return null;
    }
  };

  const onSetList = (newState: ItemInterface[], _sortable, _store) => {
    // temporary commented out, the behavoiur of the sortablejs differs sometimes
    const listChanged = true; //!newState.some(item => item.chosen !== null && item.chosen !== undefined);

    if (listChanged && newState?.length) {
      const newChilds = newState.map<ToolbarItemProps>((item) => item as ToolbarItemProps);

      updateChildItems({ index: props.index, id: props.id, children: newChilds });
    }

    return;
  };

  return <>{actualItems.map((item) => {
        return <>{item.name}: {item.itemType} _</>;
  })}</>;

  return (
    <ReactSortable
      disabled={readOnly}
      list={actualItems}
      setList={onSetList}
      fallbackOnBody={true}
      swapThreshold={0.5}
      group={{
        name: 'toolbarItems',
      }}
      sort={true}
      draggable=".sha-toolbar-item"
      animation={75}
      ghostClass="sha-toolbar-item-ghost"
      emptyInsertThreshold={20}
      handle=".sha-toolbar-item-drag-handle"
      scroll={true}
      bubbleScroll={true}
    >
      {props.items.map((item, index) => renderItem(item, index))}
    </ReactSortable>
  );
};
export default ToolbarItemsContainer;
