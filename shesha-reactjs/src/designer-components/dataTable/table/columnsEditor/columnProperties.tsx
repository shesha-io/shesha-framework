import { Empty, Form } from 'antd';
import React, { FC, ReactNode, useEffect, useRef, useState,useMemo } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { ConfigurableForm } from '@/components';
import { IPropertyMetadata } from '@/interfaces/metadata';
import { useColumnsConfigurator } from '@/providers/datatableColumnsConfigurator';
import { IDataColumnsProps } from '@/providers/datatableColumnsConfigurator/models';
import { ConfigurableFormInstance } from '@/providers/form/contexts';
import { FormMarkup } from '@/providers/form/models';
import columnSettingsJson from './columnSettings.json';
import { getItemById } from '@/providers/datatableColumnsConfigurator/utils';
import { usePrevious } from 'react-use';

export interface IProps {}

export const ColumnProperties: FC<IProps> = () => {
  const { selectedItemId, getItem, updateItem, readOnly,items } = useColumnsConfigurator();
  // note: we have to memoize the editor to prevent unneeded re-rendering and loosing of the focus
  const [editor, setEditor] = useState<ReactNode>(<></>);
  const [form] = Form.useForm();

  const formRef = useRef<ConfigurableFormInstance>(null);
  const previousItems = usePrevious(items);

  const debouncedSave = useDebouncedCallback(
    (values) => {
      updateItem({ id: selectedItemId, settings: values });
    },
    // delay in ms
    300
  );



 const columnTypeChanged=useMemo(()=>{

  if(selectedItemId===null) return false;

  if(previousItems?.length){
    const prevItem = getItemById(previousItems, selectedItemId);
    const latestItem = getItemById(items, selectedItemId);
    return prevItem?.columnType!==latestItem?.columnType;
  }
  return false;


 },[selectedItemId,items,previousItems])



 useEffect(() => {
  form.resetFields();

  if (formRef.current) {
    const values = form.getFieldsValue();

    formRef.current.updateStateFormData({ values, mergeValues: false });
  }
}, [selectedItemId]);

  const getEditor = () => {
    const emptyEditor = null;
    if (!selectedItemId) return emptyEditor;

    const componentModel = getItem(selectedItemId);

    const linkToModelMetadata = (metadata: IPropertyMetadata) => {
      if (readOnly) return;
      const values = form.getFieldsValue() as IDataColumnsProps;
      const newValues: IDataColumnsProps = {
        ...values,
        columnType: 'data',
        caption: metadata.label || metadata.path,
        description: metadata.description,
      };
      // todo: handle editors
      form.setFieldsValue(newValues);
      debouncedSave(newValues);
    };

    return (
      <ConfigurableForm
        formRef={formRef}
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        mode={readOnly ? 'readonly' : 'edit'}
        markup={columnSettingsJson as FormMarkup}
        onFinish={onSettingsSave}
        form={form}
        initialValues={componentModel}
        onValuesChange={debouncedSave}
        actions={{
          linkToModelMetadata,
        }}
      />
    );
  };

  useEffect(() => {
    const currentEditor = getEditor();
    setEditor(currentEditor);
  }, [selectedItemId,columnTypeChanged]);

  if (!Boolean(selectedItemId)) {
    return (
      <div>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Please select a component to begin editing" />
      </div>
    );
  }

  const onSettingsSave = (values) => {
    console.log(values);
  };

  return <>{editor}</>;
};

export default ColumnProperties;
