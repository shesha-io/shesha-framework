import { ButtonGroupItemProps } from '@/providers';
import { isGroup, isItem } from '@/providers/buttonGroupConfigurator/models';
import React, { FC, useMemo } from 'react';
import { ButtonGroupItem } from './buttonGroupItem';
import { ButtonGroupItemsGroup } from './buttonGroupItemsGroup';
import { NestedItemsRenderingArgs } from '@/components/listEditor';
import { getActualModel } from '@/providers/form/utils';

export interface IButtonGroupListItemProps {
  item: ButtonGroupItemProps;
  onChange: (newValue: ButtonGroupItemProps) => void;
  index: number[];
  nestedRenderer?: (args: NestedItemsRenderingArgs<ButtonGroupItemProps>) => React.ReactNode | null;
  initNewItem: (items: ButtonGroupItemProps[]) => ButtonGroupItemProps;
  actualModelContext?: any;
}

export const ButtonGroupListItem: FC<IButtonGroupListItemProps> = ({ item, onChange, index, nestedRenderer, initNewItem, actualModelContext }) => {
  const actualItem = useMemo(() => getActualModel(item, actualModelContext)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    , [item.label, item.icon, item.tooltip, item.name, actualModelContext]);

  if (isItem(actualItem))
    return <ButtonGroupItem key={item.id} item={actualItem} />;

  if (isGroup(actualItem))
    return (
      <ButtonGroupItemsGroup
        index={index}
        onChange={onChange}
        key={item.id}
        item={actualItem}
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