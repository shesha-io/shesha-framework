import React, { FC, useState } from 'react';
import CodeEditor from '@/components/formDesigner/components/codeEditor/codeEditor';
import { ISettingsFormFactoryArgs } from '@/interfaces';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import SettingsForm, { useSettingsForm } from '@/designer-components/_settings/settingsForm';
import { IDataContextComponentProps } from '.';
import { Button, Input, Modal } from 'antd';
import SettingsCollapsiblePanel from '@/designer-components/_settings/settingsCollapsiblePanel';
import { IPropertyMetadata } from '@/interfaces/metadata';
import { PropertiesEditor } from '@/components/modelConfigurator/propertiesEditor';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { ConfigurableActionConfigurator } from '@/designer-components/configurableActionsConfigurator/configurator';

interface IDataContextSettingsState extends IDataContextComponentProps { }

export const DataContextSettingsForm: FC<ISettingsFormFactoryArgs<IDataContextComponentProps>> = (props) => {
  return (
    SettingsForm<IDataContextSettingsState>({...props, children: <DataContextSettings {...props}/>})
  );
};

const convertPropertyMetadataToModelItem = (property: IPropertyMetadata) => {
  const res = {...property, properties: [], name: property.path};
  delete res.path;
  if (property.properties)
    res.properties = property.properties?.map((item) => convertPropertyMetadataToModelItem(item));
  return res as IModelItem;
};

const convertModelItemToPropertyMetadata = (item: IModelItem) => {
  const res = {...item, properties: [], path: item.name};
  delete res.name;
  if (item.properties)
    res.properties = item.properties?.map((item) => convertModelItemToPropertyMetadata(item));
  return res as IPropertyMetadata;
};

const DataContextSettings: FC<ISettingsFormFactoryArgs<IDataContextComponentProps>> = ({readOnly}) => {
  const { model, onValuesChange } = useSettingsForm<IDataContextComponentProps>();

  const [open, setOpen] = useState<boolean>(false);
  const [properties, setProperties] = useState<IPropertyMetadata[]>([]);

  const openModal = () => {
    if (Array.isArray(model.items))
      setProperties([...model.items]);
    setOpen(true);
  };

  const items = model?.items?.map((item) => convertPropertyMetadataToModelItem(item));

  return (
    <>
    <SettingsCollapsiblePanel header="Data context">
      <SettingsFormItem name='componentName' label="Component name" tooltip='This name will be used as identifier and in the code editor' required>
        {(value) => 
          <Input readOnly={readOnly} value={value} onChange={(e) => {
              const name = e.target.value;
              onValuesChange({componentName: name, propertyName: name});
            }}
          />
        }
      </SettingsFormItem>

      <SettingsFormItem name='description' label="Description">
        <Input readOnly={readOnly} />
      </SettingsFormItem>

      <SettingsFormItem name="initialDataCode" label="Context metadata" jsSetting>
        <Button onClick={openModal}>Configure metadata</Button>
      </SettingsFormItem>

      <SettingsFormItem name="initialDataCode" label="Initial Data">
        <CodeEditor
          readOnly={readOnly}
          mode="dialog"
          label="Initial Data"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          propertyName="initialDataCode"
          description="Initial Data"
          exposedVariables={[
            {
              id: '788673a5-5eb9-4a9a-a34b-d8cea9cacb3c',
              name: 'data',
              description: 'Form data',
              type: 'object',
            },
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
            { name: "staticValue", description: "Static value of this setting", type: "any" },
            { name: "getSettingValue", description: "Functiont to get actual setting value", type: "function" },
            { name: "form", description: "Form instance", type: "object" },
            { name: "selectedRow", description: "Selected row of nearest table (null if not available)", type: "object" },
            { name: "moment", description: "moment", type: "object" },
            { name: "http", description: "axiosHttp", type: "object" },
            { name: "message", description: "message framework", type: "object" },
        ]}
        />
      </SettingsFormItem>

    </SettingsCollapsiblePanel>

    <Modal
      title="Configure metadata"
      open={open}
      onCancel={() => {
        onValuesChange({items: [...properties]});
        setOpen(false);
      }}
      onOk={() => setOpen(false)}
      width={'50%'}
      okButtonProps={{}}
    >
        <PropertiesEditor allowAdd value={items} onChange={(value) => {
          onValuesChange({items: value?.map((item) => convertModelItemToPropertyMetadata(item))});
        }} />
    </Modal>
    </>
  );
};
