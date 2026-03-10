import { getComponentModel } from '@/providers/layersProvider/utils';
import { useLayerGroupConfigurator } from '@/providers/layersProvider';
import { ConfigurableForm, ConfigurableFormInstance, FormMarkup, MetadataProvider } from '@/index';
import { Empty, Form } from 'antd';
import React, { FC, ReactNode, useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export interface ILayerPropertiesProps {
  settings: FormMarkup;
}

export const LayerProperties: FC<ILayerPropertiesProps> = ({ settings }) => {
  const { selectedItemId, getItem, updateItem, readOnly } = useLayerGroupConfigurator();
  // note: we have to memoize the editor to prevent unneeded re-rendering and loosing of the focus
  const [editor, setEditor] = useState<ReactNode>(<></>);
  const [form] = Form.useForm();

  const formRef = useRef<ConfigurableFormInstance>(null);
  const selectedItemIdRef = useRef(selectedItemId);

  // Keep ref in sync with selectedItemId
  useEffect(() => {
    selectedItemIdRef.current = selectedItemId;
  }, [selectedItemId]);

  const debouncedSave = useDebouncedCallback(
    // Using any type for parameters because useDebouncedCallback doesn't provide strict typing for form values
    (_changedValues: any, allValues: any): void => {
      // Use ref to get the current selectedItemId, not the stale closure value
      updateItem({ id: selectedItemIdRef.current, settings: allValues });
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

  const getEditor = (): JSX.Element | null => {
    if (!selectedItemId) return null;

    const item = getItem(selectedItemId);
    if (!item) return null;

    const componentModel = getComponentModel(item);

    return (

      <MetadataProvider modelType={componentModel?.entityType}>
        <ConfigurableForm
          formRef={formRef}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          mode={readOnly ? 'readonly' : 'edit'}
          markup={settings}
          form={form}
          initialValues={{ ...componentModel, dataSource: componentModel.dataSource || 'entity' }}
          onValuesChange={debouncedSave}
          isSettingsForm={true}
          className="vertical-settings"
        />
      </MetadataProvider>
    );
  };

  useEffect(() => {
    setEditor(getEditor());
  }, [selectedItemId, readOnly, settings]);

  if (!selectedItemId) {
    return (
      <div>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={readOnly ? 'Please select a component to view properties' : 'Please select a component to begin editing'}
        />
      </div>
    );
  }

  return <>{editor}</>;
};

export default LayerProperties;
