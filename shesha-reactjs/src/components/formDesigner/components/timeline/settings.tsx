import React, { FC, useState } from 'react';
import { Checkbox, Form, Input, Select } from 'antd';

import { ITimelineProps } from './timeline';
import SectionSeparator from '../../../sectionSeparator';

import Show from '../../../show';
import { AutocompleteRaw } from '../../../autocomplete';
import { QueryBuilderComponentRenderer } from '../queryBuilder/queryBuilderComponent';
import { QueryBuilderWithModelType } from '../queryBuilder/queryBuilderWithModelType';
import Properties from '../../../properties';

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
    // whenever the tabs change, check to see if `defaultActiveStep` is still present within the tabs. If not, remove it
    const foundIndex = values?.defaultActiveStep
      ? values?.steps?.findIndex((item) => item?.id === values?.defaultActiveStep)
      : 0;

    const newValues = { ...state, ...values, defaultActiveStep: foundIndex < 0 ? null : values?.defaultActiveStep };

    //setState((prev) => ({ ...prev, ...values, defaultActiveItem: foundIndex < 0 ? null : values?.defaultActiveStep }));

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

      <Form.Item name="name" initialValue={props.model.name} label="Name" rules={[{ required: true }]}>
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

      <Form.Item name={'ownerId'} label="id">
        <Input />
      </Form.Item>

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
            {/* <CodeEditor
              readOnly={state.readOnly}
              mode="inline"
              setOptions={{ minLines: 15, maxLines: 500, fixedWidthGutter: true }}
              name="properties"
              type={''}
              id={''}
              language="graphqlschema"
              label="Query Params"
              description="Properties in GraphQL-like syntax"
            /> */}
            <Properties modelType={state?.entityType} mode="multiple" value={state?.properties} />
          </Form.Item>

          <SectionSeparator title="Query builder" />

          <Form.Item name="useExpression" label="Use Expression" valuePropName="checked">
            <Checkbox disabled={state.readOnly} />
          </Form.Item>

          <QueryBuilderWithModelType modelType={state?.entityType}>
            <QueryBuilderComponentRenderer
              readOnly={state.readOnly}
              name="filters"
              type={''}
              id={''}
              label="Query builder"
              useExpression={state?.useExpression}
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
