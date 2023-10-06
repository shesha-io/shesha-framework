import { Form, Input } from 'antd';
import { ISizableColumnComponentProps } from './interfaces';
import React from 'react';
import SizableColumnsList from './sizableColumnList';
import SectionSeparator from 'components/sectionSeparator';
import CodeEditor from '../codeEditor/codeEditor';
import { EXPOSED_VARIABLES } from './exposedVariables';

export interface IProps {
  readonly: boolean;
  model: ISizableColumnComponentProps;
  onSave: (model: ISizableColumnComponentProps) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: ISizableColumnComponentProps) => void;
}

const FormItem = Form.Item;

const SizableColumnsSettings = ({ readonly, onSave, model, onValuesChange }: IProps) => {
  const [form] = Form.useForm();

  return (
    <Form form={form} onFinish={onSave} layout="vertical" onValuesChange={onValuesChange}>
      <FormItem label="Name" name="name" rules={[{ required: true }]} initialValue={model?.name}>
        <Input readOnly={readonly} />
      </FormItem>

      <FormItem label="Label" name="label" initialValue={model?.label}>
        <Input readOnly={readonly} />
      </FormItem>

      <FormItem label="Columns" name="columns" initialValue={model?.columns || []}>
        <SizableColumnsList readOnly={readonly} />
      </FormItem>

      <SectionSeparator title="Style" />

      <FormItem name="style" label="Style" initialValue={model?.style}>
        <CodeEditor
          name="style"
          readOnly={readonly}
          mode="dialog"
          label="Style"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          description="A script that returns the style of the element as an object. This should conform to CSSProperties"
          exposedVariables={EXPOSED_VARIABLES}
        />
      </FormItem>

      <SectionSeparator title="Visibility" />

      <FormItem name="customVisibility" label="Custom Visibility" initialValue={model?.customVisibility}>
        <CodeEditor
          name="customVisibility"
          readOnly={readonly}
          mode="dialog"
          label="Custom Visibility"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          description="Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
          exposedVariables={EXPOSED_VARIABLES}
        />
      </FormItem>
    </Form>
  );
};

export default SizableColumnsSettings;
