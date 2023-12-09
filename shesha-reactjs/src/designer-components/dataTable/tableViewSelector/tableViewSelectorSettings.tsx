import { Checkbox, Form } from 'antd';
import React from 'react';
import { SectionSeparator } from '@/designer-components/..';
import { ITableViewSelectorComponentProps } from './models';
import TableViewSelectorSettingsModal from './tableViewSelectorSettingsModal';

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
        <TableViewSelectorSettingsModal readOnly={props.readOnly} />
      </Form.Item>
      <Form.Item name="hidden" label="Hidden" valuePropName="checked">
        <Checkbox disabled={props.readOnly} />
      </Form.Item>
    </Form>
  );
}

export default TableViewSelectorSettings;
