import React, { FC } from 'react';
import { ItemInterface, ReactSortable } from 'react-sortablejs';
import { removeEmptyArrayValues as rmvEmpty } from 'utils';
import { useToolbarConfigurator } from '../../../providers/toolbarConfigurator';
import { IButtonGroup, IToolbarButton, ToolbarItemProps } from '../../../providers/toolbarConfigurator/models';
import { ToolbarItem } from './toolbarItem';
import { ToolbarItemsGroup } from './toolbarItemsGroup';

export interface IToolbarItemsContainerProps {
  index?: number[];
  id?: string;
  items: ToolbarItemProps[];
}

export const ToolbarItemsContainer: FC<IToolbarItemsContainerProps> = (props) => {
  const { updateChildItems, readOnly } = useToolbarConfigurator();

  const renderItem = (item: ToolbarItemProps, index: number) => {
    switch (item.itemType) {
      case 'item':
        const itemProps = item as IToolbarButton;
        return <ToolbarItem key={index} index={[...props.index, index]} {...itemProps} />;

      case 'group':
        const groupProps = item as IButtonGroup;
        return (
          <ToolbarItemsGroup
            key={index}
            {...groupProps}
            index={[...props.index, index]}
            containerRendering={(args) => <ToolbarItemsContainer {...args} />}
          />
        );
    }
  };

  const onSetList = (newState: ItemInterface[], _sortable, _store) => {
    // temporary commented out, the behavoiur of the sortablejs differs sometimes
    const listChanged = true; //!newState.some(item => item.chosen !== null && item.chosen !== undefined);

    if (listChanged) {
      const newChilds = newState.map<ToolbarItemProps>((item) => item as ToolbarItemProps);

      updateChildItems({ index: props.index, id: props.id, childs: newChilds });
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
      {rmvEmpty(props.items.map((item, index) => renderItem(item, index)))}
    </ReactSortable>
  );
};
export default ToolbarItemsContainer;
