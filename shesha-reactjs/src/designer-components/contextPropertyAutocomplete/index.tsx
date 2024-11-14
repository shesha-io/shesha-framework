import ConditionalWrap from '@/components/conditionalWrapper';
import React, { FC, useEffect, useState } from 'react';
import settingsFormJson from './settingsForm.json';
import { Button, Form, Input } from 'antd';
import { DataContextSelector } from '@/designer-components/dataContextSelector';
import { FileSearchOutlined } from '@ant-design/icons';
import { FormMarkup } from '@/providers/form/models';
import { getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IConfigurableFormComponent, MetadataProvider, useForm } from '@/providers';
import { IToolboxComponent } from '@/interfaces';
import { MetadataType } from '@/providers/metadata/contexts';
import { PropertyAutocomplete } from '@/components/propertyAutocomplete/propertyAutocomplete';
import { useFormDesignerState } from '@/providers/formDesigner';
import SettingsControl from '../_settings/settingsControl';
import { getValueFromPropertySettings } from '../_settings/utils';

const settingsForm = settingsFormJson as FormMarkup;

export interface IContextPropertyAutocompleteComponentProps extends IConfigurableFormComponent {
  dropdownStyle?: string;
  mode?: 'single' | 'multiple';
  modelType?: string;
  autoFillProps?: boolean;
  styledLabel?: boolean;
}


export interface IContextPropertyAutocompleteProps extends Omit<IContextPropertyAutocompleteComponentProps, 'type' | 'propertyName'> {
  defaultModelType: string;
  formData: any;
  onValuesChange?: (changedValues: any) => void;
}

interface IContextPropertyAutocompleteState {
  mode: 'formData' | 'context';
  context?: string;
  propertyName?: string;
  componentName?: string;
}

export const ContextPropertyAutocomplete: FC<IContextPropertyAutocompleteProps> = (model) => {
  const { defaultModelType, readOnly, formData, onValuesChange } = model;

  const [state, setState] = useState<IContextPropertyAutocompleteState>();

  useEffect(() => {
    if (!state && formData?.propertyName)
      setState({
        mode: !!formData?.context || formData?.propertyName !== formData?.componentName
          ? 'context'
          : 'formData',
        context: formData?.context,
        propertyName: formData?.propertyName,
        componentName: formData?.componentName
      });
  }, [formData]);

  const setContextMode = () => {
    setState({ ...state, mode: 'context' });
    onValuesChange({ context: state?.context });
  };

  const setFormDataMode = () => {
    setState({ ...state, mode: 'formData' });
    onValuesChange({ context: null });
  };

  const mode = state?.mode ?? 'formData';

  const context = !!state?.context && mode === 'context' ? state?.context : undefined;

  const styledLabel = (label: string) => <span style={{ fontWeight: 500, fontSize: 12, color: 'darkslategrey' }}>{label}</span>;
  ;
  const contextlabel = model.styledLabel ? styledLabel("Context") : <label>Context</label>;
  const componentlabel = model.styledLabel ? styledLabel("Component Name") : <label>Component name</label>;
  const propertylabel = model.styledLabel ? styledLabel("Property Name") : <label>Property name</label>;

  const modelType = !context || mode === 'formData' ? defaultModelType : context;
  const dataType: MetadataType = !context || mode === 'formData' ? 'entity' : 'context';

  return (
    <>
      <Form.Item {...{ label: componentlabel, readOnly }} hidden={mode === 'formData'} >
        <Input
          readOnly={readOnly}
          value={formData.componentName}
          onChange={(e) => {
            setState(prev => ({ ...prev, componentName: e.target.value }));
            onValuesChange({ componentName: e.target.value });
          }}
          size={model.size}
        />
      </Form.Item>
      <Form.Item {...{ label: contextlabel, readOnly }} hidden={mode === 'formData'} >
        <DataContextSelector
          {...model}
          readOnly={readOnly}
          value={formData?.context}
          onChange={(value) => {
            onValuesChange({ context: value });
            setState({ ...state, context: value });
          }}
        />
      </Form.Item>
      <ConditionalWrap
        condition={Boolean(modelType)}
        wrap={content => <MetadataProvider modelType={modelType} dataType={dataType}>{content}</MetadataProvider>}
      >
        <Form.Item {...{ label: propertylabel, readOnly }} >
          <SettingsControl
            propertyName={'propertyName'}
            mode={'value'}
            onChange={(value) => {
              const changedData = { propertyName: value };
              if (state?.mode === 'formData')
                changedData['componentName'] = getValueFromPropertySettings(value);
              setState(prev => ({ ...prev, ...changedData } as IContextPropertyAutocompleteState));
              onValuesChange(changedData);
            }}
            value={formData.propertyName as any}
            readOnly={readOnly}
          >
            {(value, onChange) => {
              return <PropertyAutocomplete
                value={value}
                onChange={onChange}
                id={model.id}
                style={getStyle(model?.style, formData)}
                dropdownStyle={getStyle(model?.dropdownStyle, formData)}
                size={model.size}
                mode={model.mode}
                readOnly={readOnly}
                autoFillProps={model.autoFillProps ?? true}
              />;
            }}
          </SettingsControl>
        </Form.Item>
      </ConditionalWrap>
      <Button type='link' onClick={setFormDataMode} hidden={model.readOnly || mode === 'formData'}>
        hide binding option (bind to form data)
      </Button>
      <Button type='link' onClick={setContextMode} hidden={model.readOnly || mode === 'context'}>
        show binding option
      </Button>
    </>
  );
};

const ContextPropertyAutocompleteComponent: IToolboxComponent<IContextPropertyAutocompleteComponentProps> = {
  type: 'contextPropertyAutocomplete',
  name: 'Context Property Autocomplete',
  icon: <FileSearchOutlined />,
  isInput: true,
  isOutput: true,
  Factory: ({ model }) => {
    const designerModelType = useFormDesignerState(false)?.formSettings?.modelType;
    const form = useForm();
    const { formData, formSettings, setFormData } = form;

    if (model.hidden) return null;

    return (
      <ContextPropertyAutocomplete {...model}
        readOnly={model.readOnly}
        styledLabel={model.styledLabel}
        defaultModelType={designerModelType ?? formSettings.modelType}
        formData={formData}
        onValuesChange={(values) => {
          setFormData({ values: { ...values }, mergeValues: true });
        }}
      />
    );
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