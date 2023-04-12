import React, { MutableRefObject, useEffect } from 'react';
import { Form } from 'antd';
import { ConfigurableForm } from '../../components';
import { IConfigurableFormComponent, FormMarkup } from '../../providers/form/models';
import { ISettingsFormInstance, IToolboxComponent } from '../../interfaces';
import { IPropertyMetadata } from '../../interfaces/metadata';
import { listComponentToModelMetadata } from '../../providers/form/utils';

export interface IProps<TModel extends IConfigurableFormComponent> {
  readonly: boolean;
  model: TModel;
  markup: FormMarkup;
  onSave: (model: TModel) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: TModel) => void;
  toolboxComponent: IToolboxComponent;
  formRef?: MutableRefObject<ISettingsFormInstance | null>;
}

function GenericSettingsForm<TModel extends IConfigurableFormComponent>({
  readonly,
  onSave,
  model,
  markup,
  onValuesChange,
  toolboxComponent,
  formRef,
}: IProps<TModel>) {
  const [form] = Form.useForm();

  useEffect(() => {
    form.resetFields();
  });

  const linkToModelMetadata = (metadata: IPropertyMetadata) => {
    const currentModel = form.getFieldsValue() as TModel;

    const wrapper = toolboxComponent.linkToModelMetadata
      ? m => listComponentToModelMetadata(toolboxComponent, m, metadata)
      : m => m;

    const newModel: TModel = wrapper({
      ...currentModel,
      label: metadata.label || metadata.path,
      description: metadata.description,
    });

    form.setFieldsValue(newModel);
    if (onValuesChange) onValuesChange(newModel, newModel);
  };

  const onFinishFailed = (errorInfo) => {
    console.error('onFinishFailed', errorInfo);
  };

  if (formRef)
    formRef.current = {
      submit: () => form.submit(),
      reset: () => form.resetFields(),
    };

  return (
    <ConfigurableForm
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      mode={readonly ? "readonly" : "edit"}
      form={form}
      onFinish={onSave}
      markup={markup}
      initialValues={model}
      onValuesChange={onValuesChange}
      actions={{
        linkToModelMetadata
      }}
      onFinishFailed={onFinishFailed}
    />
  );
}

export default GenericSettingsForm;
