import { CodeEditor } from '@/designer-components/codeEditor/codeEditor';
import React, { FC, useState } from 'react';
import SettingsCollapsiblePanel from '@/designer-components/_settings/settingsCollapsiblePanel';
import SettingsForm, { useSettingsForm } from '@/designer-components/_settings/settingsForm';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import { Button, Input, Modal } from 'antd';
import { ConfigurableActionConfigurator } from '@/designer-components/configurableActionsConfigurator/configurator';
import { IDataContextComponentProps } from '.';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { IPropertyMetadata, isPropertiesArray } from '@/interfaces/metadata';
import { ISettingsFormFactoryArgs } from '@/interfaces';
import { PropertiesEditor } from '@/components/modelConfigurator/propertiesEditor';
import { useAvailableConstantsMetadata } from '@/utils/metadata/useAvailableConstants';
import { PermissionAutocomplete } from '@/components/permissionAutocomplete';

interface IDataContextSettingsState extends IDataContextComponentProps { }

const convertPropertyMetadataToModelItem = (property: IPropertyMetadata) => {
  const res = { ...property, properties: [], name: property.path };
  delete res.path;
  if (isPropertiesArray(property.properties))
    res.properties = property.properties?.map((item) => convertPropertyMetadataToModelItem(item));
  return res as IModelItem;
};

const convertModelItemToPropertyMetadata = (item: IModelItem) => {
  const res = { ...item, properties: [], path: item.name };
  delete res.name;
  if (item.properties)
    res.properties = item.properties?.map((item) => convertModelItemToPropertyMetadata(item));
  return res as IPropertyMetadata;
};

const DataContextSettings: FC<ISettingsFormFactoryArgs<IDataContextComponentProps>> = (props) => {
  const { readOnly } = props;
  const { values, onValuesChange } = useSettingsForm<IDataContextComponentProps>();

  const constants = useAvailableConstantsMetadata({ 
    addGlobalConstants: true, 
  });

  const [open, setOpen] = useState<boolean>(false);
  const [properties, setProperties] = useState<IPropertyMetadata[]>([]);

  const openModal = () => {
    if (Array.isArray(values.items))
      setProperties([...values.items]);
    setOpen(true);
  };

  const items = values?.items?.map((item) => convertPropertyMetadataToModelItem(item));

  return (
    <>
      <SettingsCollapsiblePanel header="Data context">
        <SettingsFormItem 
          name='componentName'
          label="Component name"
          tooltip='This name will be used as identifier and in the code editor'
          required
        >
          {(value) =>
            <Input readOnly={readOnly} value={value} onChange={(e) => {
              const name = e.target.value;
              onValuesChange({ componentName: name, propertyName: name });
            }}
            />
          }
        </SettingsFormItem>

        <SettingsFormItem name='description' label="Description" jsSetting>
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
            language='typescript'
            wrapInTemplate={true}
            templateSettings={{
              functionName: 'initData',
              useAsyncDeclaration: true,
            }}
            availableConstants={constants}
            exposedVariables={[
              { name: "data", description: "Form values", type: "object" },
              { name: "contexts", description: "Contexts data", type: "object" },
              { name: "pageContext", description: "Data of page", type: "object" },
              { name: "globalState", description: "Global state", type: "object" },
              { name: "setGlobalState", description: "Functiont to set globalState", type: "function" },
              { name: "formMode", description: "Form mode", type: "'designer' | 'edit' | 'readonly'" },
              { name: "form", description: "Form instance", type: "object" },
              { name: "selectedRow", description: "Selected row of nearest table (null if not available)", type: "object" },
              { name: "moment", description: "moment", type: "object" },
              { name: "http", description: "axiosHttp", type: "object" },
              { name: "message", description: "message framework", type: "object" },
            ]}
          />
        </SettingsFormItem>

        <SettingsFormItem name="onInitAction" labelCol={{ span: 0 }} wrapperCol={{ span: 24 }}>
          <ConfigurableActionConfigurator
            editorConfig={null}
            level={1}
            label="On init data context"
            exposedVariables={[
              { name: "changedData", description: "Data context changed data", type: "object" },
              { name: "data", description: "Selected form values", type: "object" },
              { name: "contexts", description: "Contexts data", type: "object" },
              { name: "globalState", description: "Global state", type: "object" },
              { name: "setGlobalState", description: "Functiont to set globalState", type: "function" },
              { name: "formMode", description: "Form mode", type: "'designer' | 'edit' | 'readonly'" },
              { name: "form", description: "Form instance", type: "object" },
              { name: "selectedRow", description: "Selected row of nearest table (null if not available)", type: "object" },
              { name: "moment", description: "moment", type: "object" },
              { name: "http", description: "axiosHttp", type: "object" },
              { name: "message", description: "message framework", type: "object" },
            ]}
          />
        </SettingsFormItem>

        <SettingsFormItem name="onChangeAction" labelCol={{ span: 0 }} wrapperCol={{ span: 24 }}>
          <ConfigurableActionConfigurator
            editorConfig={null}
            level={1}
            label="On data context changed"
            exposedVariables={[
              { name: "changedData", description: "Data context changed data", type: "object" },
              { name: "data", description: "Selected form values", type: "object" },
              { name: "contexts", description: "Contexts data", type: "object" },
              { name: "globalState", description: "Global state", type: "object" },
              { name: "setGlobalState", description: "Functiont to set globalState", type: "function" },
              { name: "formMode", description: "Form mode", type: "'designer' | 'edit' | 'readonly'" },
              { name: "form", description: "Form instance", type: "object" },
              { name: "selectedRow", description: "Selected row of nearest table (null if not available)", type: "object" },
              { name: "moment", description: "moment", type: "object" },
              { name: "http", description: "axiosHttp", type: "object" },
              { name: "message", description: "message framework", type: "object" },
            ]}
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
          onValuesChange({ items: [...properties] });
          setOpen(false);
        }}
        onOk={() => setOpen(false)}
        width={'50%'}
      >
        <PropertiesEditor allowAdd value={items} onChange={(value) => {
          onValuesChange({ items: value?.map((item) => convertModelItemToPropertyMetadata(item)) });
        }} />
      </Modal>
    </>
  );
};

export const DataContextSettingsForm: FC<ISettingsFormFactoryArgs<IDataContextComponentProps>> = (props) => {
  return (
    SettingsForm<IDataContextSettingsState>({ ...props, children: <DataContextSettings {...props} /> })
  );
};