import { ButtonGroupItemProps } from '@/providers';
import { isGroup, isItem } from '@/providers/buttonGroupConfigurator/models';
import React, { FC } from 'react';
import { ButtonGroupItem } from './buttonGroupItem';
import { ButtonGroupItemsGroup } from './buttonGroupItemsGroup';
import { ItemChangeDetails, NestedItemsRenderingArgs } from '@/components/listEditor';
import { IToolboxComponent } from '@/interfaces';

export interface IButtonGroupListItemProps {
  item: ButtonGroupItemProps;
  onChange: (newValue: ButtonGroupItemProps, changeDetails?: ItemChangeDetails) => void;
  index: number[];
  nestedRenderer?: ((args: NestedItemsRenderingArgs<ButtonGroupItemProps>) => React.ReactNode | null) | undefined;
  initNewItem: (items: ButtonGroupItemProps[]) => ButtonGroupItemProps;
  buttonComponent: IToolboxComponent;
}

export const ButtonGroupListItem: FC<IButtonGroupListItemProps> = ({ item, onChange, index, nestedRenderer, initNewItem, buttonComponent }) => {
  if (isItem(item))
    return <ButtonGroupItem key={item.id} item={item} buttonComponent={buttonComponent} />;

  if (isGroup(item))
    return (
      <ButtonGroupItemsGroup
        buttonComponent={buttonComponent}
        index={index}
        onChange={onChange}
        key={item.id}
        item={item}
        containerRendering={(args) => {
          return nestedRenderer
            ? nestedRenderer({
              ...args,
              initNewItem: initNewItem,
            })
            : undefined;
        }}
      />
    );

  return null;
};
