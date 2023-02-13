import React, { useState } from 'react';
import { Form, Button } from 'antd';
import { IToolbarProps } from './models';
import { ToolbarSettingsModal } from './toolbarSettingsModal';

export interface IProps {
  readOnly: boolean;
  model: IToolbarProps;
  onSave: (model: IToolbarProps) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: IToolbarProps) => void;
}

function ColumnsSettings(props: IProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const onValuesChange = (changedValues, values) => {
    if (props.onValuesChange && !props.readOnly) 
      props.onValuesChange(changedValues, values);
  };

  return (
    <>
      <Form form={form} onFinish={props.onSave} onValuesChange={onValuesChange}>
        <Button onClick={() => setModalVisible(true)}>{ props.readOnly ? 'View Toolbar Settings' : 'Customise Toolbar' }</Button>
        <Form.Item name="items" initialValue={props.model.items}>
          <ToolbarSettingsModal
            readOnly={props.readOnly}
            visible={modalVisible}
            hideModal={() => {
              setModalVisible(false);
            }}
          />
        </Form.Item>
      </Form>
    </>
  );
}

export default ColumnsSettings;
