import React, { CSSProperties, FC, ReactNode, useCallback, useMemo, useState } from 'react';
import settingsFormJson from './settingsForm.json';
import { Button, Input } from 'antd';
import { DataContextSelector } from '@/designer-components/dataContextSelector';
import { FileSearchOutlined } from '@ant-design/icons';
import { FormMarkup } from '@/providers/form/models';
import { getStyle, linkComponentToModelMetadata, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IConfigurableFormComponent, MetadataProvider, UnwrapCodeEvaluators, useFormDesignerComponents, useMetadataDispatcher, useShaFormInstanceOrUndefined } from '@/providers';
import { MetadataType } from '@/providers/metadata/contexts';
import { PropertyAutocomplete } from '@/components/propertyAutocomplete/propertyAutocomplete';
import { useFormDesignerSettings } from '@/providers/formDesigner';
import SettingsControl from '../_settings/settingsControl';
import { getValueFromPropertySettings } from '../_settings/utils/utils';
import { useStyles } from '../_settings/styles/styles';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';
import { ContextPropertyAutocompleteComponentDefinition, IContextPropertyAutocompleteComponentProps } from './interfaces';
import { IModelMetadata, isEntityMetadata, isPropertiesArray, IToolboxComponentBase } from '@/interfaces';
import { toCamelCase, truncateMiddle } from '@/utils/string';
import { useDefaultModelProviderStateOrUndefined } from '../_settings/defaultModelProvider/defaultModelProvider';
import { isJsonEntityMetadata } from '@/interfaces/metadata';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { throwError } from '@/utils/errors';

const settingsForm = settingsFormJson as FormMarkup;


export interface IContextPropertyAutocompleteProps extends Omit<UnwrapCodeEvaluators<IContextPropertyAutocompleteComponentProps>, 'style' | 'dropdownStyle' | 'type'> {
  componentName: string;
  propertyName: string;
  contextName: string;
  style?: CSSProperties;
  dropdownStyle?: CSSProperties;
  defaultModelType: string | IEntityTypeIdentifier;
  onValuesChange?: (changedValues: object) => void;
}

interface IContextPropertyAutocompleteState {
  mode: 'formData' | 'context';
  context?: string;
  propertyName?: string;
  componentName?: string;
}

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
    mode: contextName || propertyName !== componentName ? 'context' : 'formData',
  });
  const { styles } = useStyles();

  const setContextMode = (): void => {
    setState({ ...state, mode: 'context' });
    onValuesChange({ context: state?.context, componentName: state?.componentName });
  };

  const setFormDataMode = (): void => {
    setState({ ...state, mode: 'formData' });
    onValuesChange({ context: null, componentName: state?.propertyName });
  };

  const mode = state?.mode ?? 'formData';

  const context = state?.context && mode === 'context' ? state?.context : undefined;

  const styledLabel = (label: string): ReactNode => <span className={styles.label}>{label}</span>;
  const contextlabel = model.styledLabel ? styledLabel("Context") : <label>Context</label>;
  const componentlabel = model.styledLabel ? styledLabel("Component Name") : <label>Component name</label>;
  const propertylabel = model.styledLabel ? styledLabel("Property Name") : <label>Property name</label>;

  const modelType = !context || mode === 'formData' ? defaultModelType : context;
  const dataType: MetadataType = !context || mode === 'formData' ? 'entity' : 'context';

  return (
    <>
      <ConfigurableFormItem model={{ ...model as any, label: componentlabel, componentName: 'componentName', propertyName: 'componentName', hidden: mode === 'formData' }}>
        {(value, onChange) => {
          return (
            <Input
              readOnly={readOnly}
              value={value}
              onChange={(e) => {
                const value = e.target.value;
                if (value !== undefined) {
                  setState((prev) => ({ ...prev, componentName: value }));
                  onChange(value);
                }
              }}
              size={model.size}
            />
          );
        }}
      </ConfigurableFormItem>
      <ConfigurableFormItem model={{ ...model as any, label: contextlabel, componentName: 'context', propertyName: 'context', hidden: mode === 'formData' }}>
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
        <ConfigurableFormItem model={{ ...model as any, label: propertylabel, componentName: 'propertyName', propertyName: 'propertyName' }}>
          {(value, onChange) => {
            return (
              <SettingsControl<string | string[]>
                propertyName="propertyName"
                mode="value"
                onChange={(value) => {
                  if (value !== undefined) {
                    const changedData = { propertyName: value };
                    if (state?.mode === 'formData')
                      changedData['componentName'] = getValueFromPropertySettings(value);
                    if (state.propertyName !== value) {
                      setState((prev) => ({ ...prev, ...changedData } as IContextPropertyAutocompleteState));
                      onChange(value);
                      onValuesChange(changedData);
                    }
                  }
                }}
                value={value}
                readOnly={readOnly}
              >
                {(valueSettings, onChangeSettings) => {
                  return (
                    <PropertyAutocomplete
                      value={valueSettings}
                      onChange={onChangeSettings}
                      id={model.id}
                      style={style}
                      dropdownStyle={dropdownStyle}
                      size={model.size}
                      mode={model.mode}
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
      <Button type="link" onClick={setFormDataMode} hidden={model.readOnly || mode === 'formData'}>
        hide binding option (bind to form data)
      </Button>
      <Button type="link" onClick={setContextMode} hidden={model.readOnly || mode === 'context'}>
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
      style: model.style ? getStyle(model?.style, allData.data, allData.globalState) : emptyObj,
      dropdownStyle: model.dropdownStyle ? getStyle(model?.dropdownStyle, allData.data, allData.globalState) : emptyObj,
      modelType: allData.form.formSettings.modelType,
      clearFieldsValue: allData.form.clearFieldsValue,
      getFieldsValue: allData.form.formInstance.getFieldsValue,
      setFieldsValue: allData.form.setFieldsValue,
      getPropertyName: () => allData.form.getFormData()?.['propertyName'],
    };
  },
  Factory: ({ model, calculatedModel }) => {
    const defaultValue = useDefaultModelProviderStateOrUndefined();
    const formComponent = useFormDesignerComponents()[calculatedModel.componentType];

    if (!formComponent) throwError(`Component ${calculatedModel.componentType} not found`);

    const formSettings = useFormDesignerSettings();
    const inst = useShaFormInstanceOrUndefined();
    const designerModelType = formSettings?.modelType;
    const validate = useMemo(() => ({ ...model.validate, required: false }), [model.validate]);

    const [metadata, setMetadata] = useState<IModelMetadata>(undefined);
    const metaDispatcher = useMetadataDispatcher();

    const setContextMetadata = useCallback((meta: IModelMetadata, propName: string, component: IToolboxComponentBase): IConfigurableFormComponent | undefined => {
      const propertyName = toCamelCase(propName);
      const propertyMetadata = isPropertiesArray(meta?.properties)
        ? meta?.properties?.find((p) => toCamelCase(p.path) === propertyName)
        : null;
      if (!propertyMetadata) return undefined;
      const metadataConfig = linkComponentToModelMetadata(component, { id: '', type: '' }, propertyMetadata);
      const metaName = isEntityMetadata(meta) || isJsonEntityMetadata(meta) ? `${meta.entityType} (${truncateMiddle(meta.entityModule, 25)})` : meta.name;
      defaultValue?.setDefaultModel(metaName, metadataConfig);
      inst?.updateData();
      return metadataConfig;
    }, [defaultValue, inst]);

    // ToDo: AS - review getting metadata and updating default model, merge this actions with PropertyAutocomplete
    useEffectOnce(() => {
      if (formComponent.allowInherit) {
        const modelType = designerModelType ?? calculatedModel.modelType;
        metaDispatcher.getMetadata({ modelType, dataType: 'entity' })
          .then((meta) => {
            setMetadata(meta);
            setContextMetadata(meta, calculatedModel.propertyName, formComponent);
          })
          .catch((error) => {
            console.error(`Failed to fetch metadata for ${calculatedModel.propertyName}: ${modelType} - `, error);
          });
      }
    });

    const onValuesChange = useCallback((values) => {
      if (formComponent.allowInherit) {
        // update default model
        const metadataConfig = setContextMetadata(metadata, values.propertyName, formComponent);
        if (!metadataConfig) {
          // Property not found in metadata, just update the values
          calculatedModel.setFieldsValue(values);
          return;
        }
        // reset inherited values if inherited
        const undefinedFields = Object.keys(metadataConfig).reduce((acc, fieldName) => {
          acc[fieldName] = undefined;
          return acc;
        }, {} as Record<string, undefined>);
        calculatedModel.setFieldsValue({ ...undefinedFields, ...values, id: calculatedModel.componentId, type: calculatedModel.componentType });
      } else
        // update propertyName and componentName (all other values will be updated by nested propertyAutocomplete)
        calculatedModel.setFieldsValue(values);
    }, [calculatedModel, formComponent, metadata, setContextMetadata]);

    return model.hidden
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

          autoFillProps={!formComponent.allowInherit}
        />
      )
    ;
  },
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  migrator: (m) => m
    .add<IContextPropertyAutocompleteComponentProps>(0, (prev) => {
      const showFillPropsButton = prev['showFillPropsButton'];
      if (typeof showFillPropsButton !== 'undefined') {
        return { ...prev, autoFillProps: showFillPropsButton };
      } else {
        return { ...prev };
      }
    }),
};

export default ContextPropertyAutocompleteComponent;
