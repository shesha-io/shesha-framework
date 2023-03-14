import { Checkbox, Form, Input, InputNumber, Select } from 'antd';
import React, { FC, useState } from 'react';
import SectionSeparator from '../../../sectionSeparator';
import PropertyAutocomplete from '../../../propertyAutocomplete/propertyAutocomplete';
import CodeEditor from '../codeEditor/codeEditor';
import { IMapProps } from './models';

const FormItem = Form.Item;

export interface IMapSettingsProps {
  readOnly: boolean;
  model: IMapProps;
  onSave: (model: IMapProps) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: IMapProps) => void;
}

interface IMapSettingsState extends IMapProps {}

export const MapSettings: FC<IMapSettingsProps> = ({ readOnly, onSave, model, onValuesChange }) => {
  const [state, setState] = useState<IMapSettingsState>(model);
  const [form] = Form.useForm();

  const handleValuesChange = (changedValues: IMapProps, values: IMapProps) => {
    if (readOnly) return;
    const incomingState = { ...values };

    setState(incomingState);
    onValuesChange(changedValues, incomingState);
  };

  return (
    <Form
      form={form}
      onFinish={onSave}
      layout="vertical"
      onValuesChange={handleValuesChange}
      initialValues={{
        ...model,
      }}
    >
      <SectionSeparator title="Display" />

      <FormItem name="name" label="Name" rules={[{ required: true }]}>
        <PropertyAutocomplete id="fb71cb51-884f-4f34-aa77-820c12276c95" readOnly={readOnly} />
      </FormItem>

      <FormItem name="label" label="Label">
        <Input readOnly={readOnly} />
      </FormItem>

      <Form.Item name="readOnly" label="Read Only" valuePropName="checked">
        <Checkbox disabled={readOnly} />
      </Form.Item>

      <SectionSeparator title="Map Properties" />

      <FormItem name="apiKey" label="Map Api Key">
        <Input readOnly={readOnly} />
      </FormItem>

      <FormItem name="latitude" label="Latitude">
        <Input readOnly={readOnly} />
      </FormItem>

      <FormItem name="longitude" label="Longitude">
        <Input readOnly={readOnly} />
      </FormItem>

      <FormItem name="zoom" label="Zoom">
        <InputNumber readOnly={readOnly} />
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
