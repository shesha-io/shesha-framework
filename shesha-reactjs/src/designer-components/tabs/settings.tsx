import EditableTagGroup from '@/components/editableTagGroup';
import ItemListSettingsModal from '../itemListConfigurator/itemListSettingsModal';
import itemSettings from './itemSettings.json';
import React, { FC } from 'react';
import SettingsForm, { useSettingsForm } from '@/designer-components/_settings/settingsForm';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import StyleBox from '../styleBox/components/box';
import { Checkbox, Input, Select } from 'antd';
import { CodeEditor } from '@/components';
import { FormMarkup } from '@/providers/form/models';
import { ISettingsFormFactoryArgs } from '@/interfaces';
import { ITabPaneProps, ITabsComponentProps } from './models';
import { nanoid } from '@/utils/uuid';
import SettingsCollapsiblePanel from '@/designer-components/_settings/settingsCollapsiblePanel';

const { Option } = Select;

const TabSettings: FC<ISettingsFormFactoryArgs<ITabsComponentProps>> = ({ readOnly }) => {
  const { model } = useSettingsForm<ITabsComponentProps>();

  const onAddNewItem = (_, count: number) => {
    const id = nanoid();
    const buttonProps: ITabPaneProps = {
      id: id,
      itemType: 'item',
      sortOrder: count,
      name: `Tab${count + 1}`,
      key: id,
      title: `Tab ${count + 1}`,
      editMode: 'editable',
      selectMode: 'editable',
      components: [],
    };

    return buttonProps;
  };

  const tabs = model.tabs?.map((item) => ({ ...item, label: item?.title }));

  return (
    <>
      <SettingsCollapsiblePanel header='Display'>
      <SettingsFormItem name="componentName" label="Component name" required={true}>
        <Input />
      </SettingsFormItem>

      <SettingsFormItem name="defaultActiveKey" label="Default Active Key" required={true}>
        <Input />
      </SettingsFormItem>

      <SettingsFormItem name="tabType" label="Tab Type">
        <Select allowClear>
          <Option value="line">Line</Option>
          <Option value="card">Card</Option>
        </Select>
      </SettingsFormItem>

      <SettingsFormItem name="size" label="Size" tooltip="This will set the size for all buttons" jsSetting>
        <Select>
          <Option value="small">Small</Option>
          <Option value="middle">Middle</Option>
          <Option value="large">Large</Option>
        </Select>
      </SettingsFormItem>

      <SettingsFormItem name="position" label="Position" tooltip="This will set the size for all buttons" jsSetting>
        <Select>
          <Option value="top">Top</Option>
          <Option value="bottom">Bottom</Option>
          <Option value="left">Left</Option>
          <Option value="right">Right</Option>
        </Select>
      </SettingsFormItem>

      <SettingsFormItem name="hidden" label="Hidden" valuePropName="checked" jsSetting>
        <Checkbox disabled={readOnly} />
      </SettingsFormItem>
      </SettingsCollapsiblePanel>
      <SettingsCollapsiblePanel header="Configure Tab Panes">
      <SettingsFormItem name="tabs">
        <ItemListSettingsModal
          options={{ onAddNewItem }}
          title="Configure Tabs"
          heading="Settings"
          insertMode="after"
          callToAction="Configure Tab Panes"
          itemTypeMarkup={itemSettings as FormMarkup}
          allowAddGroups={false}
          value={tabs}
        />
      </SettingsFormItem>
      </SettingsCollapsiblePanel>

    
     <SettingsCollapsiblePanel header="Security">
      <SettingsFormItem
        label="Permissions"
        name="permissions"
        tooltip="Enter a list of permissions that should be associated with this component"
        jsSetting
      >
        <EditableTagGroup />
      </SettingsFormItem>
      </SettingsCollapsiblePanel>

      <SettingsCollapsiblePanel header="Style" >
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
          exposedVariables={[
            {
              id: 'f9f25102-bdc7-41bc-b4bc-87eea6a86fc5',
              name: 'data',
              description: 'Selected form values',
              type: 'object',
            },
            {
              id: '6374545e-4848-4e92-9846-27f2a7884c41',
              name: 'globalState',
              description: 'The global state of the application',
              type: 'object',
            },
          ]}
        />
      </SettingsFormItem>

      <SettingsFormItem name="stylingBox">
        <StyleBox />
      </SettingsFormItem>
      </SettingsCollapsiblePanel>
    </>
  );
};

export const TabSettingsForm: FC<ISettingsFormFactoryArgs<ITabsComponentProps>> = (props) => {
  return SettingsForm<ITabsComponentProps>({ ...props, children: <TabSettings {...props} /> });
};