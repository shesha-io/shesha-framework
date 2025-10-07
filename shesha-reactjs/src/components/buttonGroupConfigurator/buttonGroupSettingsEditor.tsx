import React, { FC } from 'react';
import { ButtonGroupItemProps, IButtonGroup, IButtonGroupItem } from '@/providers';
import { nanoid } from '@/utils/uuid';
import { ButtonGroupProperties } from './properties';
import { ButtonGroupListItem } from './buttonGroupListItem';
import { ListEditorSectionRenderingArgs } from '@/components/listEditor';
import { Alert, Button, Divider } from 'antd';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';
import { isGroup } from '@/providers/buttonGroupConfigurator/models';
import { ListEditorWithPropertiesPanel } from '../listEditorWithPropertiesPanel';
import { initialValues } from './utils';

export interface ButtonGroupSettingsEditorProps {
  readOnly: boolean;
  value: ButtonGroupItemProps[];
  onChange: (newValue: ButtonGroupItemProps[]) => void;
}

const ButtonGroupEditorHeader: FC<ListEditorSectionRenderingArgs<ButtonGroupItemProps>> = ({ contextAccessor, level, parentItem }) => {
  const { addItem, readOnly } = contextAccessor();
  const { styles } = useStyles();

  const onAddItemClick = (): void => {
    addItem();
  };

  const onAddGroupClick = (): void => {
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
        editMode: 'inherited',
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
          <Button onClick={onAddGroupClick} type="primary">Add Group</Button>
          <Button onClick={onAddItemClick} type="primary">Add New Item</Button>
        </div>
      )
      : !(parent.childItems?.length)
        ? (
          <Divider style={{ marginTop: 0, marginBottom: 0 }}>
            <Button shape="round" size="small" type="link" onClick={onAddItemClick}>Add item</Button>
            <Divider type="vertical" />
            <Button shape="round" size="small" type="link" onClick={onAddGroupClick}>Add group</Button>
          </Divider>
        )
        : null
    : null;
};

export const ButtonGroupSettingsEditor: FC<ButtonGroupSettingsEditorProps> = ({ value, onChange, readOnly }) => {
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
      editMode: 'inherited',
      ...initialValues(),
    };

    return newItem;
  };

  return (
    <ListEditorWithPropertiesPanel<ButtonGroupItemProps>
      value={value}
      onChange={onChange}
      initNewItem={makeNewItem}
      readOnly={readOnly}
      header={<Alert message={readOnly ? 'Here you can view buttons configuration.' : 'Here you can configure the button group by adjusting their settings and ordering.'} />}
      itemProperties={(itemProps) => (<ButtonGroupProperties item={itemProps.item} onChange={itemProps.onChange} readOnly={itemProps.readOnly} />)}
      groupHeader={ButtonGroupEditorHeader}
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
    </ListEditorWithPropertiesPanel>
  );
};
