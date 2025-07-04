import React, { MutableRefObject } from 'react';
import { Form } from 'antd';
import { IConfigurableFormComponent, FormMarkup } from '@/providers/form/models';
import { ConfigurableFormInstance, DEFAULT_FORM_LAYOUT_SETTINGS, IFormLayoutSettings, ISettingsFormInstance, IToolboxComponent } from '@/interfaces';
import { IPropertyMetadata } from '@/interfaces/metadata';
import { linkComponentToModelMetadata } from '@/providers/form/utils';
import { ConfigurableForm } from '../configurableForm';
import { sheshaStyles } from '@/styles';

export interface IProps<TModel extends IConfigurableFormComponent> {
  readOnly: boolean;
  model: TModel;
  markup: FormMarkup;
  onSave: (model: TModel) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: TModel) => void;
  toolboxComponent: IToolboxComponent;
  formRef?: MutableRefObject<ISettingsFormInstance | null>;
  propertyFilter?: (name: string) => boolean;
  layoutSettings?: IFormLayoutSettings;
  isInModal?: boolean;
}

function GenericSettingsForm<TModel extends IConfigurableFormComponent>({
  readOnly,
  onSave,
  model,
  markup,
  onValuesChange,
  toolboxComponent,
  formRef,
  propertyFilter,
  layoutSettings = DEFAULT_FORM_LAYOUT_SETTINGS,
  isInModal
}: IProps<TModel>) {
  const [form] = Form.useForm();

  const linkToModelMetadata = (metadata: IPropertyMetadata, settingsForm: ConfigurableFormInstance) => {
    const currentModel = form.getFieldValue([]) as TModel;

    const wrapper = toolboxComponent.linkToModelMetadata
      ? m => linkComponentToModelMetadata(toolboxComponent, m, metadata)
      : m => m;

    const newModel: TModel = wrapper({
      ...currentModel,
      label: metadata.label || metadata.path,
      description: metadata.description,
    });

    if (settingsForm)
      settingsForm.setFormData({ values: newModel, mergeValues: true });
    else
      form.setFieldsValue(newModel);
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
      formName={isInModal ? 'modalSettings' : 'componentSettings'}
      labelCol={layoutSettings?.labelCol}
      wrapperCol={layoutSettings?.wrapperCol}
      layout={layoutSettings?.layout}
      className={sheshaStyles.verticalSettingsClass}
      mode={readOnly ? "readonly" : "edit"}
      form={form}
      onFinish={onSave}
      markup={markup}
      cacheKey={`form-designer:${toolboxComponent.type}`}
      initialValues={model}
      onValuesChange={onValuesChange}
      actions={{
        linkToModelMetadata
      }}
      onFinishFailed={onFinishFailed}
      propertyFilter={propertyFilter}
      isSettingsForm={true}
    />
  );
}

export default GenericSettingsForm;
