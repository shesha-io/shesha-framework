import { Form } from 'antd';
import React, { FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { getSettings } from './refListItemsSettingsForm';
import { useRefListItemGroupConfigurator } from '../provider';
import { ConfigurableFormInstance } from '@/interfaces';
import { getComponentModel } from '../provider/utils';
import { ConfigurableForm } from '@/components/configurableForm';
import { useFormViaFactory } from '@/form-factory/hooks';
import { OnFormValuesChangeHandler } from '@/components/configurableForm/models';
import { RefListGroupItemProps } from '../provider/models';
import { isNullOrWhiteSpace } from '@/utils/nullables';

export const RefListItemProperties: FC = () => {
  const { selectedItemId, getItem, updateItem, readOnly } = useRefListItemGroupConfigurator();
  // note: we have to memoize the editor to prevent unneeded re-rendering and loosing of the focus
  const [editor, setEditor] = useState<ReactNode>(<></>);
  const [form] = Form.useForm<RefListGroupItemProps>();

  const markup = useFormViaFactory(getSettings);

  const formRef = useRef<ConfigurableFormInstance<RefListGroupItemProps> | undefined>(undefined);

  // The id is passed as an argument rather than captured: use-debounce invokes the latest
  // callback with the queued arguments, so a pending save would otherwise land on whichever
  // item is selected when it fires (#5125).
  const debouncedSave = useDebouncedCallback(
    (id: string, values: RefListGroupItemProps) => {
      updateItem({ id: id, settings: values });
    },
    // delay in ms
    300,
  );

  const handleValuesChange = useCallback<OnFormValuesChangeHandler<RefListGroupItemProps>>(
    (_, values) => {
      if (!isNullOrWhiteSpace(selectedItemId))
        debouncedSave(selectedItemId, values);
    },
    [debouncedSave, selectedItemId],
  );

  useEffect(() => {
    return () => {
      debouncedSave.flush();
    };
  }, [debouncedSave, selectedItemId]);

  useEffect(() => {
    form.resetFields();

    if (formRef.current) {
      const values = form.getFieldsValue();

      formRef.current.setFormData({ values, mergeValues: false });
    }
  }, [form, selectedItemId]);

  useEffect(() => {
    const getEditor = (): ReactNode => {
      if (!selectedItemId) return null;
      const item = getItem(selectedItemId);
      if (!item) return null;

      const componentModel = getComponentModel(item);

      return (
        <ConfigurableForm<RefListGroupItemProps>
          key={selectedItemId}
          formRef={formRef}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          mode={readOnly ? 'readonly' : 'edit'}
          markup={markup}
          form={form}
          initialValues={componentModel}
          onValuesChange={handleValuesChange}
        />
      );
    };

    setEditor(getEditor());
  }, [handleValuesChange, form, getItem, markup, readOnly, selectedItemId]);

  return <>{editor}</>;
};

export default RefListItemProperties;
