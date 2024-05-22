import React, { useEffect, useRef } from 'react';
import { ConfigurableForm } from '@/components';
import { ConfigurableFormInstance } from '@/providers/form/contexts';
import { Form } from 'antd';
import { FormMarkup } from '@/providers/form/models';
import { IProviderSettings } from './interfaces';

export interface IProps<TModel extends IProviderSettings> {
  model: TModel;
  markup: FormMarkup;
  onSave: (model: TModel) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: TModel) => void;
  readOnly?: boolean;
}

export function GenericSettingsEditor<TModel extends IProviderSettings>({
  onSave,
  model,
  markup,
  onValuesChange,
  readOnly = false,
}: IProps<TModel>) {
  const [form] = Form.useForm();
  const formRef = useRef<ConfigurableFormInstance>(null);

  useEffect(() => {
    form.resetFields();
  });

  return (
    <ConfigurableForm
      formRef={formRef}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      mode={readOnly ? 'readonly' : 'edit'}
      form={form}
      onFinish={onSave}
      markup={markup}
      initialValues={model}
      onValuesChange={onValuesChange}
    />
  );
}