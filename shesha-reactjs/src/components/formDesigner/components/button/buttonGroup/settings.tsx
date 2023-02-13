import React, { FC } from 'react';
import { Form, Select, Input, Checkbox } from 'antd';
import { IButtonGroupProps } from './models';
import { ButtonGroupSettingsModal } from './buttonGroupSettingsModal';
import SectionSeparator from '../../../../sectionSeparator';
import { CodeEditor } from '../../codeEditor/codeEditor';
import EditableTagGroup from '../../../../editableTagGroup';

const { Option } = Select;

export interface IButtonGroupSettingsProps {
  readOnly?: boolean;
  model: IButtonGroupProps;
  onSave: (model: IButtonGroupProps) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: IButtonGroupProps) => void;
}

const ButtonGroupSettings: FC<IButtonGroupSettingsProps> = props => {
  const [form] = Form.useForm();

  const onValuesChange = (changedValues, values) => {
    if (props.onValuesChange && !props.readOnly) {
      props.onValuesChange(changedValues, values);
    }
  };

  return (
    <Form form={form} onFinish={props.onSave} onValuesChange={onValuesChange} labelCol={{ span: 24 }}>
      <SectionSeparator title="UX" />
      <Form.Item name="name" initialValue={props.model.name} label="Name" rules={[{ required: true }]}>
        <Input readOnly={props.readOnly} />
      </Form.Item>

      <Form.Item
        name="size"
        initialValue={props.model.size}
        label="Size"
        tooltip="This will set the size for all buttons"
      >
        <Select disabled={props.readOnly}>
          <Option value="small">Small</Option>
          <Option value="middle">Middle</Option>
          <Option value="large">Large</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="spaceSize"
        initialValue={props.model.spaceSize}
        label="Space size"
        tooltip="This will be the gap size between the buttons"
      >
        <Select disabled={props.readOnly}>
          <Option value="small">Small</Option>
          <Option value="middle">Middle</Option>
          <Option value="large">Large</Option>
        </Select>
      </Form.Item>

      <Form.Item name="isInline" label="Is Button Inline" valuePropName="checked" initialValue={props.model?.isInline}>
        <Checkbox />
      </Form.Item>

      <SectionSeparator title="Customization" />

      <Form.Item name="items" initialValue={props.model.items}>
        <ButtonGroupSettingsModal readOnly={props.readOnly} />
      </Form.Item>

      <SectionSeparator title="Security" />

      <Form.Item
        label="Custom Visibility"
        name="customVisibility"
        tooltip="Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
      >
        <CodeEditor
          readOnly={props.readOnly}
          mode="dialog"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          name="customVisibility"
          type={''}
          id={''}
          label="Custom Visibility"
          description="Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
        />
      </Form.Item>

      <Form.Item
        label="Permissions"
        name="permissions"
        initialValue={props.model.permissions}
        tooltip="Enter a list of permissions that should be associated with this component"
      >
        <EditableTagGroup readOnly={props.readOnly} />
      </Form.Item>
    </Form>
  );
};

export default ButtonGroupSettings;
