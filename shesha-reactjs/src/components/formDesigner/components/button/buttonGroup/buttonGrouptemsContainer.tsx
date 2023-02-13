import React, { FC } from 'react';
import { ButtonGroupItem } from './buttonGroupItem';
import { ButtonGroupItemsGroup } from './buttonGrouptemsGroup';
import { useButtonGroupConfigurator } from '../../../../../providers/buttonGroupConfigurator';
import {
  IButtonGroup,
  IButtonGroupButton,
  ButtonGroupItemProps,
} from '../../../../../providers/buttonGroupConfigurator/models';
import { ReactSortable, ItemInterface } from 'react-sortablejs';

export interface IButtonGroupItemsSortableProps {
  index?: number[];
  id?: string;
  items: ButtonGroupItemProps[];
}

export const ButtonGroupItemsContainer: FC<IButtonGroupItemsSortableProps> = props => {
  const { updateChildItems, readOnly } = useButtonGroupConfigurator();

  const renderItem = (item: ButtonGroupItemProps, index: number) => {
    switch (item.itemType) {
      case 'item':
        const itemProps = item as IButtonGroupButton;
        return <ButtonGroupItem key={index} index={[...props.index, index]} {...itemProps} />;

      case 'group':
        const groupProps = item as IButtonGroup;
        return <ButtonGroupItemsGroup key={index} {...groupProps} index={[...props.index, index]} />;
    }
  };

  const onSetList = (newState: ItemInterface[], _sortable, _store) => {
    // temporary commented out, the behavoiur of the sortablejs differs sometimes
    const listChanged = true; //!newState.some(item => item.chosen !== null && item.chosen !== undefined);

    if (listChanged) {
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
      draggable=".sha-button-group-item"
      animation={75}
      ghostClass="sha-button-group-item-ghost"
      emptyInsertThreshold={20}
      handle=".sha-button-group-item-drag-handle"
      scroll={true}
      bubbleScroll={true}
    >
      {props.items.map((item, index) => renderItem(item, index))}
    </ReactSortable>
  );
};
export default ButtonGroupItemsContainer;
