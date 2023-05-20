import React, { FC, useState } from 'react';
import { Checkbox, Form, Input, Select } from 'antd';
import SectionSeparator from '../../../sectionSeparator';
import Show from '../../../show';
import { ITimelineProps } from '../../../timeline/models';
import TextArea from 'antd/lib/input/TextArea';
import ColorPicker from 'components/colorPicker';
import { IMapProps } from './interfaces';
import CodeEditor from '../codeEditor/codeEditor';
import { IconPickerWrapper } from '../iconPicker';
import TestSelectorSettingsModal from './components/layers/modal';

const { Option } = Select;

export interface ITabSettingsProps {
  readOnly: boolean;
  model: IMapProps;
  onSave: (model: IMapProps) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values) => void;
}

const MapSettings: FC<ITabSettingsProps> = (props) => {
  const [state, setState] = useState(props?.model);
  const [form] = Form.useForm();

  const onValuesChange = (changedValues: any, values) => {
    const newValues = { ...state, ...values };
    if (props.onValuesChange) props.onValuesChange(changedValues, newValues);
  };

  const handleValuesChange = (changedValues: ITimelineProps, values) => {
    if (state.readOnly) return;
    const incomingState = { ...values };

    if (Object.hasOwn(changedValues, 'entityType')) {
      incomingState.filters = null;
      incomingState.properties = null;

      form?.setFieldsValue({ properties: null, filters: null });
    }
    setState(incomingState);
    onValuesChange(changedValues, incomingState);
  };

  return (
    <Form
      initialValues={props?.model}
      form={form}
      onFinish={props.onSave}
      onValuesChange={handleValuesChange}
      labelCol={{ span: 24 }}
      disabled={props.readOnly}
    >
      <SectionSeparator title="Display" />
      <Form.Item name="description" initialValue={props.model.name} label="Description">
        <TextArea />
      </Form.Item>

      <Form.Item name="mapType" label="Map Type" tooltip="Single point or layers map.">
        <Select disabled={state.readOnly}>
          <Option value="single">Single Point</Option>
          <Option value="layers">Layers</Option>
        </Select>
      </Form.Item>

      <Show when={!!state?.mapType}>
        <Form.Item name="latitude" label="Latitude" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="longitude" label="Longitude" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Show when={state?.mapType === 'layers'}>
          <SectionSeparator title="Layers" />
          <Form.Item name="layers">
            <TestSelectorSettingsModal readOnly={props.readOnly} />
          </Form.Item>
        </Show>

        <Form.Item name="customIcon" label="Use Cusom Icon" valuePropName="checked">
          <Checkbox disabled={state.readOnly} />
        </Form.Item>

        <Show when={Boolean(state?.customIcon)}>
          <Form.Item name="icon" label="Icon">
            <IconPickerWrapper name={''} type={''} id={''} />
          </Form.Item>

          <Form.Item name="color" label="Icon Color">
            <ColorPicker />
          </Form.Item>
        </Show>
      </Show>

      <Form.Item name="width" label="Width">
        <Input type="number" />
      </Form.Item>

      <Form.Item name="height" label="Height">
        <Input type="number" />
      </Form.Item>

      <SectionSeparator title="Default View Port" />

      <Form.Item name="defaultLat" label="Default View Port Latitude">
        <Input type="number" />
      </Form.Item>

      <Form.Item name="defaultLng" label="Default View Port Longitude">
        <Input type="number" />
      </Form.Item>

      <Form.Item name="defaultZoom" label="Default View Port Zoom" initialValue={6}>
        <Input type="number" />
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
          readOnly={state.readOnly}
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

export default MapSettings;
