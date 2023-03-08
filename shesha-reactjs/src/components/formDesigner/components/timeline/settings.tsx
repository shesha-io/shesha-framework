import React, { FC, useRef, useState } from 'react';
import { Checkbox, Form, Input, RefSelectProps, Select } from 'antd';

import { ITimelineProps } from './timeline';
import { nanoid } from 'nanoid';
import SectionSeparator from '../../../sectionSeparator';
import ItemListSettingsModal from '../itemListConfigurator/itemListSettingsModal';
import { IWizardComponentProps, IWizardStepProps } from '../wizard/models';
import { getSettings } from './itemSettings';

import Show from '../../../show';
import { AutocompleteRaw } from '../../../autocomplete';
import CodeEditor from '../codeEditor/codeEditor';
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

  const onValuesChange = (changedValues: any, values: IWizardComponentProps) => {
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

  const onAddNewItem = (_, count: number) => {
    const buttonProps: IWizardStepProps = {
      id: nanoid(),
      itemType: 'item',
      sortOrder: count,
      name: `item${count + 1}`,
      label: `Item ${count + 1}`,
      key: `ItemKey${count + 1}`,
      title: `Item ${count + 1}`,
      subTitle: `Sub title ${count + 1}`,
      description: `Description ${count + 1}`,
      nextButtonText: 'Next',
      backButtonText: 'Back',
      components: [],
    };

    return buttonProps;
  };

  const items = props?.model?.items?.map((item) => ({ ...item, label: item?.title }));

  const selectRef = useRef<RefSelectProps>();

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

      <Form.Item name="timelineType" initialValue={props.model.timelineType} label="Timeline Type">
        <Select allowClear>
          <Option value="default">Default</Option>
          <Option value="navigation">Navigation</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="size"
        initialValue={props.model.size}
        label="Size"
        tooltip="This will set the size for all buttons"
      >
        <Select>
          <Option value="default">default</Option>
          <Option value="small">small</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="direction"
        initialValue={props.model.size}
        label="Direction"
        tooltip="To specify the direction of the step bar"
      >
        <Select>
          <Option value="vertical">vertical</Option>
          <Option value="horizontal">horizontal</Option>
        </Select>
      </Form.Item>

      <Form.Item name="dataSource" label="Data Source">
        <Select defaultValue={props?.model?.dataSource}>
          <Option value="api">api</Option>
          <Option value="form">form</Option>
        </Select>
      </Form.Item>

      <Show when={state?.dataSource === 'api'}>
        <Form.Item
          name="apiSource"
          label="Api source"
          tooltip="An option to use entity option or custom api. Bare in mind that everything works the same as entity for custom api, the source is the only thing that differs."
          initialValue={['entity']}
        >
          <Select disabled={state.readOnly}>
            <Option value="entity">entity</Option>
            <Option value="custom">custom</Option>
          </Select>
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

      <Form.Item
        name="labelPlacement"
        initialValue={props.model.labelPlacement}
        label="Label Placement"
        tooltip="To specify the label placement"
      >
        <Select>
          <Option value="vertical">vertical</Option>
          <Option value="horizontal">horizontal</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="defaultActiveItem"
        initialValue={props.model.defaultActiveItem}
        label="Default Active Step"
        tooltip="This will be the default step tha"
      >
        <Select allowClear ref={selectRef} value={state?.defaultActiveItem}>
          {state?.items?.map(({ id, title }) => (
            <Option value={id} key={id}>
              {title}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="buttonsLayout"
        initialValue={props.model.buttonsLayout}
        label="Buttons Layout"
        tooltip="How you want the steps buttons to be aligned"
      >
        <Select>
          <Option value="left">Left</Option>
          <Option value="right">Right</Option>
          <Option value="spaceBetween">Space Between</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="visibility"
        initialValue={props.model.visibility}
        label="Visibility"
        tooltip="This property will eventually replace the 'hidden' property and other properties that toggle visibility on the UI and payload"
      >
        <Select>
          <Option value="Yes">Yes (Display in UI and include in payload)</Option>
          <Option value="No">No (Only include in payload)</Option>
          <Option value="Removed">Removed (Remove from UI and exlude from payload)</Option>
        </Select>
      </Form.Item>

      <SectionSeparator title="Configure Timeline items" />

      <Form.Item name="items" initialValue={items}>
        <ItemListSettingsModal
          options={{ onAddNewItem }}
          title="Configure Timeline items"
          heading="Settings"
          callToAction="Configure Timeline items"
          itemTypeMarkup={getSettings()}
          allowAddGroups={false}
          insertMode="after"
        />
      </Form.Item>

      <SectionSeparator title="Security" />

      <Form.Item
        label="Permissions"
        name="permissions"
        initialValue={props.model.permissions}
        tooltip="Enter a list of permissions that should be associated with this component"
      ></Form.Item>
    </Form>
  );
};

export default TimelineSettings;
