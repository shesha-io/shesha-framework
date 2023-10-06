import React from 'react';
import { Form, Input, InputNumber } from 'antd';
import { IColumnsComponentProps } from './interfaces';
import ColumnsList from './columnsList';
import { EXPOSED_VARIABLES } from './exposedVariables';
import CodeEditor from '../codeEditor/codeEditor';
import SectionSeparator from 'components/sectionSeparator';

export interface IProps {
  readOnly: boolean;
  model: IColumnsComponentProps;
  onSave: (model: IColumnsComponentProps) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: IColumnsComponentProps) => void;
}

function ColumnsSettings({ readOnly, onSave, model, onValuesChange }: IProps) {
  const [form] = Form.useForm();

  return (
    <Form form={form} onFinish={onSave} layout="vertical" onValuesChange={onValuesChange}>
      <Form.Item name="name" label="Name" rules={[{ required: true }]} initialValue={model?.name}>
        <Input readOnly={readOnly} />
      </Form.Item>

      <Form.Item name="gutterX" label="Gutter X" initialValue={model?.gutterX}>
        <InputNumber min={1} max={48} step={4} readOnly={readOnly} />
      </Form.Item>

      <Form.Item name="gutterY" label="Gutter Y" initialValue={model?.gutterX}>
        <InputNumber min={1} max={48} step={4} readOnly={readOnly} />
      </Form.Item>

      <Form.Item name="label" label="Label" initialValue={model?.label}>
        <Input readOnly={readOnly} />
      </Form.Item>

      <Form.Item name="columns" label="Columns" initialValue={model?.columns || []}>
        <ColumnsList readOnly={readOnly} />
      </Form.Item>

      <SectionSeparator title="Style" />

      <Form.Item name="style" label="Style" initialValue={model?.style}>
        <CodeEditor
          name="style"
          readOnly={readOnly}
          mode="dialog"
          label="Style"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          description="A script that returns the style of the element as an object. This should conform to CSSProperties"
          exposedVariables={EXPOSED_VARIABLES}
        />
      </Form.Item>

      <SectionSeparator title="Visibility" />

      <Form.Item name="customVisibility" label="Custom Visibility" initialValue={model?.customVisibility}>
        <CodeEditor
          name="customVisibility"
          readOnly={readOnly}
          mode="dialog"
          label="Custom Visibility"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          description="Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
          exposedVariables={EXPOSED_VARIABLES}
        />
      </Form.Item>
    </Form>
  );
}

export default ColumnsSettings;
