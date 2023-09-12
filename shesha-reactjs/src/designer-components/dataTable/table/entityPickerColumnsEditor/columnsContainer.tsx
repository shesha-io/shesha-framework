import React, { FC } from 'react';
import { ItemInterface, ReactSortable } from 'react-sortablejs';
import { useColumnsConfigurator } from '../../../../providers/datatableColumnsConfigurator';
import {
  IConfigurableColumnGroup,
  IConfigurableColumnsBase,
  IConfigurableColumnsProps,
} from '../../../../providers/datatableColumnsConfigurator/models';
import { Column } from './column';
import { ColumnsGroup } from './columnsGroup';

export interface IColumnsContainerProps {
  index?: number[];
  items: IConfigurableColumnsBase[];
}

export const ColumnsContainer: FC<IColumnsContainerProps> = (props) => {
  const { updateChildItems } = useColumnsConfigurator();

  const renderItem = (item: IConfigurableColumnsBase, index: number) => {
    switch (item.itemType) {
      case 'item':
        const itemProps = item as IConfigurableColumnsProps;
        return <Column key={index} index={[...props.index, index]} {...itemProps} />;

      case 'group':
        const groupProps = item as IConfigurableColumnGroup;
        return (
          <ColumnsGroup
            key={index}
            {...groupProps}
            index={[...props.index, index]}
            containerRendering={(args) => <ColumnsContainer {...args} />}
          />
        );
    }
  };

  const onSetList = (newState: ItemInterface[], _sortable, _store) => {
    // temporary commented out, the behavoiur of the sortablejs differs sometimes
    const listChanged = true; //!newState.some(item => item.chosen !== null && item.chosen !== undefined);

    if (listChanged) {
      const newChilds = newState.map<IConfigurableColumnsBase>((item) => item as IConfigurableColumnsBase);
      updateChildItems({ index: props.index, childs: newChilds });
    }
    return;
  };

  return (
    <ReactSortable
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
      {props.items.map((item, index) => renderItem(item, index))}
    </ReactSortable>
  );
};
export default ColumnsContainer;
