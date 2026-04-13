import itemSettings from './itemSettings.json';
import React, { FC } from 'react';
import SettingsForm from '@/designer-components/_settings/settingsForm';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import { Alert, Checkbox, Input, Select } from 'antd';
import { CodeEditor } from '@/designer-components/codeEditor/codeEditor';
import { PermissionAutocomplete } from '@/components/permissionAutocomplete';
import { FormMarkup } from '@/providers/form/models';
import { ISettingsFormFactoryArgs } from '@/interfaces';
import { ITabPaneProps, IPropertiesTabsComponentProps } from './models';
import { nanoid } from '@/utils/uuid';
import SettingsCollapsiblePanel from '@/designer-components/_settings/settingsCollapsiblePanel';
import { ItemListConfiguratorModal } from '@/designer-components/itemListConfigurator/itemListConfiguratorModal';
import StyleBox from '@/designer-components/styleBox/components/box';
import { DefaultOptionType } from 'antd/lib/select';

const tabSettingsMarkup = itemSettings as FormMarkup;

const TAB_TYPES: DefaultOptionType[] = [
  { value: 'line', label: 'Line' },
  { value: 'card', label: 'Card' },
];
const SIZES: DefaultOptionType[] = [
  { value: 'small', label: 'Small' },
  { value: 'middle', label: 'Middle' },
  { value: 'large', label: 'Large' },
];

const POSITIONS: DefaultOptionType[] = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

const TabSettings: FC<ISettingsFormFactoryArgs<IPropertiesTabsComponentProps>> = (props) => {
  const { readOnly } = props;

  const onAddNewItem = (items): ITabPaneProps => {
    const count = (items ?? []).length;
    const id = nanoid();
    const buttonProps: ITabPaneProps = {
      id: id,
      name: `Tab${count + 1}`,
      key: id,
      title: `Tab ${count + 1}`,
      editMode: 'inherited',
      selectMode: 'editable',
      components: [],
    };

    return buttonProps;
  };

  return (
    <>
      <SettingsCollapsiblePanel header="Display">
        <SettingsFormItem name="componentName" label="Component name" required={true}>
          <Input />
        </SettingsFormItem>

        <SettingsFormItem name="defaultActiveKey" label="Default Active Key" required={true}>
          <Input />
        </SettingsFormItem>

        <SettingsFormItem name="tabType" label="Tab Type">
          <Select allowClear options={TAB_TYPES} />
        </SettingsFormItem>

        <SettingsFormItem name="size" label="Size" tooltip="This will set the size for all buttons" jsSetting>
          <Select options={SIZES} />
        </SettingsFormItem>

        <SettingsFormItem name="position" label="Position" tooltip="This will set the size for all buttons" jsSetting>
          <Select options={POSITIONS} />
        </SettingsFormItem>

        <SettingsFormItem name="hidden" label="Hidden" valuePropName="checked" jsSetting>
          <Checkbox disabled={readOnly} />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>
      <SettingsCollapsiblePanel header="Configure Tab Panes">
        <SettingsFormItem name="tabs">
          <ItemListConfiguratorModal<ITabPaneProps>
            readOnly={readOnly}
            initNewItem={onAddNewItem}
            settingsMarkupFactory={() => tabSettingsMarkup}
            itemRenderer={({ item }) => ({
              label: item.title || item.label || item.name,
              description: item.tooltip,
              icon: item.icon,
            })}
            buttonText={readOnly ? "View Tab Panes" : "Configure Tab Panes"}
            modalSettings={{
              title: readOnly ? "View Tab Panes" : "Configure Tab Panes",
              header: <Alert title={readOnly ? 'Here you can view tab panes configuration.' : 'Here you can configure the tab panes by adjusting their settings and ordering.'} />,
            }}
          >
          </ItemListConfiguratorModal>
        </SettingsFormItem>
      </SettingsCollapsiblePanel>

      <SettingsCollapsiblePanel header="Style">
        <SettingsFormItem
          label="Style"
          name="style"
          tooltip="A script that returns the style of the element as an object. This should conform to CSSProperties"
        >
          <CodeEditor
            propertyName="style"
            readOnly={readOnly}
            mode="dialog"
            label="Style"
            description="A script that returns the style of the element as an object. This should conform to CSSProperties"
          />
        </SettingsFormItem>

        <SettingsFormItem name="stylingBox">
          <StyleBox />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>

      <SettingsCollapsiblePanel header="Security">
        <SettingsFormItem
          jsSetting
          label="Permissions"
          name="permissions"
          initialValue={props.model.permissions}
          tooltip="Enter a list of permissions that should be associated with this component"
        >
          <PermissionAutocomplete readOnly={readOnly} />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>
    </>
  );
};

export const TabSettingsForm: FC<ISettingsFormFactoryArgs<IPropertiesTabsComponentProps>> = (props) => {
  return SettingsForm<IPropertiesTabsComponentProps>({ ...props, children: <TabSettings {...props} /> });
};
