import React, { ReactElement } from 'react';
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
  cacheKey?: string;
}

function GenericArgumentsEditor<TModel extends object = object>({
  onSave,
  model,
  markup,
  onValuesChange,
  readOnly = false,
  cacheKey,
}: IProps<TModel>): ReactElement {
  const formRef = useShaFormRef();

  return (
    <ConfigurableForm
      layout="vertical"
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      mode={readOnly ? 'readonly' : 'edit'}
      shaFormRef={formRef}
      onFinish={onSave}
      markup={markup}
      cacheKey={cacheKey}
      initialValues={model}
      onValuesChange={onValuesChange}
    />
  );
}

export default GenericArgumentsEditor;
