import { Form } from 'antd';
import React, { FC, ReactElement, ReactNode, useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { getSettings } from './refListItemsSettingsForm';
import { useRefListItemGroupConfigurator } from '../provider';
import { ConfigurableFormInstance, FormMarkup } from '@/interfaces';
import { getComponentModel } from '../provider/utils';
import { ConfigurableForm } from '@/components/configurableForm';

export const RefListItemProperties: FC = () => {
  const { selectedItemId, getItem, updateItem, readOnly } = useRefListItemGroupConfigurator();
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

  const getEditor = (): ReactElement => {
    if (!selectedItemId) return null;

    const componentModel = getComponentModel(getItem(selectedItemId));

    const markup = getSettings() as FormMarkup;

    return (
      <ConfigurableForm
        key={selectedItemId}
        formRef={formRef}
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        mode={readOnly ? 'readonly' : 'edit'}
        markup={markup}
        form={form}
        initialValues={componentModel}
        onValuesChange={debouncedSave}
      />
    );
  };

  useEffect(() => {
    setEditor(getEditor());
  }, [selectedItemId]);

  return <>{editor}</>;
};

export default RefListItemProperties;
