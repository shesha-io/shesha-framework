import React, { FC, useState } from 'react';
import { IToolboxComponent } from '../../interfaces';
import { FormMarkup } from '@/providers/form/models';
import { FileSearchOutlined } from '@ant-design/icons';
import settingsFormJson from './settingsForm.json';
import { getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { PropertyAutocomplete } from '@/components/propertyAutocomplete/propertyAutocomplete';
import { IConfigurableFormComponent, MetadataProvider, useForm } from '@/designer-components/..';
import ConditionalWrap from '@/components/conditionalWrapper';
import { DataContextSelector } from '@/designer-components/dataContextSelector';
import { Button, Form, Input } from 'antd';
import { useFormDesigner } from '@/providers/formDesigner';
import { MetadataType } from '@/providers/metadata/contexts';

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
}

export const ContextPropertyAutocomplete: FC<IContextPropertyAutocompleteProps> = (model) => {

  const {defaultModelType, readOnly, formData, onValuesChange} = model;

  const [state, setState] = useState<IContextPropertyAutocompleteState>({mode: !!formData?.context ? 'context' : 'formData', context: formData?.context});

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
        <Input disabled={model.disabled} readOnly={model.readOnly} value={formData?.componentName} onChange={(e) => {
          onValuesChange({componentName: e.target.value});
        }}/>
      </Form.Item>
      <Form.Item {...{label: contextlabel, readOnly}} hidden={state.mode === 'formData'} >
        <DataContextSelector {...model} readOnly={model.disabled || model.readOnly} value={formData?.context} onChange={(value) => {
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
            value={formData?.propertyName}
            onChange={(value) => {
              const changedData = {propertyName: value};
              if (state.mode === 'formData')
                changedData['componentName'] = value;
              onValuesChange(changedData);
            }}
            id={model.id}
            style={getStyle(model?.style, formData)}
            dropdownStyle={getStyle(model?.dropdownStyle, formData)}
            size={model.size}
            mode={model.mode}
            readOnly={model.disabled || readOnly}
            showFillPropsButton={model.showFillPropsButton ?? true}
          />
        </Form.Item>
      </ConditionalWrap>
      <Button type='link' onClick={setFormDataMode} hidden={model.disabled || model.readOnly || state.mode === 'formData'}>
        hide binding option (bind to form data)
      </Button>
      <Button type='link' onClick={setContextMode} hidden={model.disabled || model.readOnly ||state.mode === 'context'}>
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
  
    const readOnly = model?.readOnly || model.disabled;

    return (
      <ContextPropertyAutocomplete {...model}
        readOnly={readOnly} 
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
