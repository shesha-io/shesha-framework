import React, { FC, ReactNode, useEffect, useRef, useState } from 'react';
import { useColumnsConfigurator } from '../../../../../../providers/datatableColumnsConfigurator';
import { Empty, Form } from 'antd';
import { ConfigurableForm } from '../../../../../../components';
import columnSettingsJson from './columnSettings.json';
import { FormMarkup } from '../../../../../../providers/form/models';
import { useDebouncedCallback } from 'use-debounce';
import { ConfigurableFormInstance } from '../../../../../../providers/form/contexts';
import { IDataColumnsProps } from '../../../../../../providers/datatableColumnsConfigurator/models';
import { IPropertyMetadata } from '../../../../../../interfaces/metadata';

export interface IProps {}

export const ColumnProperties: FC<IProps> = () => {
  const { selectedItemId, getItem, updateItem } = useColumnsConfigurator();
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

    const linkToModelMetadata = (metadata: IPropertyMetadata) => {
      const values = form.getFieldsValue() as IDataColumnsProps;
      const newValues: IDataColumnsProps = {
        ...values,
        columnType: 'data',
        caption: metadata.label || metadata.path,
        description: metadata.description,
      };
      form.setFieldsValue(newValues);
      debouncedSave(newValues);
    };

    return (
      <ConfigurableForm
        formRef={formRef}
        layout="vertical"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        mode="edit"
        markup={columnSettingsJson as FormMarkup}
        onFinish={onSettingsSave}
        form={form}
        initialValues={componentModel}
        onValuesChange={debouncedSave}
        actions={{
          linkToModelMetadata
        }}
      />
    );
  };

  useEffect(() => {
    const currentEditor = getEditor();
    setEditor(currentEditor);
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

export default ColumnProperties;
