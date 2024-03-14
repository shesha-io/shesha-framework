import React, { FC, useEffect, useMemo, useRef } from 'react';
import { useButtonGroupConfigurator } from '@/providers/buttonGroupConfigurator';
import { Empty, Form } from 'antd';
import { ConfigurableForm } from '../../../..';
import itemSettingsJson from './itemSettings.json';
import itemGroupSettingsJson from './itemGroupSettings.json';
import { FormMarkup } from '@/providers/form/models';
import { useDebouncedCallback } from 'use-debounce';
import { ConfigurableFormInstance } from '@/providers/form/contexts';
import { SourceFilesFolderProvider } from '@/providers/sourceFileManager/sourcesFolderProvider';

export interface IButtonGroupPropertiesProps { }

export const ButtonGroupProperties: FC<IButtonGroupPropertiesProps> = () => {
  const { selectedItemId, getItem, updateItem, readOnly } = useButtonGroupConfigurator();
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
    const values = getItem(selectedItemId);
    form?.setFieldsValue(values);
  }, [selectedItemId]);

  // note: we have to memoize the editor to prevent unneeded re-rendering and loosing of the focus
  const editor = useMemo(() => {
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
      <SourceFilesFolderProvider folder={`button-${selectedItemId}`}>
        <ConfigurableForm
          //key={selectedItemId} // rerender for each item to initialize all controls
          formRef={formRef}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          mode={readOnly ? 'readonly' : 'edit'}
          markup={markup}
          form={form}
          initialValues={componentModel}
          onValuesChange={debouncedSave}
        />
      </SourceFilesFolderProvider>
    );
  }, [selectedItemId]);

  if (!Boolean(selectedItemId)) {
    return (
      <div>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={readOnly ? 'Please select a component to view properties' : 'Please select a component to begin editing'} />
      </div>
    );
  }

  return <>{editor}</>;
};

export default ButtonGroupProperties;
