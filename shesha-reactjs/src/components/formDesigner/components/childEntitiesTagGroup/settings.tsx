import { Checkbox, Form, Input, Select } from 'antd';
import React, { FC } from 'react';
import FormAutocomplete from '../../../formAutocomplete';
import PropertyAutocomplete from '../../../propertyAutocomplete/propertyAutocomplete';
import SectionSeparator from '../../../sectionSeparator';
import CodeEditor from '../codeEditor/codeEditor';
import { IChildEntitiesTagGroupProps } from './models';

const FormItem = Form.Item;
const { Option } = Select;

export interface IChildEntitiesTagGroupSettingsProps {
  readOnly: boolean;
  model: IChildEntitiesTagGroupProps;
  onSave: (model: IChildEntitiesTagGroupProps) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: IChildEntitiesTagGroupProps) => void;
}

export const ChildEntitiesTagGroupSettings: FC<IChildEntitiesTagGroupSettingsProps> = ({
  readOnly,
  onSave,
  model,
  onValuesChange,
}) => {
  const [form] = Form.useForm();

  const handleValuesChange = (changedValues: IChildEntitiesTagGroupProps, values: IChildEntitiesTagGroupProps) => {
    if (readOnly) return;

    form?.setFieldsValue(changedValues);

    onValuesChange(changedValues, values);
  };

  return (
    <Form form={form} onFinish={onSave} layout="vertical" onValuesChange={handleValuesChange} initialValues={model}>
      <SectionSeparator title="Display" />

      <FormItem name="name" label="Name" rules={[{ required: true }]}>
        <PropertyAutocomplete id="415cc8ec-2fd1-4c5a-88e2-965153e16069" readOnly={readOnly} />
      </FormItem>

      <FormItem name="label" label="Label">
        <Input readOnly={readOnly} />
      </FormItem>

      <FormItem name="labelAlign" label="Label align">
        <Select disabled={readOnly}>
          <Option value="left">left</Option>
          <Option value="right">right</Option>
        </Select>
      </FormItem>

      <Form.Item name="readOnly" label="Read Only" valuePropName="checked">
        <Checkbox disabled={readOnly} />
      </Form.Item>

      <SectionSeparator title="Modal Display" />

      <FormItem name="deleteConfirmationTitle" label="Delete Confirmation Title">
        <Input readOnly={readOnly} />
      </FormItem>

      <FormItem name="deleteConfirmationBody" label="Delete Confirmation Body">
        <Input readOnly={readOnly} />
      </FormItem>

      <FormItem name="modalTitle" label="Modal Title">
        <Input readOnly={readOnly} />
      </FormItem>

      <FormItem name="modalWidth" label="Modal Width">
        <Select disabled={readOnly} defaultValue="60%">
          <Option value="100%">Full</Option>
          <Option value="80%">Large</Option>
          <Option value="60%">Medium</Option>
          <Option value="40%">Small</Option>
        </Select>
      </FormItem>

      <SectionSeparator title="Render" />

      <FormItem name="capturedProperties" label="Captured Properties">
        <Select mode="tags" />
      </FormItem>

      <FormItem name="formId" label="Form Path">
        <FormAutocomplete readOnly={readOnly} convertToFullId={true} />
      </FormItem>

      <FormItem name="labelFormat" label="Label Format" required>
        <CodeEditor
          readOnly={readOnly}
          mode="dialog"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          name="labelFormat"
          type={''}
          id={''}
          label="Label Format"
          description="Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
          exposedVariables={[
            {
              id: 'ee243565-14ba-4c98-af34-adac37c83baa',
              name: 'data',
              description: 'Form data',
              type: 'object',
            },
            {
              id: '3d53b1ae-1e15-4519-9d07-af6b4225416e',
              name: 'globalState',
              description: 'The global state',
              type: 'object',
            },
            {
              id: '3a288d08-a00c-4458-a6ff-a00da9bd070b',
              name: 'formMode',
              description: 'Editable state of form',
              type: "'designer' | 'edit' | 'readonly'",
            },
          ]}
        />
      </FormItem>

      <SectionSeparator title="Visibility" />

      <FormItem
        label="Custom Visibility"
        name="customVisibility"
        tooltip="Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
      >
        <CodeEditor
          readOnly={readOnly}
          mode="dialog"
          label="Custom Visibility"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          name="customVisibility"
          type={''}
          id={''}
          description="Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
          exposedVariables={[
            {
              id: '788673a5-5eb9-4a9a-a34b-d8cea9cacb3c',
              name: 'data',
              description: 'Form data',
              type: 'object',
            },
            {
              id: '65b71112-d412-401f-af15-1d3080f85319',
              name: 'globalState',
              description: 'The global state',
              type: 'object',
            },
            {
              id: '3633b881-43f4-4779-9f8c-da3de9ecf9b8',
              name: 'queryParams',
              description: 'Query parameters',
              type: 'object',
            },
          ]}
        />
      </FormItem>
    </Form>
  );
};
