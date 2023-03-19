import { Checkbox, Form, Input, InputNumber } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import React, { FC } from 'react';
import PropertyAutocomplete from '../../../propertyAutocomplete/propertyAutocomplete';
import SectionSeparator from '../../../sectionSeparator';
import CodeEditor from '../codeEditor/codeEditor';
import { IAddressCompomentProps } from './models';
import { EXPOSED_VARIABLES } from './utils';

export interface IButtonGroupSettingsProps {
  readOnly?: boolean;
  model: IAddressCompomentProps;
  onSave: (model: IAddressCompomentProps) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: IAddressCompomentProps) => void;
}

const AddressSettings: FC<IButtonGroupSettingsProps> = ({ readOnly, model, onSave, onValuesChange }) => {
  const [form] = Form.useForm();

  const handleValuesChange = (changedValues: IAddressCompomentProps, values: IAddressCompomentProps) => {
    if (readOnly) return;

    form?.setFieldsValue(changedValues);

    onValuesChange(changedValues, values);
  };

  return (
    <Form form={form} onFinish={onSave} onValuesChange={handleValuesChange} initialValues={model} layout="vertical">
      <SectionSeparator title="Display" />

      <Form.Item name="name" label="Name" rules={[{ required: true }]}>
        <PropertyAutocomplete id="415cc8ec-2fd1-4c5a-88e2-965153e16069" readOnly={readOnly} />
      </Form.Item>

      <Form.Item name="label" label="Label">
        <Input readOnly={readOnly} />
      </Form.Item>

      <Form.Item name="placeholder" label="Placeholder">
        <Input readOnly={readOnly} />
      </Form.Item>

      <Form.Item name="description" label="Description">
        <TextArea readOnly={readOnly} />
      </Form.Item>

      <Form.Item name="readOnly" label="Read Only" valuePropName="checked">
        <Checkbox disabled={readOnly} />
      </Form.Item>

      <Form.Item name="hideLabel" label="Hide Label" valuePropName="checked">
        <Checkbox disabled={readOnly} />
      </Form.Item>

      <Form.Item name="disabled" label="Disabled" valuePropName="checked">
        <Checkbox disabled={readOnly} />
      </Form.Item>

      <SectionSeparator title="Configuration" />

      <Form.Item name="minCharactersSearch" label="Min Characters Before Search">
        <InputNumber style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="debounce" label="Debounce (MS)">
        <InputNumber style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="googleMapsApiKey" label="Google Maps Key">
        <Input.Password readOnly={readOnly} />
      </Form.Item>

      <Form.Item name="openCageApiKey" label="Open Cage Key">
        <Input.Password readOnly={readOnly} />
      </Form.Item>

      <Form.Item name="prefix" label="Prefix (Area restriction)">
        <Input readOnly={readOnly} />
      </Form.Item>

      <SectionSeparator title="Events" />

      <Form.Item
        label="On Change"
        name="onChangeCustom"
        tooltip="Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
      >
        <CodeEditor
          id={''}
          name="onChangeCustom"
          readOnly={readOnly}
          mode="dialog"
          label="On Change"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          type={''}
          description="Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
          exposedVariables={EXPOSED_VARIABLES}
        />
      </Form.Item>

      <Form.Item
        label="On Select"
        name="onSelectCustom"
        tooltip="Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
      >
        <CodeEditor
          id={''}
          name="onSelectCustom"
          readOnly={readOnly}
          mode="dialog"
          label="On Select"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          type={''}
          description="Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
          exposedVariables={EXPOSED_VARIABLES}
        />
      </Form.Item>

      <SectionSeparator title="Visibility" />

      <Form.Item
        label="Custom Visibility"
        name="customVisibility"
        tooltip="Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
      >
        <CodeEditor
          id={''}
          name="customVisibility"
          readOnly={readOnly}
          mode="dialog"
          label="Custom Visibility"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          type={''}
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
      </Form.Item>
    </Form>
  );
};

export default AddressSettings;
