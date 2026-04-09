import React, { MutableRefObject, useEffect, useRef } from 'react';
import { Form } from 'antd';
import { IConfigurableFormComponent, FormMarkup } from '@/providers/form/models';
import { ConfigurableFormInstance, DEFAULT_FORM_LAYOUT_SETTINGS, IFormLayoutSettings, ISettingsFormInstance, IToolboxComponentBase } from '@/interfaces';
import { IPropertyMetadata } from '@/interfaces/metadata';
import { linkComponentToModelMetadata } from '@/providers/form/utils';
import { ConfigurableForm } from '../configurableForm';
import { sheshaStyles } from '@/styles';
import { useDataContextManager } from '@/providers';
import { ICanvasStateContext } from '@/providers/canvas/contexts';
import { deepCopyViaJson, deepMergeValues, unproxyValue } from '@/utils/object';
import { DeviceTypes } from '@/publicJsApis/canvasContextApi';
import { useDefaultModelProviderStateOrUndefined } from '@/designer-components/_settings/defaultModelProvider/defaultModelProvider';
import { ISetFormDataPayload } from '@/providers/form/contexts';

export interface IProps<TModel extends IConfigurableFormComponent> {
  readOnly: boolean;
  model: TModel;
  markup: FormMarkup;
  onSave: (model: TModel) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: TModel) => void;
  toolboxComponent: IToolboxComponentBase;
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
  isInModal,
}: IProps<TModel>): JSX.Element {
  const [form] = Form.useForm();

  const defaultModel = useDefaultModelProviderStateOrUndefined();
  const dcm = useDataContextManager();
  const designerDevice = (dcm?.getDataContextData('canvasContext') as ICanvasStateContext)?.designerDevice || 'desktop';
  const currentDevice = useRef<DeviceTypes>('desktop');

  // inherit mobile and tablet styles from desktop styles
  useEffect(() => {
    if (toolboxComponent.allowInherit && designerDevice !== 'desktop' && designerDevice !== currentDevice.current) {
      const desktopStyles = (defaultModel?.getModel() as Record<string, unknown>)?.desktop;
      if (desktopStyles) {
        const newStyle = { [designerDevice]: unproxyValue(deepCopyViaJson(desktopStyles)) };
        defaultModel?.setDefaultModel('Desktop style', newStyle);
      }
    }
    currentDevice.current = designerDevice;
  }, [designerDevice, defaultModel, toolboxComponent.allowInherit]);

  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const linkToModelMetadata = (metadata: IPropertyMetadata, settingsForm: ConfigurableFormInstance): void => {
    const currentModel = form.getFieldsValue() as TModel;
    const newModel = linkComponentToModelMetadata(toolboxComponent, currentModel, metadata);

    const setData = (values: object): void => {
      if (settingsForm)
        settingsForm.setFormData({ values: values, mergeValues: true });
      else
        form.setFieldsValue(values);
    };

    setData(newModel);

    if (toolboxComponent.initModelFromMetadata) {
      toolboxComponent.initModelFromMetadata(currentModel, newModel, metadata)
        .then((r) => {
          if (isMounted.current) setData(r);
        })
        .catch((error) => console.error('Failed to initialize model from metadata:', error));
    }
  };

  const onChange = (changedValues: any, values: TModel): void => {
    onValuesChange?.(changedValues, values);
  };

  const setFormDataNewDataAction = (payload: ISetFormDataPayload): any => {
    const { values, mergeValues } = payload;
    const data = defaultModel?.getModel();
    return mergeValues && data
      ? deepMergeValues(data, values)
      : values;
  };

  const onFinishFailed = (errorInfo): void => {
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
      onValuesChange={onChange}
      actions={{
        linkToModelMetadata,
      }}
      onFinishFailed={onFinishFailed}
      propertyFilter={propertyFilter}
      isSettingsForm={true}

      formDataGetter={defaultModel?.getMergedModel}
      formDataSetter={defaultModel?.setModel}
      setFormDataNewDataAction={setFormDataNewDataAction}
    />
  );
}

export default GenericSettingsForm;
