import { Checkbox, Form, Input, InputNumber, Select } from 'antd';
import React, { FC, useState } from 'react';
import { EditableTagGroup, SectionSeparator, Show } from '../../../components';
import ButtonGroupSettingsModal from '../../../components/formDesigner/components/button/buttonGroup/buttonGroupSettingsModal';
import CodeEditor from '../../../components/formDesigner/components/codeEditor/codeEditor';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '../../../providers/dataTable/contexts';
import { getValidDefaultBool } from '../../../utils';
import { CustomFilter } from '../filter/filterComponent';
import { IChildTableSettingsProps } from './models';

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

  const initialValues: IChildTableSettingsProps = {
    title: model?.title,
    parentEntityId: model?.parentEntityId,
    allowQuickSearch: model?.allowQuickSearch,
    isInline: model?.isInline,
    toolbarItems: model?.toolbarItems,
    filters: model?.filters,
    defaultSelectedFilterId: model?.defaultSelectedFilterId,
    defaultPageSize: model?.defaultPageSize || 10,
    customVisibility: model?.customVisibility,
    showPagination: getValidDefaultBool(model?.showPagination),
    totalRecords: model?.totalRecords,
  };

  return (
    <Form
      form={form}
      onFinish={onSave}
      layout="vertical"
      onValuesChange={(changedValues, values) => {
        setState((prev) => ({ ...prev, data: values }));

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
        <Checkbox disabled={readOnly} />
      </Form.Item>

      <Form.Item name="showPagination" label="Show Pagination" valuePropName="checked">
        <Checkbox disabled={readOnly} />
      </Form.Item>

      <Show when={getValidDefaultBool(state?.data?.showPagination)}>
        <Form.Item name="defaultPageSize" label="Default Page Size">
          <Select value={state?.data?.defaultPageSize} showSearch disabled={readOnly}>
            {DEFAULT_PAGE_SIZE_OPTIONS.map((value) => (
              <Select.Option value={value} key={value}>
                {value} / page
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Show>

      <Show when={!getValidDefaultBool(state?.data?.showPagination)}>
        <Form.Item name="totalRecords" label="Total Records">
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
      </Show>

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
          propertyName="customVisibility"
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
