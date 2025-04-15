import React, { CSSProperties, FC, useCallback, useMemo, useState } from 'react';
import settingsFormJson from './settingsForm.json';
import { Button, Input } from 'antd';
import { DataContextSelector } from '@/designer-components/dataContextSelector';
import { FileSearchOutlined } from '@ant-design/icons';
import { FormMarkup } from '@/providers/form/models';
import { getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IConfigurableFormComponent, MetadataProvider } from '@/providers';
import { IToolboxComponent } from '@/interfaces';
import { MetadataType } from '@/providers/metadata/contexts';
import { PropertyAutocomplete } from '@/components/propertyAutocomplete/propertyAutocomplete';
import { useFormDesignerStateSelector } from '@/providers/formDesigner';
import SettingsControl from '../_settings/settingsControl';
import { getValueFromPropertySettings } from '../_settings/utils';
import { useStyles } from '../_settings/styles/styles';
import { ConfigurableFormItem } from '@/components';

const settingsForm = settingsFormJson as FormMarkup;

export interface IContextPropertyAutocompleteComponentProps extends IConfigurableFormComponent {
  dropdownStyle?: string;
  mode?: 'single' | 'multiple';
  modelType?: string;
  autoFillProps?: boolean;
  styledLabel?: boolean;
}


export interface IContextPropertyAutocompleteProps extends Omit<IContextPropertyAutocompleteComponentProps, 'style' | 'dropdownStyle' | 'type'>  {
  componentName: string;
  propertyName: string;
  contextName: string;
  style?: CSSProperties;
  dropdownStyle?: CSSProperties;
  defaultModelType: string;
  onValuesChange?: (changedValues: any) => void;
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
    onValuesChange
  } = model;

  const [state, setState] = useState<IContextPropertyAutocompleteState>({
    componentName,
    propertyName,
    context: contextName,
    mode: contextName || propertyName !== componentName ? 'context' : 'formData'
  });
  const { styles } = useStyles();

  // ToDo: AS - remove after full optimization
  /*useEffect(() => {
    const init = {componentName: undefined, propertyName: undefined, context: undefined, mode: undefined};
    if (componentName && !state?.componentName) 
      init.componentName = componentName;
    if (propertyName && !state?.propertyName)
      init.propertyName = propertyName;
    if (contextName && !state?.context)
      init.context = contextName;
    if (!state?.mode && (contextName || propertyName !== componentName))
      init.mode = contextName || propertyName !== componentName ? 'context' : 'formData';
    setState(init);
  }, [componentName, propertyName, contextName]);*/

  const setContextMode = () => {
    setState({ ...state, mode: 'context' });
    onValuesChange({ context: state?.context, componentName: state?.componentName });
  };

  const setFormDataMode = () => {
    setState({ ...state, mode: 'formData' });
    onValuesChange({ context: null, componentName: state?.propertyName });
  };

  const mode = state?.mode ?? 'formData';

  const context = state?.context && mode === 'context' ? state?.context : undefined;

  const styledLabel = (label: string) => <span className={styles.label}>{label}</span>;
  const contextlabel = model.styledLabel ? styledLabel("Context") : <label>Context</label>;
  const componentlabel = model.styledLabel ? styledLabel("Component Name") : <label>Component name</label>;
  const propertylabel = model.styledLabel ? styledLabel("Property Name") : <label>Property name</label>;

  const modelType = !context || mode === 'formData' ? defaultModelType : context;
  const dataType: MetadataType = !context || mode === 'formData' ? 'entity' : 'context';

  return (
    <>
      <ConfigurableFormItem model={{...model as any, label: componentlabel, componentName: 'componentName', propertyName: 'componentName', hidden: mode === 'formData'}} >
        {(value, onChange) => {
          return <Input
            readOnly={readOnly}
            value={value}
            onChange={(e) => {
              const value = e.target.value;
              if (value !== undefined) {
                setState(prev => ({ ...prev, componentName: value }));
                onChange(value);
              }
            }}
            size={model.size}
          />;
        }}
      </ConfigurableFormItem>
      <ConfigurableFormItem model={{...model as any, label: contextlabel, componentName: 'context', propertyName: 'context', hidden: mode === 'formData'}} >
        {(value, onChange) => {
          return <DataContextSelector
            {...model}
            readOnly={readOnly}
            value={value}
            onChange={(value) => {
              if (value !== undefined) {
                onChange(value);
                setState({ ...state, context: value });
              }
            }}
          />;
        }}
      </ConfigurableFormItem>
      <MetadataProvider modelType={modelType ?? 'empty'} dataType={dataType}>
        <ConfigurableFormItem model={{...model as any, label: propertylabel, componentName: 'propertyName', propertyName: 'propertyName'}} >
          {(value, onChange) => {
            return <SettingsControl
              propertyName={'propertyName'}
              mode={'value'}
              onChange={(value) => {
                if (value !== undefined) {
                  const changedData = { propertyName: value };
                  if (state?.mode === 'formData')
                    changedData['componentName'] = getValueFromPropertySettings(value);
                  if (state.propertyName !== value) {
                    setState(prev => ({ ...prev, ...changedData } as IContextPropertyAutocompleteState));
                    onChange(value);
                    onValuesChange(changedData);
                  }
                }
              }}
              value={value}
              readOnly={readOnly}
            >
              {(valueSettings, onChangeSettings) => {
                return <PropertyAutocomplete
                  value={valueSettings}
                  onChange={onChangeSettings}
                  id={model.id}
                  style={style}
                  dropdownStyle={dropdownStyle}
                  size={model.size}
                  mode={model.mode}
                  readOnly={readOnly}
                  autoFillProps={model.autoFillProps ?? true}
                />;
              }}
            </SettingsControl>;
          }}
        </ConfigurableFormItem>
      </MetadataProvider>
      <Button type='link' onClick={setFormDataMode} hidden={model.readOnly || mode === 'formData'}>
        hide binding option (bind to form data)
      </Button>
      <Button type='link' onClick={setContextMode} hidden={model.readOnly || mode === 'context'}>
        show binding option
      </Button>
    </>
  );
};

interface IContextPropertyAutocompleteCalculatedModel {
  componentName: string;
  propertyName: string;
  contextName: string;
  style: CSSProperties;
  dropdownStyle: CSSProperties;
  modelType: string;
  setFieldsValue: (values: any) => void;
}

const emptyObj = {};

const ContextPropertyAutocompleteComponent: IToolboxComponent<IContextPropertyAutocompleteComponentProps, IContextPropertyAutocompleteCalculatedModel> = {
  type: 'contextPropertyAutocomplete',
  name: 'Context Property Autocomplete',
  icon: <FileSearchOutlined />,
  isInput: true,
  isOutput: true,
  calculateModel(model, allData) {
    return { 
      componentName: allData.form?.initialValues.componentName,
      propertyName: allData.form?.initialValues.propertyName,
      contextName: allData.form?.initialValues.context,
      style: model?.style ? getStyle(model?.style, allData.data, allData.globalState) : emptyObj,
      dropdownStyle: model?.dropdownStyle ? getStyle(model?.dropdownStyle, allData.data, allData.globalState) : emptyObj,
      modelType: allData.form.formSettings.modelType,
      setFieldsValue: allData.form.setFieldsValue
    };
  },
  Factory: ({ model, calculatedModel }) => {
    const designerModelType = useFormDesignerStateSelector(x => x.formSettings?.modelType);
    const validate = useMemo(() => ({...model.validate, required: false}), [model.validate]);
    const onValuesChange = useCallback(values => calculatedModel.setFieldsValue(values), [calculatedModel.setFieldsValue]);

    return model.hidden
      ? null
      : <ContextPropertyAutocomplete {...model}
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
      />
    ;
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  migrator: (m) => m
    .add<IContextPropertyAutocompleteComponentProps>(0, (prev) => {
      const showFillPropsButton = prev['showFillPropsButton'];
      if (typeof showFillPropsButton !== 'undefined') {
        return { ...prev, autoFillProps: showFillPropsButton };
      } else {
        return { ...prev };
      }
    })
  ,
};

export default ContextPropertyAutocompleteComponent;