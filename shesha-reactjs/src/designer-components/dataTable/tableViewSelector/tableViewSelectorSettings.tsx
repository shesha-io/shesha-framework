import React from 'react';
import { Checkbox, Form } from 'antd';
import { ITableViewSelectorComponentProps } from './models';
import { SectionSeparator } from '@/components';
import { PermissionAutocomplete } from '@/components/permissionAutocomplete';
import { FiltersList } from './filters/filtersList';

export interface ITableViewSelectorSettingsProps {
  readOnly: boolean;
  model: ITableViewSelectorComponentProps;
  onSave: (model: ITableViewSelectorComponentProps) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: ITableViewSelectorComponentProps) => void;
}

function TableViewSelectorSettings(props: ITableViewSelectorSettingsProps) {
  const [form] = Form.useForm();

  const handleValuesChange = (changedValues: any, values: ITableViewSelectorComponentProps) => {
    if (props.onValuesChange) {
      props.onValuesChange(changedValues, values);
    }
  };

  return (
    <Form form={form} onFinish={props.onSave} onValuesChange={handleValuesChange} initialValues={props.model}>
      <SectionSeparator title="Filters" />
      <Form.Item name="filters">
        <FiltersList readOnly={props.readOnly} />
      </Form.Item>
      <Form.Item name="hidden" label="Hidden" valuePropName="checked">
        <Checkbox disabled={props.readOnly} />
      </Form.Item>
      <Form.Item
          label="Permissions"
          name="permissions"
          initialValue={props.model.permissions}
          tooltip="Enter a list of permissions that should be associated with this component">
          <PermissionAutocomplete readOnly={props.readOnly} />
      </Form.Item>
    </Form>
  );
}



export default TableViewSelectorSettings;
