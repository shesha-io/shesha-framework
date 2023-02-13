import React, { useState } from 'react';
import { Button, Form } from 'antd';
import { IDetailsViewProps } from './models';
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
