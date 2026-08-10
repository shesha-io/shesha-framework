import { CodeEditor } from '@/designer-components/codeEditor/codeEditor';
import React, { FC, useState } from 'react';
import SettingsCollapsiblePanel from '@/designer-components/_settings/settingsCollapsiblePanel';
import SettingsForm, { useSettingsForm } from '@/designer-components/_settings/settingsForm';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import { Button, Input, Modal } from 'antd';
import { ConfigurableActionConfigurator } from '@/designer-components/configurableActionsConfigurator/configurator';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { IPropertyMetadata, isPropertiesArray } from '@/interfaces/metadata';
import { IComponentSettingsFormFactoryArgs, ISettingsFormFactoryArgs } from '@/interfaces';
import { PropertiesEditor } from '@/components/modelConfigurator/propertiesEditor';
import { useAvailableConstantsMetadata } from '@/utils/metadata/hooks';
import { PermissionAutocomplete } from '@/components/permissionAutocomplete';
import { IDataContextComponentProps } from './interfaces';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';

type IDataContextSettingsState = IDataContextComponentProps;

const convertPropertyMetadataToModelItem = (property: IPropertyMetadata): IModelItem => {
  const { path, properties, itemsType, ...commonProps } = property;

  return {
    ...commonProps,
    id: path,
    name: path,
    columnName: commonProps.columnName ?? undefined,
    itemsType: itemsType ? convertPropertyMetadataToModelItem(itemsType) : undefined,
    properties: isPropertiesArray(properties)
      ? properties.map((item) => convertPropertyMetadataToModelItem(item))
      : undefined,
    entityType: isDefined(property.entityType) && !isNullOrWhiteSpace(property.entityType)
      ? { module: property.entityModule ?? null, name: property.entityType }
      : undefined,
    inheritedFromId: commonProps.inheritedFromId ?? undefined,
  } satisfies IModelItem;
};

const convertModelItemToPropertyMetadata = (item: IModelItem): IPropertyMetadata => {
  const { name, properties, itemsType, entityType, ...commonProps } = item;
  return {
    ...commonProps,
    path: name ?? "",
    properties: properties?.map((item) => convertModelItemToPropertyMetadata(item)),
    itemsType: itemsType ? convertModelItemToPropertyMetadata(itemsType) : undefined,
    entityType: entityType?.name,
    entityModule: entityType?.module ?? undefined,
    isVisible: true,
  } satisfies IPropertyMetadata;
};

const DataContextSettings: FC<IComponentSettingsFormFactoryArgs<IDataContextComponentProps>> = (props) => {
  const { readOnly } = props;
  const { values, onValuesChange } = useSettingsForm<IDataContextComponentProps>();

  const constants = useAvailableConstantsMetadata({
    addGlobalConstants: true,
  });

  const [open, setOpen] = useState<boolean>(false);
  const [properties, setProperties] = useState<IPropertyMetadata[]>([]);

  const openModal = (): void => {
    if (values && Array.isArray(values.items))
      setProperties([...values.items]);
    setOpen(true);
  };

  const items = values?.items?.map((item) => convertPropertyMetadataToModelItem(item));

  return (
    <>
      <SettingsCollapsiblePanel header="Data context">
        <SettingsFormItem
          name="componentName"
          label="Component name"
          tooltip="This name will be used as identifier and in the code editor"
          required
        >
          {(value) => (
            <Input
              readOnly={readOnly}
              value={value as string}
              onChange={(e) => {
                const name = e.target.value;
                onValuesChange?.({ componentName: name, propertyName: name });
              }}
            />
          )}
        </SettingsFormItem>

        <SettingsFormItem name="description" label="Description" jsSetting>
          <Input readOnly={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="items" label="Context metadata" jsSetting>
          <Button onClick={openModal}>Configure metadata</Button>
        </SettingsFormItem>

        <SettingsFormItem name="initialDataCode" label="Initial Data">
          <CodeEditor
            readOnly={readOnly}
            mode="dialog"
            label="Initial Data"
            propertyName="initialDataCode"
            description="Initial Data"
            language="typescript"
            wrapInTemplate={true}
            templateSettings={{
              functionName: 'initData',
              useAsyncDeclaration: true,
            }}
            availableConstants={constants}
          />
        </SettingsFormItem>

        <SettingsFormItem name="onInitAction" labelCol={{ span: 0 }} wrapperCol={{ span: 24 }}>
          <ConfigurableActionConfigurator
            editorConfig={undefined}
            level={1}
            label="On init data context"
          />
        </SettingsFormItem>

        <SettingsFormItem name="onChangeAction" labelCol={{ span: 0 }} wrapperCol={{ span: 24 }}>
          <ConfigurableActionConfigurator
            editorConfig={undefined}
            level={1}
            label="On data context changed"
          />
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

      <Modal
        title="Configure metadata"
        open={open}
        onCancel={() => {
          onValuesChange?.({ items: [...properties] });
          setOpen(false);
        }}
        onOk={() => setOpen(false)}
        width="50%"
      >
        <PropertiesEditor
          allowAdd
          value={items}
          onChange={(value) => {
            onValuesChange?.({ items: value.map((item) => convertModelItemToPropertyMetadata(item)) });
          }}
        />
      </Modal>
    </>
  );
};

export const DataContextSettingsForm: FC<ISettingsFormFactoryArgs<IDataContextComponentProps>> = (props) => {
  return (
    SettingsForm<IDataContextSettingsState>({ ...props, children: <DataContextSettings {...props} /> })
  );
};
