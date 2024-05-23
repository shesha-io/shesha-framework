import { ButtonGroupItemProps } from '@/providers';
import { isGroup, isItem } from '@/providers/buttonGroupConfigurator/models';
import React, { FC } from 'react';
import { ButtonGroupItem } from './buttonGroupItem';
import { ButtonGroupItemsGroup } from './buttonGroupItemsGroup';
import { NestedItemsRenderingArgs } from '@/components/listEditor';

export interface IButtonGroupListItemProps {
  item: ButtonGroupItemProps;
  onChange: (newValue: ButtonGroupItemProps) => void;
  index: number[];
  nestedRenderer?: (args: NestedItemsRenderingArgs<ButtonGroupItemProps>) => React.ReactNode | null;
  initNewItem: (items: ButtonGroupItemProps[]) => ButtonGroupItemProps;
}

export const ButtonGroupListItem: FC<IButtonGroupListItemProps> = ({ item, onChange, index, nestedRenderer, initNewItem }) => {
  if (isItem(item))
    return <ButtonGroupItem key={item.id} item={item} />;

  if (isGroup(item))
    return (
      <ButtonGroupItemsGroup
        index={index}
        onChange={onChange}
        key={item.id}
        item={item}
        containerRendering={(args) => {
          return nestedRenderer({
            ...args,
            onChange: function (newValue: ButtonGroupItemProps[]): void {
              args.onChange(newValue);
            },
            initNewItem: initNewItem,
          });
        }}
      />
    );

  return null;
};