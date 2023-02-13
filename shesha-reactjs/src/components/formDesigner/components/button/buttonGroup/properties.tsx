import React, { FC, ReactNode, useEffect, useRef, useState } from 'react';
import { useButtonGroupConfigurator } from '../../../../../providers/buttonGroupConfigurator';
import { Empty, Form } from 'antd';
import { ConfigurableForm } from '../../../..';
import itemSettingsJson from './itemSettings.json';
import itemGroupSettingsJson from './itemGroupSettings.json';
import { FormMarkup } from '../../../../../providers/form/models';
import { useDebouncedCallback } from 'use-debounce';
import { ConfigurableFormInstance } from '../../../../../providers/form/contexts';

export interface IButtonGroupPropertiesProps {}

export const ButtonGroupProperties: FC<IButtonGroupPropertiesProps> = () => {
  const { selectedItemId, getItem, updateItem, readOnly } = useButtonGroupConfigurator();
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

  useEffect(() => {
    setEditor(getEditor());
  }, [selectedItemId]);

  const getEditor = () => {
    const emptyEditor = null;
    if (!selectedItemId) return emptyEditor;

    const componentModel = getItem(selectedItemId);

    const markup =
      componentModel.itemType === 'item'
        ? (itemSettingsJson as FormMarkup)
        : componentModel.itemType === 'group'
        ? (itemGroupSettingsJson as FormMarkup)
        : [];
    return (
      <ConfigurableForm
        formRef={formRef}
        layout="vertical"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        mode={ readOnly ? 'readonly' : 'edit' }
        markup={markup}
        onFinish={onSettingsSave}
        form={form}
        initialValues={componentModel}
        onValuesChange={debouncedSave}
      />
    );
  };

  if (!Boolean(selectedItemId)) {
    return (
      <div>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={readOnly ? 'Please select a component to view properties' : 'Please select a component to begin editing'} />
      </div>
    );
  }

  const onSettingsSave = values => {
    console.log(values);
  };

  return <>{editor}</>;
};

export default ButtonGroupProperties;
