import React, { FC, useState } from 'react';
import { Form, Input, Select } from 'antd';
import SectionSeparator from '../../../sectionSeparator';
import Show from '../../../show';
import { AutocompleteRaw } from '../../../autocomplete';
import { QueryBuilderComponentRenderer } from 'designer-components/queryBuilder/queryBuilderComponent';
import { QueryBuilderWithModelType } from 'designer-components/queryBuilder/queryBuilderWithModelType';
import Properties from '../../../properties';
import { ITimelineProps } from '../../../timeline/models';

const { Option } = Select;

export interface ITabSettingsProps {
  readOnly: boolean;
  model: ITimelineProps;
  onSave: (model: ITimelineProps) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values) => void;
}

const TimelineSettings: FC<ITabSettingsProps> = (props) => {
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
      <SectionSeparator />
      <Form.Item name="label" initialValue={props.model.label} label="Label" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="propertyName" initialValue={props.model.propertyName} label="Property name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item
        name="apiSource"
        label="Api source"
        tooltip="An option to use entity option or custom api. Bare in mind that everything works the same as entity for custom api, the source is the only thing that differs."
        initialValue={['entity']}
      >
        <Select disabled={state.readOnly}>
          <Option value="entity">entity</Option>
          <Option value="custom">custom Url</Option>
        </Select>
      </Form.Item>

      <Show when={state.apiSource === 'custom'}>
        <Form.Item name={'ownerId'} label="id">
          <Input />
        </Form.Item>
      </Show>

      <Show when={state?.apiSource === 'entity'}>
        <Form.Item name="entityType" label="Entity type">
          <AutocompleteRaw
            dataSourceType="url"
            dataSourceUrl="/api/services/app/Metadata/TypeAutocomplete"
            readOnly={state.readOnly}
          />
        </Form.Item>
        <Show when={Boolean(state?.entityType)}>
          <Form.Item name="properties" label="Properties">
            <Properties modelType={state?.entityType} mode="multiple" value={state?.properties} />
          </Form.Item>

          <SectionSeparator title="Query builder" />

          <QueryBuilderWithModelType modelType={state?.entityType}>
            <QueryBuilderComponentRenderer
              readOnly={state.readOnly}
              propertyName="filters"
              type={''}
              id={''}
              label="Query builder"
            />
          </QueryBuilderWithModelType>
        </Show>
      </Show>

      <Show when={state?.apiSource === 'custom'}>
        <Form.Item label="Custom Api URL" name="customApiUrl" tooltip="The URL for a custom Api.">
          <Input readOnly={state.readOnly} />
        </Form.Item>
      </Show>
    </Form>
  );
};

export default TimelineSettings;
