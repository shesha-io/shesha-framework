import React, { RefObject, useEffect, useRef } from 'react';
import { Form } from 'antd';
import { IConfigurableFormComponent, FormMarkup, FormAction } from '@/providers/form/models';
import { ConfigurableFormInstance, DEFAULT_FORM_LAYOUT_SETTINGS, IFormLayoutSettings, ISettingsFormInstance, IShaFormInstance, IToolboxComponent } from '@/interfaces';
import { IPropertyMetadata } from '@/interfaces/metadata';
import { linkComponentToModelMetadata } from '@/providers/form/utils';
import { ConfigurableForm } from '../configurableForm';
import { sheshaStyles } from '@/styles';
import { ICanvasStateContext } from '@/providers/canvas/contexts';
import { deepCopyViaJson, deepMergeValues, unproxyValue } from '@/utils/object';
import { DeviceTypes } from '@/publicJsApis/apis/canvasContextApi';
import { useDefaultModelActionsOrUndefined } from '@/designer-components/_settings/defaultModelProvider/defaultModelProvider';
import { ISetFormDataPayload } from '@/providers/form/contexts';
import { useDataContextManager } from '@/providers/dataContextManager/hooks';
import { OnFormFinishFailedHandler, OnFormValuesChangeHandler } from '../configurableForm/models';
import { IStyleValue, useThemeActions } from '@/providers';
import { useDeepCompareEffect } from '@/hooks/useDeepCompareEffect';
import { getStyleBoxValue } from '@/designer-components/styleBox/utils';

export interface IProps<TModel extends IConfigurableFormComponent> {
  readOnly: boolean;
  model: TModel;
  markup: FormMarkup;
  onSave: (model: TModel) => void;
  onCancel: () => void;
  onValuesChange?: OnFormValuesChangeHandler<TModel> | undefined;
  toolboxComponent: IToolboxComponent<TModel>;
  formRef?: RefObject<ISettingsFormInstance | null> | undefined;
  propertyFilter?: ((name: string) => boolean) | undefined;
  layoutSettings?: IFormLayoutSettings | undefined;
  isInModal?: boolean | undefined;
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
}: IProps<TModel>): React.JSX.Element {
  const [form] = Form.useForm();
  const { getComponentStyle } = useThemeActions();

  const defaultModel = useDefaultModelActionsOrUndefined<TModel>();
  const dcm = useDataContextManager();
  const designerDevice = ((dcm.getDataContextData('canvasContext') as ICanvasStateContext | undefined)?.designerDevice || 'desktop');
  const currentDevice = useRef<DeviceTypes>('desktop');

  useDeepCompareEffect(() => {
    if (Boolean(toolboxComponent.allowInherit)) {
      const defaultComponentStyle = toolboxComponent.getDefaultStyles?.() ?? {};
      defaultModel?.setDefaultModel('Default comonent Style', { ['desktop']: defaultComponentStyle } as TModel);
      const themeStyle = getComponentStyle(toolboxComponent.type);
      defaultModel?.setDefaultModel('Theme component Style', { ['desktop']: themeStyle } as TModel);

      if (designerDevice !== 'desktop' && designerDevice !== currentDevice.current) {
        // inherit mobile and tablet styles from desktop styles
        defaultModel?.setDefaultModel('Default comonent Style', { [designerDevice]: defaultComponentStyle } as unknown as TModel);
        defaultModel?.setDefaultModel('Theme component Style', { [designerDevice]: themeStyle } as unknown as TModel);
        const model = defaultModel?.getModel();
        const desktopStyles = deepCopyViaJson(unproxyValue((model as IConfigurableFormComponent).desktop ?? {})) as IStyleValue;
        defaultModel?.setDefaultModel('Desktop component Style', { [designerDevice]: { ...desktopStyles, stylingBox: getStyleBoxValue(desktopStyles.stylingBox as string) } } as unknown as TModel);
      }
    }
    currentDevice.current = designerDevice;
  }, [toolboxComponent.allowInherit, designerDevice, defaultModel, toolboxComponent, getComponentStyle]);

  // Keep the Ant Design form store in sync when the component model changes externally.
  // initialValues is applied once on mount, so without this sync any field managed outside
  // the settings panel (e.g. a canvas-side onChange) remains stale in allValues and gets
  // written back through onValuesChange → auto-save.
  useEffect(() => {
    form.setFieldsValue(model);
  }, [form, model]);

  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const linkToModelMetadata = (metadata: IPropertyMetadata, settingsForm: ConfigurableFormInstance | undefined): void => {
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

  const onChange: OnFormValuesChangeHandler<TModel> = (changedValues, values) => {
    onValuesChange?.(changedValues, values);
  };

  const getMergedOrValue = (payload: ISetFormDataPayload<TModel>, _instance: IShaFormInstance<TModel>): TModel => {
    const { values, mergeValues } = payload;
    const data = defaultModel?.getModel();
    return mergeValues && data
      ? deepMergeValues({ ...data, stylingBox: getStyleBoxValue((data as IStyleValue).stylingBox as string) }, values)
      : values;
  };

  const onFinishFailed: OnFormFinishFailedHandler<TModel> = (errorInfo) => {
    console.error('onFinishFailed', errorInfo);
  };

  if (formRef)
    formRef.current = {
      submit: () => form.submit(),
      reset: () => form.resetFields(),
    };

  return (
    <ConfigurableForm<TModel>
      formName={Boolean(isInModal) ? 'modalSettings' : 'componentSettings'}
      labelCol={layoutSettings.labelCol}
      wrapperCol={layoutSettings.wrapperCol}
      layout={layoutSettings.layout}
      className={sheshaStyles.verticalSettingsClass}
      mode={readOnly ? "readonly" : "edit"}
      form={form}
      onFinish={onSave}
      markup={markup}
      cacheKey={`form-designer:${toolboxComponent.type}`}
      initialValues={model}
      onValuesChange={onChange}
      actions={{
        linkToModelMetadata: linkToModelMetadata as FormAction,
      }}
      onFinishFailed={onFinishFailed}
      propertyFilter={propertyFilter}
      isSettingsForm={true}

      dataSource={{ dataGetter: defaultModel?.getMergedModel, dataSetter: defaultModel?.setModel, getMergedOrValue }}
    />
  );
}

export default GenericSettingsForm;
