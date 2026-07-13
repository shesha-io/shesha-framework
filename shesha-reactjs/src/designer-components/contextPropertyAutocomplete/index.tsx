import React, { FC, ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import settingsFormJson from './settingsForm.json';
import { Button, Input } from 'antd';
import { DataContextSelector } from '@/designer-components/dataContextSelector';
import { FileSearchOutlined } from '@ant-design/icons';
import { FormMarkup } from '@/providers/form/models';
import { getStyle, linkComponentToModelMetadata, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IConfigurableFormComponent, MetadataProvider, useFormDesignerComponents, useMetadataDispatcher, useShaFormInstanceOrUndefined } from '@/providers';
import { MetadataType } from '@/providers/metadata/contexts';
import { PropertyAutocomplete } from '@/components/propertyAutocomplete/propertyAutocomplete';
import { useFormDesignerSettings } from '@/providers/formDesigner';
import SettingsControl from '../_settings/settingsControl';
import { getValueFromPropertySettings } from '../_settings/utils/utils';
import { useStyles } from '../_settings/styles/styles';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { ContextPropertyAutocompleteComponentDefinition, IContextPropertyAutocompleteComponentProps, IContextPropertyAutocompleteProps, IContextPropertyAutocompleteState, IContextPropertyAutocompleteValue } from './interfaces';
import { IModelMetadata, isEntityMetadata, isPropertiesArray, IToolboxComponent } from '@/interfaces';
import { toCamelCase, truncateMiddle } from '@/utils/string';
import { useDefaultModelActionsOrUndefined } from '../_settings/defaultModelProvider/defaultModelProvider';
import { isJsonEntityMetadata } from '@/interfaces/metadata';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { throwError } from '@/utils/errors';
import { isDefined, isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';

const settingsForm = settingsFormJson as FormMarkup;

export const ContextPropertyAutocomplete: FC<IContextPropertyAutocompleteProps> = (model) => {
  const {
    defaultModelType,
    readOnly,
    componentName,
    propertyName,
    contextName,
    style,
    dropdownStyle,
    onValuesChange,
  } = model;

  const [state, setState] = useState<IContextPropertyAutocompleteState>({
    componentName,
    propertyName,
    context: contextName,
    mode: isNotNullOrWhiteSpace(contextName) || propertyName !== componentName ? 'context' : 'formData',
  });
  const { styles } = useStyles();

  const setContextMode = (): void => {
    setState({ ...state, mode: 'context' });
    onValuesChange?.({ context: state.context, componentName: state.componentName });
  };

  const setFormDataMode = (): void => {
    setState({ ...state, mode: 'formData' });
    onValuesChange?.({ context: null, componentName: state.propertyName });
  };

  const mode = state.mode;

  const context = isNotNullOrWhiteSpace(state.context) && mode === 'context' ? state.context : undefined;

  const styledLabel = (label: string): ReactNode => <span className={styles.label}>{label}</span>;
  const contextlabel = model.styledLabel ?? false ? styledLabel("Context") : <label>Context</label>;
  const componentlabel = model.styledLabel ?? false ? styledLabel("Component Name") : <label>Component name</label>;
  const propertylabel = model.styledLabel ?? false ? styledLabel("Property Name") : <label>Property name</label>;

  const modelType = isNullOrWhiteSpace(context) || mode === 'formData' ? defaultModelType : context;
  const dataType: MetadataType = isNullOrWhiteSpace(context) || mode === 'formData' ? 'entity' : 'context';

  return (
    <>
      <ConfigurableFormItem<string> model={{ ...model, label: componentlabel, componentName: 'componentName', propertyName: 'componentName', hidden: mode === 'formData', type: '', style: undefined, jsSetting: false }}>
        {(value, onChange) => {
          return (
            <Input
              readOnly={readOnly}
              value={value as string}
              onChange={(e) => {
                const value = e.target.value;
                if (isDefined(value)) {
                  setState((prev) => ({ ...prev, componentName: value }));
                  onChange(value);
                }
              }}
              size={model.size}
            />
          );
        }}
      </ConfigurableFormItem>
      <ConfigurableFormItem<string> model={{ ...model, label: contextlabel, componentName: 'context', propertyName: 'context', hidden: mode === 'formData', type: '', style: undefined, jsSetting: false }}>
        {(value, onChange) => {
          return (
            <DataContextSelector
              {...model}
              readOnly={readOnly}
              value={value}
              onChange={(value) => {
                onChange(value);
                setState({ ...state, context: value });
              }}
            />
          );
        }}
      </ConfigurableFormItem>
      <MetadataProvider modelType={modelType} dataType={dataType}>
        <ConfigurableFormItem<string> model={{ ...model, label: propertylabel, componentName: 'propertyName', propertyName: 'propertyName', type: '', style: undefined, jsSetting: false }}>
          {(value, onChange) => {
            return (
              <SettingsControl<string | string[]>
                propertyName="propertyName"
                mode="value"
                onChange={(value) => {
                  if (value !== undefined) {
                    const changedData: IContextPropertyAutocompleteValue = { propertyName: value as string };
                    if (state.mode === 'formData')
                      changedData.componentName = getValueFromPropertySettings(value as string);
                    if (state.propertyName !== value) {
                      setState((prev) => ({ ...prev, ...changedData } as IContextPropertyAutocompleteState));
                      onChange(value as string);
                      onValuesChange?.(changedData);
                    }
                  }
                }}
                value={value}
                readOnly={readOnly}
                enabled={false}
              >
                {(valueSettings, onChangeSettings) => {
                  return (
                    <PropertyAutocomplete
                      mode="single"
                      value={valueSettings}
                      onChange={onChangeSettings}
                      style={style}
                      dropdownStyle={dropdownStyle}
                      size={model.size}
                      readOnly={readOnly}
                      autoFillProps={model.autoFillProps ?? true}
                    />
                  );
                }}
              </SettingsControl>
            );
          }}
        </ConfigurableFormItem>
      </MetadataProvider>
      <Button type="link" onClick={setFormDataMode} hidden={Boolean(model.readOnly) || mode === 'formData'}>
        hide binding option (bind to form data)
      </Button>
      <Button type="link" onClick={setContextMode} hidden={Boolean(model.readOnly) || mode === 'context'}>
        show binding option
      </Button>
    </>
  );
};

const emptyObj = {};

const ContextPropertyAutocompleteComponent: ContextPropertyAutocompleteComponentDefinition = {
  type: 'contextPropertyAutocomplete',
  name: 'Context Property Autocomplete',
  icon: <FileSearchOutlined />,
  isInput: true,
  isOutput: true,
  preserveDimensionsInDesigner: true,
  calculateModel(model, allData) {
    const initialValues = (allData.form?.initialValues ?? {}) as IConfigurableFormComponent;
    return {
      componentId: initialValues.id,
      componentType: initialValues.type,
      componentName: initialValues.componentName,
      propertyName: initialValues.propertyName,
      contextName: initialValues.context,
      style: isNotNullOrWhiteSpace(model.style) ? getStyle(model.style, allData.data, allData.globalState) : emptyObj,
      dropdownStyle: isNotNullOrWhiteSpace(model.dropdownStyle) ? getStyle(model.dropdownStyle, allData.data, allData.globalState) : emptyObj,
      modelType: allData.form?.formSettings?.modelType,
      clearFieldsValue: allData.form?.clearFieldsValue,
      getFieldsValue: allData.form?.formInstance?.getFieldsValue,
      setFieldsValue: allData.form?.setFieldsValue,
      getPropertyName: () => (allData.form?.getFormData?.() as IConfigurableFormComponent | undefined)?.propertyName,
    };
  },
  Factory: ({ model, calculatedModel }) => {
    const defaultValue = useDefaultModelActionsOrUndefined();
    const formComponent = useFormDesignerComponents()[calculatedModel.componentType] as IToolboxComponent<IConfigurableFormComponent> | undefined;

    if (!isDefined(formComponent)) throwError(`Component ${calculatedModel.componentType} not found`);

    const formSettings = useFormDesignerSettings();
    const formInstance = useShaFormInstanceOrUndefined();
    const designerModelType = formSettings.modelType;
    const validate = useMemo(() => ({ ...model.validate, required: false }), [model.validate]);

    const metadata = useRef<IModelMetadata>(undefined);
    const metaName = useRef<string>(undefined);
    const metaDispatcher = useMetadataDispatcher();

    const setContextMetadata = useCallback((propName: string, component: IToolboxComponent<IConfigurableFormComponent>): IConfigurableFormComponent | undefined => {
      const meta = metadata.current;
      const metaNameLocal = (isEntityMetadata(meta) || isJsonEntityMetadata(meta) ? `${meta.entityType} (${truncateMiddle(meta.entityModule ?? '', 25)})` : meta?.name) ?? undefined;
      const propertyName = toCamelCase(propName);
      const propertyMetadata = isPropertiesArray(meta?.properties)
        ? meta.properties.find((p) => toCamelCase(p.path) === propertyName)
        : null;
      if (!propertyMetadata) {
        defaultValue?.removeDefaultModel(metaName.current ?? '');
        return undefined;
      }
      if (metaName.current !== metaNameLocal) defaultValue?.removeDefaultModel(metaName.current ?? '');
      const metadataConfig = linkComponentToModelMetadata(component, { id: '', type: '' }, propertyMetadata);
      metaName.current = metaNameLocal;
      defaultValue?.setDefaultModel(metaNameLocal ?? '', metadataConfig);
      formInstance?.updateData?.();
      return metadataConfig;
    }, [defaultValue, formInstance]);

    useEffectOnce(() => {
      if (isDefined(formComponent) && (formComponent.allowInherit ?? false)) {
        const modelType = designerModelType ?? calculatedModel.modelType;
        if (!isDefined(modelType)) return;
        metaDispatcher.getMetadata({ modelType, dataType: 'entity' })
          .then((meta) => {
            metadata.current = meta ?? undefined;
            setContextMetadata(calculatedModel.propertyName ?? '', formComponent);
          })
          .catch((error) => {
            console.error(`Failed to fetch metadata for ${calculatedModel.propertyName}: ${modelType} - `, error);
          });
      }
    });

    const onValuesChange = useCallback((values: IContextPropertyAutocompleteValue) => {
      if (isDefined(formComponent) && (formComponent.allowInherit ?? false)) {
        // update default model
        const metadataConfig = setContextMetadata(values.propertyName ?? '', formComponent);
        if (!metadataConfig) {
          // Property not found in metadata, just update the values
          calculatedModel.setFieldsValue?.(values);
          return;
        }
        // reset inherited values if inherited
        const undefinedFields = Object.keys(metadataConfig).reduce((acc, fieldName) => {
          acc[fieldName] = undefined;
          return acc;
        }, {} as Record<string, undefined>);
        calculatedModel.setFieldsValue?.({ ...undefinedFields, ...values, id: calculatedModel.componentId, type: calculatedModel.componentType });
      } else
        // update propertyName and componentName (all other values will be updated by nested propertyAutocomplete)
        calculatedModel.setFieldsValue?.(values);
    }, [calculatedModel, formComponent, setContextMetadata]);

    return model.hidden ?? false
      ? null
      : (
        <ContextPropertyAutocomplete
          {...model}
          componentName={calculatedModel.componentName}
          propertyName={calculatedModel.propertyName}
          contextName={calculatedModel.contextName}
          style={calculatedModel.style}
          dropdownStyle={calculatedModel.dropdownStyle}
          validate={validate}
          readOnly={model.readOnly}
          styledLabel={model.styledLabel}
          defaultModelType={designerModelType ?? calculatedModel.modelType}
          onValuesChange={onValuesChange}

          autoFillProps={!(formComponent?.allowInherit ?? false)}
        />
      )
    ;
  },
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  migrator: (m) => m
    .add<IContextPropertyAutocompleteComponentProps>(0, (prev) => {
      const showFillPropsButton = (prev as { showFillPropsButton?: boolean | undefined })['showFillPropsButton'];
      if (typeof showFillPropsButton !== 'undefined') {
        return { ...prev, autoFillProps: showFillPropsButton };
      } else {
        return { ...prev };
      }
    }),
};

export default ContextPropertyAutocompleteComponent;
