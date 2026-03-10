import { ListItemWithId } from '@/components/listEditor/models';
import { ListEditorWithPropertiesPanel } from '@/components/listEditorWithPropertiesPanel';
import React from 'react';
import { PropertiesPanel } from './propertiesPanel';
import { DefaultListItem } from './defaultListItem';
import { DefaultItemRenderer, ItemSettingsMarkupFactory, isDefaultItemRenderingProps } from './interfaces';
import { ListEditorChildrenFn } from '@/components/listEditor';

export interface IItemListConfiguratorProps<TItem extends ListItemWithId> {
  readOnly: boolean;
  value: TItem[];
  onChange: (newValue: TItem[]) => void;
  initNewItem: (items: TItem[]) => TItem;

  settingsMarkupFactory: ItemSettingsMarkupFactory<TItem>;
  itemRenderer: ListEditorChildrenFn<TItem> | DefaultItemRenderer<TItem>;
  header?: React.ReactNode;
}

export const ItemListConfigurator = <TItem extends ListItemWithId>(props: IItemListConfiguratorProps<TItem>): JSX.Element => {
  const {
    value,
    onChange,
    initNewItem,
    readOnly,
    settingsMarkupFactory,
    itemRenderer,
    header,
  } = props;
  return (
    <ListEditorWithPropertiesPanel<TItem>
      value={value}
      onChange={onChange}
      initNewItem={initNewItem}
      readOnly={readOnly}
      header={header}
      itemProperties={(itemProps) => (
        <PropertiesPanel
          item={itemProps.item}
          onChange={itemProps.onChange}
          readOnly={itemProps.readOnly}
          settingsMarkupFactory={settingsMarkupFactory}
        />
      )}
    >
      {(itemProps) => {
        const rendered = itemRenderer(itemProps);
        return isDefaultItemRenderingProps(rendered)
          ? <DefaultListItem item={rendered} />
          : rendered;
      }}
    </ListEditorWithPropertiesPanel>
  );
};
