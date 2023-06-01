import React, { MutableRefObject, useEffect } from 'react';
import { Form } from 'antd';
import { ConfigurableForm } from '../../components';
import { IConfigurableFormComponent, FormMarkup } from '../../providers/form/models';
import { DEFAULT_FORM_LAYOUT_SETTINGS, IFormLayoutSettings, ISettingsFormInstance, IToolboxComponent } from '../../interfaces';
import { IPropertyMetadata } from '../../interfaces/metadata';
import { convertToMarkupWithSettings, listComponentToModelMetadata } from '../../providers/form/utils';

export interface IProps<TModel extends IConfigurableFormComponent> {
  readonly: boolean;
  model: TModel;
  markup: FormMarkup;
  onSave: (model: TModel) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: TModel) => void;
  toolboxComponent: IToolboxComponent;
  formRef?: MutableRefObject<ISettingsFormInstance | null>;
  propertyFilter?: (name: string) => boolean;
  layoutSettings?: IFormLayoutSettings;
}

function GenericSettingsForm<TModel extends IConfigurableFormComponent>({
  readonly,
  onSave,
  model,
  markup,
  onValuesChange,
  toolboxComponent,
  formRef,
  propertyFilter,
  layoutSettings = DEFAULT_FORM_LAYOUT_SETTINGS,
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

  const markupWithSettings = convertToMarkupWithSettings(markup, true);

  return (
    <ConfigurableForm
      labelCol={layoutSettings?.labelCol}
      wrapperCol={layoutSettings?.wrapperCol}
      layout={layoutSettings?.layout}

      mode={readonly ? "readonly" : "edit"}
      form={form}
      onFinish={onSave}
      markup={markupWithSettings}
      initialValues={model}
      onValuesChange={onValuesChange}
      actions={{
        linkToModelMetadata
      }}
      onFinishFailed={onFinishFailed}
      propertyFilter={propertyFilter}
    />
  );
}

export default GenericSettingsForm;
