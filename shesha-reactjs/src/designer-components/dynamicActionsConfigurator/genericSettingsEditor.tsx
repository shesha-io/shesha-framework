import React from 'react';
import { ConfigurableForm } from '@/components';
import { FormMarkup } from '@/providers/form/models';
import { useShaFormRef } from '@/providers/form/providers/shaFormProvider';

export interface IProps<TModel extends object = object> {
  model: TModel;
  markup: FormMarkup;
  onSave: (model: TModel) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: TModel) => void;
  readOnly?: boolean;
}

export function GenericSettingsEditor<TModel extends object = object>({
  onSave,
  model,
  markup,
  onValuesChange,
  readOnly = false,
}: IProps<TModel>): JSX.Element {
  const formRef = useShaFormRef();

  return (
    <ConfigurableForm
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      mode={readOnly ? 'readonly' : 'edit'}
      shaFormRef={formRef}
      onFinish={onSave}
      markup={markup}
      initialValues={model}
      onValuesChange={onValuesChange}
    />
  );
}
