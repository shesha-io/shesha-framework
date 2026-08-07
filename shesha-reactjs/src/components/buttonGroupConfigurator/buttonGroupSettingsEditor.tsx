import React, { FC, ReactNode } from 'react';
import { ButtonGroupItemProps, IButtonGroup } from '@/providers';
import { nanoid } from '@/utils/uuid';
import { ButtonGroupProperties } from './properties';
import { ButtonGroupListItem } from './buttonGroupListItem';
import { ListEditorSectionRenderingArgs } from '@/components/listEditor';
import { Alert, Button, Divider } from 'antd';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';
import { isGroup } from '@/providers/buttonGroupConfigurator/models';
import { ListEditorWithPropertiesPanel } from '../listEditorWithPropertiesPanel';
import { makeNewItem } from './utils';
import { isDefined } from '@/utils/nullables';
import { useFormDesignerComponentGetter } from '@/providers/form/hooks';

export interface ButtonGroupSettingsEditorProps {
  readOnly: boolean;
  value: ButtonGroupItemProps[];
  onChange: (newValue: ButtonGroupItemProps[]) => void;
}

const ButtonGroupEditorHeader = ({ contextAccessor, level, parentItem }: ListEditorSectionRenderingArgs<ButtonGroupItemProps>): ReactNode => {
  const { addItem, readOnly } = contextAccessor();
  const { styles } = useStyles();

  const onAddItemClick = (): void => {
    addItem();
  };

  const onAddGroupClick = (): void => {
    addItem((items) => {
      const itemsCount = items.length;
      const itemNo = itemsCount + 1;

      const group: IButtonGroup = {
        id: nanoid(),
        itemType: 'group',
        sortOrder: itemsCount,
        name: `group${itemNo}`,
        label: `Group ${itemNo}`,
        buttonType: 'default',
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

  return !Boolean(readOnly)
    ? level === 1
      ? (
        <div className={styles.customActionButtons}>
          <Button onClick={onAddGroupClick} type="primary">Add Group</Button>
          <Button onClick={onAddItemClick} type="primary">Add New Item</Button>
        </div>
      )
      : isDefined(parent) && !Boolean(parent.childItems?.length)
        ? (
          <Divider style={{ marginTop: 0, marginBottom: 0 }}>
            <Button shape="round" size="small" type="link" onClick={onAddItemClick}>Add item</Button>
            <Divider orientation="vertical" />
            <Button shape="round" size="small" type="link" onClick={onAddGroupClick}>Add group</Button>
          </Divider>
        )
        : null
    : null;
};

export const ButtonGroupSettingsEditor: FC<ButtonGroupSettingsEditorProps> = ({ value, onChange, readOnly }) => {
  const componentGetter = useFormDesignerComponentGetter();
  const buttonComponent = componentGetter('button');

  if (!isDefined(buttonComponent)) throw new Error("The 'button' component is not registered in the toolbox. Button group configuration is unavailable.");

  return (
    <ListEditorWithPropertiesPanel<ButtonGroupItemProps>
      value={value}
      onChange={onChange}
      initNewItem={makeNewItem}
      readOnly={readOnly}
      header={<Alert title={readOnly ? 'Here you can view buttons configuration.' : 'Here you can configure the button group by adjusting their settings and ordering.'} />}
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
          buttonComponent={buttonComponent}
        />
      )}
    </ListEditorWithPropertiesPanel>
  );
};
