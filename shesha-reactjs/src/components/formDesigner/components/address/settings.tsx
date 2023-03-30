import { Checkbox, Form, Input, InputNumber, Select } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import React, { FC, useState } from 'react';
import { COUNTRY_CODES } from '../../../../constants/country-codes';
import PropertyAutocomplete from '../../../propertyAutocomplete/propertyAutocomplete';
import SectionSeparator from '../../../sectionSeparator';
import Show from '../../../show';
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
  const [{ showPriorityBounds }, setState] = useState<IAddressCompomentProps>(model);

  const handleValuesChange = (changedValues: IAddressCompomentProps, values: IAddressCompomentProps) => {
    if (readOnly) return;

    form?.setFieldsValue(changedValues);

    setState(s => ({ ...s, ...changedValues }));

    onValuesChange(changedValues, values);
  };

  return (
    <Form form={form} onFinish={onSave} onValuesChange={handleValuesChange} initialValues={model} layout="vertical">
      <SectionSeparator title="Display" />

      <Form.Item name="name" label="Name" required>
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

      <Form.Item
        name="minCharactersSearch"
        label="Min Characters Before Search"
        tooltip="The minimum characters required before an api call can be made."
      >
        <InputNumber style={{ width: '100%' }} disabled={readOnly} />
      </Form.Item>

      <Form.Item
        name="debounce"
        label="Debounce (MS)"
        tooltip="Debouncing prevents extra activations/inputs from triggering too often. This is the time in milliseconds the call will be delayed by."
      >
        <InputNumber style={{ width: '100%' }} disabled={readOnly} />
      </Form.Item>

      <Form.Item
        name="googleMapsApiKey"
        label="Google Maps Key"
        tooltip="API key for authorization. Google Maps key which is required to make successful calls to Google services."
      >
        <Input.Password readOnly={readOnly} />
      </Form.Item>

      <Form.Item
        name="openCageApiKey"
        label="OpenCage Key"
        tooltip="API key for authorization. Go to (https://opencagedata.com/api) to learn about OpenCage. OpenCage key which is required to make successful calls to OpenCage services."
      >
        <Input.Password readOnly={readOnly} />
      </Form.Item>

      <Form.Item
        name="countryRestriction"
        label="Country Restriction"
        tooltip="A filter which is based on the country/countries, multiple countries can be selected."
      >
        <Select
          allowClear
          mode="multiple"
          options={COUNTRY_CODES}
          filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
        />
      </Form.Item>

      <Form.Item
        name="prefix"
        label="Prefix (Area Restriction)"
        tooltip="A simple prefix which is appended in the search but not the input search field, often used to create a biased search in address."
      >
        <Input style={{ width: '100%' }} disabled={readOnly} />
      </Form.Item>

      <Form.Item
        name="showPriorityBounds"
        label="Priority Bounds (Advanced)"
        valuePropName="checked"
        tooltip="Advanced search options, not required if a search priority is not needed. Note this will be discarded unless all values are provided."
      >
        <Checkbox disabled={readOnly} />
      </Form.Item>

      <Show when={showPriorityBounds}>
        <Form.Item
          name="latPriority"
          label="Latitude (Priority Bound)"
          required
          tooltip="Latitude value which the search will be prioritized from."
        >
          <InputNumber style={{ width: '100%' }} disabled={readOnly} />
        </Form.Item>

        <Form.Item
          name="lngPriority"
          label="Longitude (Priority Bound)"
          required
          tooltip="Longitude value which the search will be prioritized from."
        >
          <InputNumber style={{ width: '100%' }} disabled={readOnly} />
        </Form.Item>

        <Form.Item
          name="radiusPriority"
          label="Radius (Priority Bound)"
          required
          tooltip="The radius in which the latitude and longitude will be priorities from."
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
      </Show>
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
