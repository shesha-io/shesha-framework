import React, { MutableRefObject, useEffect, useRef } from 'react';
import { Form } from 'antd';
import { IConfigurableFormComponent, FormMarkup } from '@/providers/form/models';
import { ConfigurableFormInstance, DEFAULT_FORM_LAYOUT_SETTINGS, IFormLayoutSettings, ISettingsFormInstance, IToolboxComponentBase } from '@/interfaces';
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
import { useThemeActions } from '@/providers';
import { useDeepCompareEffect } from '@/hooks/useDeepCompareEffect';
import { getStyleBoxValue } from '@/designer-components/styleBox/utils';

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
}: IProps<TModel>): React.JSX.Element {
  const [form] = Form.useForm();
  const { getComponentStyle } = useThemeActions();

  const defaultModel = useDefaultModelActionsOrUndefined();
  const dcm = useDataContextManager();
  const designerDevice = (dcm?.getDataContextData('canvasContext') as ICanvasStateContext)?.designerDevice || 'desktop';
  const currentDevice = useRef<DeviceTypes>('desktop');

  useDeepCompareEffect(() => {
    if (toolboxComponent.allowInherit) {
      const defaultComponentStyle = toolboxComponent.getDefaultStyles?.() ?? {};
      defaultModel?.setDefaultModel('Default comonent Style', { ['desktop']: defaultComponentStyle });
      const themeStyle = getComponentStyle(toolboxComponent.type);
      defaultModel?.setDefaultModel('Theme component Style', { ['desktop']: themeStyle });

      if (designerDevice !== 'desktop' && designerDevice !== currentDevice.current) {
        // inherit mobile and tablet styles from desktop styles
        defaultModel?.setDefaultModel('Default comonent Style', { [designerDevice]: defaultComponentStyle });
        defaultModel?.setDefaultModel('Theme component Style', { [designerDevice]: themeStyle });
        const model = defaultModel?.getModel();
        const desktopStyles = deepCopyViaJson(unproxyValue((model as Record<string, unknown>)?.desktop ?? {})) as Record<string, unknown>;
        defaultModel?.setDefaultModel('Desktop component Style', { [designerDevice]: { ...desktopStyles, stylingBox: getStyleBoxValue(desktopStyles.stylingBox as string) } });
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
  }, [model]);

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

  const getMergedOrValue = (payload: ISetFormDataPayload): any => {
    const { values, mergeValues } = payload;
    const data = defaultModel?.getModel();
    return mergeValues && data
      ? deepMergeValues({ ...data, stylingBox: getStyleBoxValue((data as Record<string, unknown>).stylingBox as string) }, values)
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

      dataSource={{ dataGetter: defaultModel?.getMergedModel, dataSetter: defaultModel?.setModel, getMergedOrValue }}
    />
  );
}

export default GenericSettingsForm;
