import React, { FC, useState, useTransition } from 'react';
import { ButtonGroupItemProps, IButtonGroup, IButtonGroupItem } from '@/providers';
import { ListEditor } from '@/components';
import { ListEditorRenderer } from '@/components/listEditorRenderer';
import { nanoid } from '@/utils/uuid';
import { ButtonGroupProperties } from './properties';
import { ButtonGroupListItem } from './buttonGroupListItem';
import { ListEditorSectionRenderingArgs } from '@/components/listEditor';
import { Alert, Button, Divider, Skeleton } from 'antd';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';
import { isGroup } from '@/providers/buttonGroupConfigurator/models';

export interface ButtonGroupSettingsEditorProps {
  readOnly: boolean;
  value: ButtonGroupItemProps[];
  onChange: (newValue: ButtonGroupItemProps[]) => void;
}

const ButtonGroupEditorHeader: FC<ListEditorSectionRenderingArgs<ButtonGroupItemProps>> = ({ contextAccessor, level, parentItem }) => {
  const { addItem, readOnly } = contextAccessor();
  const { styles } = useStyles();

  const onAddItemClick = () => {
    addItem();
  };

  const onAddGroupClick = () => {
    addItem((items) => {
      const itemsCount = (items ?? []).length;
      const itemNo = itemsCount + 1;

      const group: IButtonGroup = {
        id: nanoid(),
        itemType: 'group',
        sortOrder: itemsCount,
        name: `group${itemNo}`,
        label: `Group ${itemNo}`,
        buttonType: 'link',
        hideWhenEmpty: true,
        childItems: [],
        editMode: 'inherited'
      };
      return group;
    });
  };

  const parent = isGroup(parentItem)
    ? parentItem
    : undefined;

  return !readOnly
    ? level === 1
      ? (
        <div className={styles.customActionButtons}>
          <Button onClick={onAddGroupClick} type='primary'>Add Group</Button>
          <Button onClick={onAddItemClick} type='primary'>Add New Item</Button>
        </div>
      )
      : !(parent.childItems?.length)
        ? (
          <Divider style={{ marginTop: 0, marginBottom: 0 }}>
            <Button shape='round' size='small' type='link' onClick={onAddItemClick}>Add item</Button>
            <Divider type="vertical" />
            <Button shape='round' size='small' type='link' onClick={onAddGroupClick}>Add group</Button>
          </Divider>)
        : null
    : null;
};

export const ButtonGroupSettingsEditor: FC<ButtonGroupSettingsEditorProps> = ({ value, onChange, readOnly }) => {
  const [selectedItem, setSelectedItem] = useState<ButtonGroupItemProps>();
  const [isPending, startTransition] = useTransition();

  const onSelectionChange = (item: ButtonGroupItemProps) => {
    startTransition(() => {
      setSelectedItem(item);
    });    
  };

  const onItemUpdate = (newValues: ButtonGroupItemProps) => {
    if (!selectedItem || selectedItem.id !== newValues.id) return;

    Object.assign(selectedItem, newValues);
    onChange([...value]);
  };

  const makeNewItem = (items: ButtonGroupItemProps[]): ButtonGroupItemProps => {
    const itemsCount = (items ?? []).length;
    const itemNo = itemsCount + 1;

    const newItem: IButtonGroupItem = {
      id: nanoid(),
      itemType: 'item',
      sortOrder: itemsCount,
      name: `button${itemNo}`,
      label: `Button ${itemNo}`,
      itemSubType: 'button',
      buttonType: 'link',
      editMode: 'inherited'
    };

    return newItem;
  };

  return (
    <ListEditorRenderer
      sidebarProps={{
        title: 'Properties',
        content: isPending ? <Skeleton loading /> : <ButtonGroupProperties item={selectedItem} onChange={onItemUpdate} readOnly={readOnly} />,
      }}
    >
      <Alert message={readOnly ? 'Here you can view buttons configuration.' : 'Here you can configure the button group by adjusting their settings and ordering.'} />

      <ListEditor<ButtonGroupItemProps>
        value={value}
        onChange={onChange}
        initNewItem={makeNewItem}
        readOnly={readOnly}
        selectionType='single'
        onSelectionChange={onSelectionChange}
        header={ButtonGroupEditorHeader}
      >
        {({ item, itemOnChange, index, nestedRenderer }) => (
          <ButtonGroupListItem
            item={item}
            index={[index]}
            onChange={itemOnChange}
            nestedRenderer={nestedRenderer}
            initNewItem={makeNewItem}
          />
        )}
      </ListEditor>
    </ListEditorRenderer>
  );
};