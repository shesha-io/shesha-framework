import { AutoComplete, Checkbox, Form, Input, InputNumber, Select, Switch } from 'antd';
import React, { FC, useState } from 'react';
import SectionSeparator from '../../../sectionSeparator';
import PropertyAutocomplete from '../../../propertyAutocomplete/propertyAutocomplete';
import CodeEditor from '../codeEditor/codeEditor';
import Show from '../../../show';
import { AutocompleteRaw } from '../../../autocomplete';
import FormAutocomplete from '../../../formAutocomplete';
import { IEntityReferenceProps } from '../../../entityReference';
import EndpointsAutocomplete from '../../../endpointsAutocomplete/endpointsAutocomplete';
import { MetadataProvider } from '../../../../providers';
import LabelValueEditor from '../labelValueEditor/labelValueEditor';
import CollapsiblePanel from '../../../collapsiblePanel';
import { ConfigurableActionConfigurator } from '../configurableActionsConfigurator';

const Option = Select.Option;

const FormItem = Form.Item;

export interface IEntityReferenceSettingsProps {
  readOnly: boolean;
  model: IEntityReferenceProps;
  onSave: (model: IEntityReferenceProps) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: IEntityReferenceProps) => void;
}

interface IEntityReferenceSettingsState extends IEntityReferenceProps {}

const formTypes = ['Table', 'Create', 'Edit', 'Details', 'Quickview', 'ListItem', 'Picker'];

export const EntityReferenceSettings: FC<IEntityReferenceSettingsProps> = ({ readOnly, onSave, model, onValuesChange }) => {
  const [state, setState] = useState<IEntityReferenceSettingsState>(model);
  const [form] = Form.useForm();

  const [formTypesOptions, setFormTypesOptions] = useState<{ value: string }[]>(
    formTypes.map(i => {
      return { value: i };
    })
  );

  return (
    <Form
      form={form}
      onFinish={onSave}
      layout="vertical"
      onValuesChange={(changedValues, values: IEntityReferenceProps) => {
        //var view = null;
        /*if (Object.hasOwn(changedValues, 'formSelectionMode') && values.formSelectionMode == 'dynamic'
          || Object.hasOwn(changedValues, 'entityReferenceType')) {
          if (values.entityReferenceType == 'Dialog')
            view = 'Details';
          if (values.entityReferenceType == 'NavigateLink')
            view = 'Details';
          if (values.entityReferenceType == 'Quickview')
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
      <SectionSeparator title="Display" />

      <FormItem name="name" label="Name">
        <PropertyAutocomplete id="fb71cb51-884f-4f34-aa77-820c12276c95" readOnly={readOnly} />
      </FormItem>

      <FormItem name="label" label="Label">
        <Input readOnly={readOnly} />
      </FormItem>

      <FormItem name="labelAlign" label="Label align">
        <Select disabled={readOnly}>
          <Option value="left">left</Option>
          <Option value="right">right</Option>
        </Select>
      </FormItem>

      <FormItem name="description" label="Description">
        <Input readOnly={readOnly} />
      </FormItem>

      <SectionSeparator title="Entity reference configuration" />

      <FormItem name="placeholder" label="Placeholder">
        <Input readOnly={readOnly} />
      </FormItem>

      <FormItem name="getEntityUrl" label="Get entity URL">
        <EndpointsAutocomplete readOnly={readOnly} />
      </FormItem>

      <FormItem name="entityType" label="Entity type">
        <AutocompleteRaw
          dataSourceType="url"
          dataSourceUrl="/api/services/app/Metadata/TypeAutocomplete"
          readOnly={readOnly}
        />
      </FormItem>

      <MetadataProvider modelType={state?.entityType}>
        <FormItem name="displayProperty" label="Display property">
            <PropertyAutocomplete readOnly={readOnly} showFillPropsButton={false}/>
        </FormItem>
      </MetadataProvider>

      <FormItem name="entityReferenceType" initialValue={'Quickview'} label="Entity Reference Type">
        <Select disabled={readOnly}>
          <Option value="Quickview">Quickview</Option>
          <Option value="NavigateLink">Navigate Link</Option>
          <Option value="Dialog">Modal dialog box</Option>
        </Select>
      </FormItem>

      <FormItem name="formSelectionMode" initialValue={'name'} label="Form selection mode">
        <Select disabled={readOnly}>
          <Option value="name">Name</Option>
          <Option value="dynamic">Dynamic</Option>
        </Select>
      </FormItem>

      {state?.formSelectionMode == 'dynamic' && (
        <>
          <FormItem name="formType" label="Form type">
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
          </FormItem>
        </>
      )}
      {(state?.formSelectionMode == 'name') && (
          <FormItem name="formIdentifier" label="Form">
            <FormAutocomplete readOnly={readOnly} convertToFullId={true} />
          </FormItem>
      )}

      <Show when={state?.entityReferenceType === 'Quickview'}>
        <SectionSeparator title="Quickview settings" />

        <FormItem name="quickviewWidth" label="Quickview width">
          <InputNumber min={0} defaultValue={600} step={1} readOnly={readOnly} />
        </FormItem>
      </Show>

      <Show when={state?.entityReferenceType === 'Dialog'}>
        <SectionSeparator title="Dialog settings" />

        <FormItem name="modalTitle" label="Title">
          <Input readOnly={readOnly} />
        </FormItem>

        <Form.Item name="showModalFooter" label="Show Modal Buttons" valuePropName="checked">
          <Checkbox disabled={readOnly} />
        </Form.Item>

        {state?.showModalFooter &&
          <FormItem name="submitHttpVerb" initialValue={'POST'} label="Submit Http Verb">
            <Select disabled={readOnly}>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
            </Select>
          </FormItem>
        }
        <Form.Item name="additionalProperties" label="Additional properties">
          <LabelValueEditor 
            labelName='key'
            labelTitle='Key'
            valueName='value'
            valueTitle='Value'
            description='Additional properties you want to be passed when the form gets submitted like parentId in the case where the modal is used in a childTable. Also note you can use Mustache expression like {{id}} for value property'
          />
        </Form.Item>

        <FormItem name="modalWidth" label="Dialog Width (%)">
            <Select disabled={readOnly}>
              <Option value="40%">Small</Option>
              <Option value="60%">Medium</Option>
              <Option value="80%">Large</Option>
              <Option value="custom">Custom</Option>
            </Select>
          </FormItem>
          {state?.modalWidth == 'custom' &&
          <>
            <FormItem name="widthUnits" label="Units">
              <Select disabled={readOnly}>
                <Option value="%">Percentage (%)</Option>
                <Option value="px">Pixels (px)</Option>
              </Select>
            </FormItem>
            <FormItem name="customWidth" label="Enter Custom Width">
              <InputNumber min={0} readOnly={readOnly} />
            </FormItem>
          </>
          }

          <Form.Item name="handleSuccess" label="Handle Success" valuePropName="checked">
            <Switch />
          </Form.Item>
          {state?.handleSuccess &&
          <CollapsiblePanel header="On Success handler">
            <FormItem name="onSuccess" label="On Success">
              <ConfigurableActionConfigurator editorConfig={null} level={0} />
            </FormItem>
          </CollapsiblePanel>
          }

          <Form.Item name="handleFail" label="Handle Fail" valuePropName="checked">
            <Switch />
          </Form.Item>
          {state?.handleFail &&
          <CollapsiblePanel header="On Fail handler">
            <FormItem name="onFail" label="On Fail">
              <ConfigurableActionConfigurator editorConfig={null} level={0} />
            </FormItem>
          </CollapsiblePanel>
          }
      </Show>



      <SectionSeparator title="Layout" />

      <FormItem name="labelCol" label="Label Col">
        <InputNumber min={0} max={24} defaultValue={5} step={1} readOnly={readOnly} />
      </FormItem>

      <FormItem name="wrapperCol" label="Wrapper Col">
        <InputNumber min={0} max={24} defaultValue={13} step={1} readOnly={readOnly} />
      </FormItem>

      <FormItem name="style" label="Style">
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
      </FormItem>

      <SectionSeparator title="Visibility" />

      <FormItem name="readOnly" label="Read Only" valuePropName="checked">
        <Checkbox disabled={readOnly} />
      </FormItem>

      <Form.Item name="hideLabel" label="Hide Label" valuePropName="checked">
        <Checkbox disabled={readOnly} />
      </Form.Item>

      <FormItem
        label="Custom Visibility"
        name="customVisibility"
        tooltip="Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
      >
        <CodeEditor
          readOnly={readOnly}
          mode="dialog"
          label="Custom Visibility"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          name="customVisibility"
          type={''}
          id={''}
          description="Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
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
      </FormItem>
    </Form>
  );
};
