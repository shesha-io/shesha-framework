import React, { useState } from 'react';
import { Button, Form, Input } from 'antd';
import { SectionSeparator } from '../../../..';
import { IDetailsViewProps } from './models';
import { CodeEditor } from '../../codeEditor/codeEditor';
import { ToolbarSettingsModal } from '../../dataTable/toolbar/toolbarSettingsModal';

export interface IDetailsPageSettingsProps {
  readOnly: boolean;
  model: IDetailsViewProps;
  onSave: (model: IDetailsViewProps) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: IDetailsViewProps) => void;
}

function DetailsViewSettings({ readOnly, onSave, model, onValuesChange }: IDetailsPageSettingsProps) {
  const [toolbarModalVisible, setToolbarModalVisible] = useState(false);
  const [form] = Form.useForm();

  return (
    <Form form={form} onFinish={onSave} layout="vertical" onValuesChange={onValuesChange} disabled={readOnly}>
      <SectionSeparator title={'Display'} />

      <Form.Item
        name="title"
        label="Title"
        rules={[{ required: true }]}
        initialValue={model.title}
        tooltip="This can be a literal string like below 'Details for {{data.companyName}}'"
      >
        <Input />
      </Form.Item>

      <Form.Item name="path" label="Path" rules={[{ required: true }]} initialValue={model.path}>
        <Input />
      </Form.Item>

      <Form.Item name="backUrl" label="Back Url" initialValue={model?.backUrl}>
        <Input />
      </Form.Item>

      <SectionSeparator title="Status" />

      <Form.Item name="statusValue" label="Status value" initialValue={model?.statusValue}>
        <Input />
      </Form.Item>

      <Form.Item name="statusColor" label="Status color" initialValue={model?.statusColor}>
        <Input />
      </Form.Item>

      <Form.Item name="statusOverride" label="Status override" initialValue={model?.statusOverride}>
        <Input />
      </Form.Item>

      <Form.Item
        name="statusColorExpression"
        label="Status color expression"
        initialValue={model?.statusColorExpression}
      >
        <CodeEditor
          label="Custom code"
          description="Something"
          mode="dialog"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          name={'custom'}
          type={'sdfsdfsd'}
          id={'dsdffd'}
        />
      </Form.Item>

      <SectionSeparator title="Toolbar" />

      <Button onClick={() => setToolbarModalVisible(true)}>Configure Toolbar</Button>

      <Form.Item name="toolbarItems" initialValue={model.toolbarItems}>
        <ToolbarSettingsModal
          visible={toolbarModalVisible}
          allowAddGroups={false}
          hideModal={() => {
            setToolbarModalVisible(false);
          }}
        />
      </Form.Item>
    </Form>
  );
}

export default DetailsViewSettings;
