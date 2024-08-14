import React, { useEffect } from 'react';
import { ConfigurableForm } from '@/components';
import { FormMarkup } from '@/providers/form/models';
import { IConfigurableActionArguments } from '@/interfaces/configurableAction';
import { useShaFormRef } from '@/providers/form/newProvider/shaFormProvider';

export interface IProps<TModel extends IConfigurableActionArguments> {
  model: TModel;
  markup: FormMarkup;
  onSave: (model: TModel) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: TModel) => void;
  readOnly?: boolean;
}

function GenericArgumentsEditor<TModel extends IConfigurableActionArguments>({
  onSave,
  model,
  markup,
  onValuesChange,
  readOnly = false,
}: IProps<TModel>) {
  const formRef = useShaFormRef();

  useEffect(() => {
    formRef.current?.resetFields();
  });

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

export default GenericArgumentsEditor;
