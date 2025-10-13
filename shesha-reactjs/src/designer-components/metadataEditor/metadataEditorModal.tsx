import React, { FC, useState } from 'react';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { ListEditor } from '@/components';
import { nanoid } from '@/utils/uuid';
import { Item } from '@/components/modelConfigurator/propertiesEditor/renderer-new/item';
import { ModelItemProperties } from '@/components/modelConfigurator/propertiesEditor/renderer-new/modelItemProperties';
import { IMetadataEditorProps } from './interfaces';
import { ListEditorRenderer } from '@/components/listEditorRenderer';
import { ListItem } from '@/components/listEditor/models';

type ItemType = IModelItem;

export type IMetadataEditorModalProps = IMetadataEditorProps;

export const MetadataEditorModal: FC<IMetadataEditorModalProps> = ({ value, onChange, readOnly }) => {
  const [selectedItem, setSelectedItem] = useState<ItemType>();

  const onSelectionChange = (item: ItemType): void => {
    setSelectedItem(item);
  };

  const onItemUpdate = (newValues: ItemType): void => {
    if (!selectedItem || selectedItem.id !== newValues.id) return;

    Object.assign(selectedItem, newValues);
    onChange([...value]);
  };

  const makeNewItem = (items: IModelItem[]): IModelItem => {
    return {
      id: nanoid(),
      name: `NewProperty${(items ?? []).length + 1}`,
      label: `New Property ${(items ?? []).length + 1}`,
      dataType: '',
    };
  };

  return (
    <ListEditorRenderer
      sidebarProps={{
        title: 'Properties',
        content: <ModelItemProperties item={selectedItem} onChange={onItemUpdate} />,
      }}
    >
      <ListEditor<ItemType & ListItem>
        value={value}
        onChange={onChange}
        initNewItem={makeNewItem}
        readOnly={readOnly}
        selectionType="single"
        onSelectionChange={onSelectionChange}
      >
        {({ item, index, itemOnChange, nestedRenderer }) => {
          return (
            <Item
              itemProps={item}
              index={[index]}
              key={item?.id}
              onChange={(newValue) => {
                itemOnChange({ ...newValue }, undefined);
              }}
              containerRendering={(args) => {
                return nestedRenderer({
                  ...args,
                  onChange: (newValue: IModelItem[], changeDetails) => {
                    args.onChange(newValue, changeDetails);
                  },
                  initNewItem: makeNewItem,
                });
              }}
            />
          );
        }}
      </ListEditor>
    </ListEditorRenderer>
  );
};
