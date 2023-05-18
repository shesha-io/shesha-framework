import { AutoComplete, Checkbox, Form, Input, InputNumber, Select, Switch, } from 'antd';
import React, { FC, useState } from 'react';
import PropertyAutocomplete from 'components/propertyAutocomplete/propertyAutocomplete';
import CodeEditor from 'components/formDesigner/components/codeEditor/codeEditor';
import Show from 'components/show';
import { AutocompleteRaw } from 'components/autocomplete';
import FormAutocomplete from 'components/formAutocomplete';
import EndpointsAutocomplete from 'components/endpointsAutocomplete/endpointsAutocomplete';
import { MetadataProvider } from 'providers';
import LabelValueEditor from 'components/formDesigner/components/labelValueEditor/labelValueEditor';
import CollapsiblePanel from 'components/panel';
import { ConfigurableActionConfigurator } from '../configurableActionsConfigurator';
import { Option } from 'antd/lib/mentions';
import { ISettingsFormFactoryArgs } from 'interfaces';
import { IEntityReferenceControlProps } from './entityReference';
import SettingsFormItem from 'designer-components/_settings/settingsFormItem';
import SettingsCollapsiblePanel from 'designer-components/_settings/settingsCollapsiblePanel';

interface IEntityReferenceSettingsState extends IEntityReferenceControlProps { }

const formTypes = ['Table', 'Create', 'Edit', 'Details', 'Quickview', 'ListItem', 'Picker'];

export const EntityReferenceSettings: FC<ISettingsFormFactoryArgs<IEntityReferenceControlProps>> = ({ readOnly, onSave, model, onValuesChange, propertyFilter, formRef}) => {
  const [state, setState] = useState<IEntityReferenceSettingsState>(model);
  const [form] = Form.useForm();

  const [formTypesOptions, setFormTypesOptions] = useState<{ value: string }[]>(
    formTypes.map(i => {
      return { value: i };
    })
  );

  if (formRef)
    formRef.current = {
      submit: () => form.submit(),
      reset: () => form.resetFields(),
    };

  return (
    <Form
      form={form}
      onFinish={onSave}
      layout="vertical"
      onValuesChange={(changedValues, values: IEntityReferenceControlProps) => {
        //var view = null;
        /*if (Object.hasOwn(changedValues, 'formSelectionMode') && values.formSelectionMode === 'dynamic'
          || Object.hasOwn(changedValues, 'entityReferenceType')) {
          if (values.entityReferenceType === 'Dialog')
            view = 'Details';
          if (values.entityReferenceType === 'NavigateLink')
            view = 'Details';
          if (values.entityReferenceType === 'Quickview')
            view = 'Quickview';
        }*/
        const incomingState = { ...values/*, formType: view ?? state.formType*/ };

        setState(prev => ({ ...prev, ...incomingState }));

        onValuesChange(changedValues, incomingState);
      }}
      initialValues={{
        ...model,
      }}
    >
      <SettingsCollapsiblePanel propertyFilter={propertyFilter} header='Display'>
        <SettingsFormItem name="name" label="Name">
          <PropertyAutocomplete id="fb71cb51-884f-4f34-aa77-820c12276c95" readOnly={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="label" label="Label">
          <Input readOnly={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="labelAlign" label="Label align">
          <Select disabled={readOnly}>
            <Option value="left">left</Option>
            <Option value="right">right</Option>
          </Select>
        </SettingsFormItem>

        <SettingsFormItem name="description" label="Description">
          <Input readOnly={readOnly} />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>

      <SettingsCollapsiblePanel propertyFilter={propertyFilter} header='Entity reference configuration'>
        <SettingsFormItem name="placeholder" label="Placeholder">
          <Input readOnly={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="getEntityUrl" label="Get entity URL">
          <EndpointsAutocomplete readOnly={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="entityType" label="Entity type" style={{width: '100%'}}>
          <AutocompleteRaw
            dataSourceType="url"
            dataSourceUrl="/api/services/app/Metadata/TypeAutocomplete"
            readOnly={readOnly}
          />
        </SettingsFormItem>

        <MetadataProvider modelType={state?.entityType}>
          <SettingsFormItem name="displayProperty" label="Display property">
            <PropertyAutocomplete readOnly={readOnly} showFillPropsButton={false} />
          </SettingsFormItem>
        </MetadataProvider>

        <SettingsFormItem name="entityReferenceType" initialValue={'Quickview'} label="Entity Reference Type">
          <Select disabled={readOnly}>
            <Option value="Quickview">Quickview</Option>
            <Option value="NavigateLink">Navigate Link</Option>
            <Option value="Dialog">Modal dialog box</Option>
          </Select>
        </SettingsFormItem>

        <SettingsFormItem name="formSelectionMode" initialValue={'name'} label="Form selection mode">
          <Select disabled={readOnly}>
            <Option value="name">Name</Option>
            <Option value="dynamic">Dynamic</Option>
          </Select>
        </SettingsFormItem>

        {state?.formSelectionMode === 'dynamic' && (
          <SettingsFormItem name="formType" label="Form type">
            <AutoComplete
              disabled={readOnly}
              options={formTypesOptions}
              onSearch={t =>
                setFormTypesOptions(
                  (t
                    ? formTypes.filter(f => {
                      return f.toLowerCase().includes(t.toLowerCase());
                    })
                    : formTypes
                  ).map(i => {
                    return { value: i };
                  })
                )
              }
            />
          </SettingsFormItem>
        )}
        {(state?.formSelectionMode === 'name') && (
          <SettingsFormItem name="formIdentifier" label="Form">
            <FormAutocomplete readOnly={readOnly} convertToFullId={true} />
          </SettingsFormItem>
        )}
      </SettingsCollapsiblePanel>

      <Show when={state?.entityReferenceType === 'Quickview'}>
        <SettingsCollapsiblePanel propertyFilter={propertyFilter} header='Quickview settings'>
          <SettingsFormItem name="quickviewWidth" label="Quickview width">
            <InputNumber min={0} defaultValue={600} step={1} readOnly={readOnly} />
          </SettingsFormItem>
        </SettingsCollapsiblePanel>
      </Show>

      <Show when={state?.entityReferenceType === 'Dialog'}>
        <SettingsCollapsiblePanel propertyFilter={propertyFilter} header='Dialog settings'>
          <SettingsFormItem name="modalTitle" label="Title">
            <Input readOnly={readOnly} />
          </SettingsFormItem>

          <SettingsFormItem name="showModalFooter" label="Show Modal Buttons" valuePropName="checked">
            <Checkbox disabled={readOnly} />
          </SettingsFormItem>

          {state?.showModalFooter &&
            <SettingsFormItem name="submitHttpVerb" initialValue={'POST'} label="Submit Http Verb">
              <Select disabled={readOnly}>
                <Option value="POST">POST</Option>
                <Option value="PUT">PUT</Option>
              </Select>
            </SettingsFormItem>
          }
          <SettingsFormItem name="additionalProperties" label="Additional properties">
            <LabelValueEditor
              labelName='key'
              labelTitle='Key'
              valueName='value'
              valueTitle='Value'
              description={'Additional properties you want to be passed when the form gets submitted like parentId in the case where the modal is used in a childTable. ' +
                'Also note you can use Mustache expression like {{id}} for value property. \n\n' +
                'Id initial value is already initialised with {{entityReference.id}} but you can override it'
              }
              exposedVariables={[
                {name: 'data', description: 'This form data', type: 'object'},
                {name: 'form', description: 'Form instance', type: 'object'},
                {name: 'formMode', description: 'Current form mode', type: "'designer' | 'edit' | 'readonly'"},
                {name: 'globalState', description: 'Global state', type: 'object'},
                {name: 'entityReference.id', description: 'Id of entity reference entity', type: 'object'},
                {name: 'entityReference.entity', description: 'Entity', type: 'object'},
                {name: 'moment', description: 'moment', type: ''},
                {name: 'http', description: 'axiosHttp', type: ''},
              ]}
            />
          </SettingsFormItem>

          <SettingsFormItem name="modalWidth" label="Dialog Width (%)">
            <Select disabled={readOnly}>
              <Option value="40%">Small</Option>
              <Option value="60%">Medium</Option>
              <Option value="80%">Large</Option>
              <Option value="custom">Custom</Option>
            </Select>
          </SettingsFormItem>
          {state?.modalWidth === 'custom' &&
            <>
              <SettingsFormItem name="widthUnits" label="Units">
                <Select disabled={readOnly}>
                  <Option value="%">Percentage (%)</Option>
                  <Option value="px">Pixels (px)</Option>
                </Select>
              </SettingsFormItem>
              <SettingsFormItem name="customWidth" label="Enter Custom Width">
                <InputNumber min={0} readOnly={readOnly} />
              </SettingsFormItem>
            </>
          }

          <SettingsFormItem name="handleSuccess" label="Handle Success" valuePropName="checked">
            <Switch />
          </SettingsFormItem>
          {state?.handleSuccess &&
            <CollapsiblePanel header="On Success handler">
              <SettingsFormItem name="onSuccess" label="On Success">
                <ConfigurableActionConfigurator editorConfig={null} level={0} />
              </SettingsFormItem>
            </CollapsiblePanel>
          }

          <SettingsFormItem name="handleFail" label="Handle Fail" valuePropName="checked">
            <Switch />
          </SettingsFormItem>
          {state?.handleFail &&
            <CollapsiblePanel header="On Fail handler">
              <SettingsFormItem name="onFail" label="On Fail">
                <ConfigurableActionConfigurator editorConfig={null} level={0} />
              </SettingsFormItem>
            </CollapsiblePanel>
          }
        </SettingsCollapsiblePanel>
      </Show>

      <SettingsCollapsiblePanel propertyFilter={propertyFilter} header='Layout'>
        <SettingsFormItem name="labelCol" label="Label Col">
          <InputNumber min={0} max={24} defaultValue={5} step={1} readOnly={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="wrapperCol" label="Wrapper Col">
          <InputNumber min={0} max={24} defaultValue={13} step={1} readOnly={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="style" label="Style">
          <CodeEditor
            readOnly={readOnly}
            mode="dialog"
            label="Style"
            setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
            name="style"
            type={''}
            id={''}
            description="CSS Style"
            exposedVariables={[
              {
                id: '788673a5-5eb9-4a9a-a34b-d8cea9cacb3c',
                name: 'data',
                description: 'Form data',
                type: 'object',
              },
            ]}
          />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>

      <SettingsCollapsiblePanel propertyFilter={propertyFilter} header='Visibility'>
        <SettingsFormItem name="readOnly" label="Read Only" valuePropName="checked">
          <Checkbox disabled={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="hideLabel" label="Hide Label" valuePropName="checked">
          <Checkbox disabled={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem
          propertyFilter={propertyFilter}
          label="Custom Visibility"
          name="customVisibility"
          tooltip={"Enter custom visibility code.  You must return true to show the component. " + 
            "The global variable data is provided, and allows you to access the data of any form component, by using its API key."
          }
        >
          <CodeEditor
            readOnly={readOnly}
            mode="dialog"
            label="Custom Visibility"
            setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
            name="customVisibility"
            type={''}
            id={''}
            description={"Enter custom visibility code.  You must return true to show the component. " + 
              "The global variable data is provided, and allows you to access the data of any form component, by using its API key."
            }
            exposedVariables={[
              {
                id: '788673a5-5eb9-4a9a-a34b-d8cea9cacb3c',
                name: 'data',
                description: 'Form data',
                type: 'object',
              },
              {
                id: '65b71112-d412-401f-af15-1d3080f85319',
                name: 'globalState',
                description: 'The global state',
                type: 'object',
              },
              {
                id: '3633b881-43f4-4779-9f8c-da3de9ecf9b8',
                name: 'queryParams',
                description: 'Query parameters',
                type: 'object',
              },
            ]}
          />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>
    </Form>
  );
};
