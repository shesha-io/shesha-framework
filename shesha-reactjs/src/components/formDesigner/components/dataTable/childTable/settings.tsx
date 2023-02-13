import React, { FC, useState } from 'react';
import { Checkbox, Form, Input, Select } from 'antd';
import { EditableTagGroup, SectionSeparator } from '../../../..';
import { IChildTableSettingsProps } from './models';
import CodeEditor from '../../codeEditor/codeEditor';
import { CustomFilter } from '../filter/filterComponent';
import ButtonGroupSettingsModal from '../../button/buttonGroup/buttonGroupSettingsModal';

export interface IChildDataTableSettingsProps {
  readOnly: boolean;
  model: IChildTableSettingsProps;
  onSave: (model: IChildTableSettingsProps) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: IChildTableSettingsProps) => void;
}

interface IChildDataTableSettingsState {
  toolbarModalVisible?: boolean;
  filtersModalVisible?: boolean;
  data?: IChildTableSettingsProps;
}

export const ChildDataTableSettings: FC<IChildDataTableSettingsProps> = ({
  readOnly,
  onSave,
  model,
  onValuesChange,
}) => {
  const [state, setState] = useState<IChildDataTableSettingsState>({ data: model });
  const [form] = Form.useForm();

  const initialValues = {
    title: model?.title,
    parentEntityId: model?.parentEntityId,
    allowQuickSearch: model?.allowQuickSearch,
    isInline: model?.isInline,
    toolbarItems: model?.toolbarItems,
    filters: model?.filters,
    defaultSelectedFilterId: model?.defaultSelectedFilterId,
    customVisibility: model?.customVisibility,
  };

  return (
    <Form
      form={form}
      onFinish={onSave}
      layout="vertical"
      onValuesChange={(changedValues, values) => {
        setState(prev => ({ ...prev, data: values }));

        onValuesChange(changedValues, values);
      }}
      initialValues={initialValues}
    >
      <SectionSeparator title={'Display'} />

      <Form.Item
        name="title"
        label="Title"
        rules={[{ required: true }]}
        initialValue={model.title}
        tooltip="This can be a literal string like below 'Details for {{data.companyName}}'"
      >
        <Input placeholder="Details for {{data.companyName}}" readOnly={readOnly} />
      </Form.Item>

      <Form.Item name="allowQuickSearch" label="Allow Quick Search" valuePropName="checked">
        <Checkbox checked={model?.allowQuickSearch} disabled={readOnly} />
      </Form.Item>

      <Form.Item name="isInline" label="Is Button Inline" valuePropName="checked">
        <Checkbox />
      </Form.Item>

      <SectionSeparator title="Toolbar" />

      <Form.Item name="toolbarItems" initialValue={model.toolbarItems}>
        <ButtonGroupSettingsModal readOnly={readOnly} />
      </Form.Item>

      <SectionSeparator title="Filter" />

      <Form.Item name="filters" initialValue={model.filters}>
        <CustomFilter target="table" readOnly={readOnly} />
      </Form.Item>

      <Form.Item name="defaultSelectedFilterId" label="Selected filter" required>
        <Select value={state?.data?.defaultSelectedFilterId} allowClear showSearch disabled={readOnly}>
          {state?.data?.filters?.map(({ id, name }) => (
            <Select.Option value={id} key={id}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="Custom Visibility"
        name="customVisibility"
        tooltip="Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
      >
        <CodeEditor
          readOnly={readOnly}
          mode="dialog"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          name="customVisibility"
          type={''}
          id={''}
          description="Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
        />
      </Form.Item>
      <Form.Item
        label="Permissions"
        name="permissions"
        initialValue={model.permissions}
        tooltip="Enter a list of permissions that should be associated with this component"
      >
        <EditableTagGroup />
      </Form.Item>


    </Form>
  );
};

export default ChildDataTableSettings;
