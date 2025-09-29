import { ConfigurableForm, ConfigurableFormInstance, FormMarkup, MetadataProvider } from '@/index';
import { Empty, Form } from 'antd';
import React, { FC, ReactNode, useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { getSettings } from './layersSettings';
import { useLayerGroupConfigurator } from '@/providers/calendar';
import { getComponentModel } from '@/providers/calendar/utils';

export interface ILayerPropertiesProps { }

export const LayerProperties: FC<ILayerPropertiesProps> = () => {
  const { selectedItemId, getItem, updateItem, readOnly } = useLayerGroupConfigurator();
  // note: we have to memoize the editor to prevent unneeded re-rendering and loosing of the focus
  const [editor, setEditor] = useState<ReactNode>(<></>);
  const [form] = Form.useForm();

  const formRef = useRef<ConfigurableFormInstance>(null);

  const debouncedSave = useDebouncedCallback(
    (values) => {
      updateItem({ id: selectedItemId, settings: values });
    },
    // delay in ms
    300,
  );

  useEffect(() => {
    form.resetFields();

    if (formRef.current) {
      const values = form.getFieldsValue();

      formRef.current.setFormData({ values, mergeValues: false });
    }
  }, [selectedItemId]);

  const getEditor = () => {
    if (!selectedItemId) return null;

    const componentModel = getComponentModel(getItem(selectedItemId));

    const markup = getSettings() as FormMarkup;

    return (

      <MetadataProvider modelType={componentModel?.entityType}>
        <ConfigurableForm
          formRef={formRef}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          mode={readOnly ? 'readonly' : 'edit'}
          markup={markup}
          form={form}
          initialValues={{ ...componentModel, dataSource: componentModel.dataSource || 'entity' }}
          onValuesChange={debouncedSave}
          isSettingsForm={true}
          className={'vertical-settings'}
        />
      </MetadataProvider>
    );
  };

  useEffect(() => {
    setEditor(getEditor());
  }, [selectedItemId]);

  if (!selectedItemId) {
    return (
      <div>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            readOnly ? 'Please select a component to view properties' : 'Please select a component to begin editing'
          }
        />
      </div>
    );
  }

  return <>{editor}</>;
};

export default LayerProperties;
