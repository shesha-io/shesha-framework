import React, { FC } from 'react';
import { FilterItem } from './filterItem';
import { useTableViewSelectorConfigurator } from '../../../../../providers/tableViewSelectorConfigurator';
import { ITableViewProps } from '../../../../../providers/tableViewSelectorConfigurator/models';
import { ReactSortable, ItemInterface } from 'react-sortablejs';

export interface IFilterContainerProps {
  index?: number[];
  items: ITableViewProps[];
}

export const FilterContainer: FC<IFilterContainerProps> = props => {
  const { updateChildItems, readOnly } = useTableViewSelectorConfigurator();

  const onSetList = (newState: ItemInterface[], _sortable, _store) => {
    // temporary commented out, the behavoiur of the sortablejs differs sometimes
    const listChanged = true; //!newState.some(item => item.chosen !== null && item.chosen !== undefined);

    if (listChanged) {
      const newChilds = newState.map<ITableViewProps>(item => item as ITableViewProps);
      updateChildItems({ index: props.index, childs: newChilds });
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
      {props.items.map((item, index) => (
        <FilterItem index={[index]} key={index} {...item} />
      ))}
    </ReactSortable>
  );
};
export default FilterContainer;
