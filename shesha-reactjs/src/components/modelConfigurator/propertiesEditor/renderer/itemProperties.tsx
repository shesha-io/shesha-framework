import React, { FC, ReactNode, useEffect, useRef, useState } from 'react';
import { Empty, Form } from 'antd';
import { useDebouncedCallback } from 'use-debounce';
import { ConfigurableForm } from '../../..';
import { usePropertiesEditor } from '../provider';
import { FormMarkup } from '../../../../providers/form/models';
import { ConfigurableFormInstance } from '../../../../providers/form/contexts';
import propertySettingsJson from './propertySettings.json';

export interface IProps {}

export const ToolbarItemProperties: FC<IProps> = () => {
  const { selectedItemId, getItem, updateItem } = usePropertiesEditor();
  // note: we have to memoize the editor to prevent unneeded re-rendering and loosing of the focus
  const [editor, setEditor] = useState<ReactNode>(<></>);
  const [form] = Form.useForm();

  const formRef = useRef<ConfigurableFormInstance>(null);

  const debouncedSave = useDebouncedCallback(
    values => {
      updateItem({ id: selectedItemId, settings: values });
    },
    // delay in ms
    300
  );

  useEffect(() => {
    form.resetFields();

    if (formRef.current) {
      const values = form.getFieldsValue();

      formRef.current.setFormData({ values, mergeValues: false });
    }
  }, [selectedItemId]);

  const getEditor = () => {
    const emptyEditor = null;
    if (!selectedItemId) return emptyEditor;

    const componentModel = getItem(selectedItemId);

    const markup = propertySettingsJson as FormMarkup;

    return (
      <>
        <ConfigurableForm
          size="small"
          formRef={formRef}
          layout="horizontal"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          mode="edit"
          markup={markup}
          onFinish={onSettingsSave}
          form={form}
          initialValues={componentModel}
          onValuesChange={debouncedSave}
        />
      </>
    );
  };

  useEffect(() => {
    setEditor(getEditor());
  }, [selectedItemId]);

  if (!Boolean(selectedItemId)) {
    return (
      <div>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Please select a component to begin editing" />
      </div>
    );
  }

  const onSettingsSave = values => {
    console.log(values);
  };

  return <>{editor}</>;
};

export default ToolbarItemProperties;
