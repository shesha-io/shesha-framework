import ConditionalWrap from '@/components/conditionalWrapper';
import React, { FC, useState } from 'react';
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
import { useFormDesigner } from '@/providers/formDesigner';

const settingsForm = settingsFormJson as FormMarkup;

export interface IContextPropertyAutocompleteComponentProps extends IConfigurableFormComponent {
  dropdownStyle?: string;
  mode?: 'single' | 'multiple';
  modelType?: string;
  showFillPropsButton?: boolean;
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

  const {defaultModelType, readOnly, formData, onValuesChange} = model;

  const initialState: IContextPropertyAutocompleteState = {
    mode: !!formData?.context || formData?.propertyName !== formData?.componentName 
      ? 'context' 
      : 'formData',
    context: formData?.context,
    propertyName: formData?.propertyName,
    componentName: formData?.componentName
  };

  const [state, setState] = useState<IContextPropertyAutocompleteState>(initialState);

  const setContextMode = () => {
    setState({...state, mode: 'context'});
    onValuesChange({context: state.context});
  };

  const setFormDataMode = () => {
    setState({...state, mode: 'formData'});
    onValuesChange({context: null});
  };

  const context = !!state.context && state.mode === 'context' ? state.context : undefined;

  const contextlabel = <label>Context</label>;
  const componentlabel = <label>Component name</label>;
  const propertylabel = <label>Property name</label>;

  const modelType = !context || state.mode === 'formData' ? defaultModelType : context;
  const dataType: MetadataType = !context || state.mode === 'formData' ? 'entity' : 'context';

  return (
    <>
      <Form.Item {...{label: componentlabel, readOnly}} hidden={state.mode === 'formData'} >
        <Input readOnly={readOnly} value={state.componentName} onChange={(e) => {
          setState(prev => ({...prev, componentName: e.target.value}));
          onValuesChange({componentName: e.target.value});
        }}/>
      </Form.Item>
      <Form.Item {...{label: contextlabel, readOnly}} hidden={state.mode === 'formData'} >
        <DataContextSelector {...model} readOnly={readOnly} value={formData?.context} onChange={(value) => {
          onValuesChange({context: value});
          setState({...state, context: value});
        }}/>
      </Form.Item>
      <ConditionalWrap
        condition={Boolean(modelType)}
        wrap={content => <MetadataProvider modelType={modelType} dataType={dataType}>{content}</MetadataProvider>}
      >
        <Form.Item {...{label: propertylabel, readOnly}} >
          <PropertyAutocomplete
            value={state.propertyName}
            onChange={(value) => {
              const changedData = {propertyName: value};
              if (state.mode === 'formData')
                changedData['componentName'] = value;
              setState(prev => ({...prev, ...changedData} as IContextPropertyAutocompleteState));
              onValuesChange(changedData);
            }}
            id={model.id}
            style={getStyle(model?.style, formData)}
            dropdownStyle={getStyle(model?.dropdownStyle, formData)}
            size={model.size}
            mode={model.mode}
            readOnly={readOnly}
            showFillPropsButton={model.showFillPropsButton ?? true}
          />
        </Form.Item>
      </ConditionalWrap>
      <Button type='link' onClick={setFormDataMode} hidden={model.readOnly || state.mode === 'formData'}>
        hide binding option (bind to form data)
      </Button>
      <Button type='link' onClick={setContextMode} hidden={model.readOnly ||state.mode === 'context'}>
        show binding option
      </Button>
    </>
  );
};

const ContextPropertyAutocompleteComponent: IToolboxComponent<IContextPropertyAutocompleteComponentProps> = {
  type: 'contextPropertyAutocomplete',
  name: 'Context Property Autocomplete',
  icon: <FileSearchOutlined />,
  Factory: ({ model }) => {
    const designerModelType = useFormDesigner(false)?.formSettings?.modelType;
    const { formData, formSettings, setFormData } = useForm();
  
    if (model.hidden) return null;

    return (
      <ContextPropertyAutocomplete {...model}
        readOnly={model.readOnly} 
        defaultModelType={designerModelType ?? formSettings.modelType}
        formData={formData}
        onValuesChange={(values) => {
          setFormData({values: {...values}, mergeValues: true});
        }}
      />
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

export default ContextPropertyAutocompleteComponent;
