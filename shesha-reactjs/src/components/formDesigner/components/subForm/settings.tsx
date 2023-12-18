import { AutoComplete, Checkbox, Input, InputNumber, Select } from 'antd';
import React, { FC, useState } from 'react';
import SectionSeparator from '@/components/sectionSeparator';
import CodeEditor from '../codeEditor/codeEditor';
import Show from '@/components/show';
import { Autocomplete } from '@/components/autocomplete';
import FormAutocomplete from '@/components/formAutocomplete';
import { ISettingsFormFactoryArgs } from '@/interfaces';
import SettingsForm, { useSettingsForm } from '@/designer-components/_settings/settingsForm';
import { useFormDesigner } from '@/providers/formDesigner';
import { useForm } from '@/providers';
import { ISubFormComponentProps } from '.';
import SettingsCollapsiblePanel from '@/designer-components/_settings/settingsCollapsiblePanel';
import { ContextPropertyAutocomplete } from '@/designer-components/contextPropertyAutocomplete';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import ReadOnlyModeSelector from '@/components/editModeSelector/index';

const Option = Select.Option;

interface ISubFormSettingsState extends ISubFormComponentProps {}

const formTypes = ['Table', 'Create', 'Edit', 'Details', 'Quickview', 'ListItem', 'Picker'];

export const SubFormSettingsForm: FC<ISettingsFormFactoryArgs<ISubFormComponentProps>> = (props) => {
  return (
    SettingsForm<ISubFormSettingsState>({...props, children: <SubFormSettings {...props}/>})
  );
};

const SubFormSettings: FC<ISettingsFormFactoryArgs<ISubFormComponentProps>> = ({readOnly}) => {
  const { model: formData, onValuesChange } = useSettingsForm<ISubFormComponentProps>();

  const designerModelType = useFormDesigner(false)?.formSettings?.modelType;
  const { formSettings } = useForm();

  const [formTypesOptions, setFormTypesOptions] = useState<{ value: string }[]>(
    formTypes.map(i => {
      return { value: i };
    })
  );

  return (
    <>
      <SettingsCollapsiblePanel header='Display'>
        <ContextPropertyAutocomplete id="fb71cb51-884f-4f34-aa77-820c12276c95"
          readOnly={readOnly} 
          defaultModelType={designerModelType ?? formSettings.modelType}
          formData={formData}
          onValuesChange={onValuesChange}
        />

      <SettingsFormItem name="label" label="Label" jsSetting>
        <Input readOnly={readOnly} />
      </SettingsFormItem>

      <SettingsFormItem name="editMode" label="Edit mode" jsSetting>
        <ReadOnlyModeSelector readOnly={readOnly} />
      </SettingsFormItem>

      <SettingsFormItem name="hideLabel" label="Hide Label" valuePropName="checked" jsSetting>
        <Checkbox disabled={readOnly} />
      </SettingsFormItem>

      <SettingsFormItem name="hidden" label="Hidden" valuePropName="checked" jsSetting>
        <Checkbox disabled={readOnly} />
      </SettingsFormItem>

      <SettingsFormItem name="uniqueStateId" label="Unique State ID" tooltip="Important for accessing the " jsSetting>
        <Input readOnly={readOnly} />
      </SettingsFormItem>

      <SettingsFormItem name="formSelectionMode" initialValue={'name'} label="Form selection mode">
        <Select disabled={readOnly}>
          <Option value="name">Name</Option>
          <Option value="dynamic">Dynamic</Option>
        </Select>
      </SettingsFormItem>

      {formData?.formSelectionMode === 'dynamic' && (
        <>
          <SettingsFormItem name="formType" label="Form type" jsSetting>
            <AutoComplete
              disabled={readOnly}
              options={formTypesOptions}
              onSearch={(t) =>
                setFormTypesOptions(
                  (t
                    ? formTypes.filter((f) => {
                        return f.toLowerCase().includes(t.toLowerCase());
                      })
                    : formTypes
                  ).map((i) => {
                    return { value: i };
                  })
                )
              }
            />
          </SettingsFormItem>
        </>
      )}

      {(!formData?.formSelectionMode || formData?.formSelectionMode === 'name') && (
          <SettingsFormItem name="formId" label="Form" jsSetting>
            <FormAutocomplete readOnly={readOnly} convertToFullId={true} />
          </SettingsFormItem>
      )}

          <SectionSeparator title="Data" />

          <SettingsFormItem
            name="dataSource"
            initialValue={'form'}
            label="Data source"
            tooltip="The list data to be used can be the data that comes with the form of can be fetched from the API"
          >
            <Select disabled={readOnly}>
              <Option value="form">form</Option>
              <Option value="api">api</Option>
            </Select>
          </SettingsFormItem>

          <Show when={formData?.dataSource === 'api'}>
            <SettingsFormItem jsSetting
              name="apiMode"
              initialValue={'entityType'}
              label="API Mode"
              tooltip="The API mode to use to fetch data"
            >
              {(value) => 
                <Select disabled={readOnly} value={value}
                  onChange={(val) => {
                    if (val === 'entityName') {
                      onValuesChange({apiMode: val, getUrl: null});
                    } else {
                      onValuesChange({apiMode: val, entityType: null});
                    }
                  }}
                  >
                  <Option value="entityName">entityName</Option>
                  <Option value="url">url</Option>
                </Select>
              }
            </SettingsFormItem>

            <Show when={formData?.apiMode === 'entityName'}>
              <SettingsFormItem name="entityType" label="Entity type" jsSetting>
                {(value) => {
                  return <Autocomplete.Raw
                    dataSourceType="url"
                    dataSourceUrl="/api/services/app/Metadata/TypeAutocomplete"
                    readOnly={readOnly}
                    value={value}
                    onChange={(val) => {
                      onValuesChange({entityType: val, properties: null});
                    }}
                  />;
                }}
              </SettingsFormItem>
            </Show>

            <Show when={Boolean(formData?.entityType)}>
              <SettingsFormItem name="properties" label="Properties" jsSetting>
                {(value) => {
                  return <CodeEditor
                      readOnly={readOnly}
                      mode="inline"
                      setOptions={{ minLines: 15, maxLines: 500, fixedWidthGutter: true }}
                      propertyName="properties"
                      value={typeof value === 'string' ? value : value?.join(' ')}
                      onChange={(val) => {
                        onValuesChange({properties: val});
                      }}
                      language="graphqlschema"
                      label="Query Params"
                      description="Properties in GraphQL-like syntax"
                    />;
                }}
              </SettingsFormItem>
            </Show>

            <SettingsFormItem
              label="Query Params"
              name="queryParams"
              tooltip="The code that returns the query parameters to be used to fetch the data. Ideally this should be a function that returns an object with the entity id"
            >
              <CodeEditor
                readOnly={readOnly}
                mode="dialog"
                setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
                propertyName="getUrl"
                label="Query Params"
                description="The code that returns the query parameters to be used to fetch the data. Ideally this should be a function that returns an object with the entity id"
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
                  {
                    id: 'bb3f8b7a-fada-43ab-bb83-acf557b77013',
                    name: 'value',
                    description: 'The form value',
                    type: 'object',
                  },
                ]}
              />
            </SettingsFormItem>

            <SectionSeparator
              title="URLs"
              tooltip="These settings are not mandatory except if you do not want to use the default URL, which is dependent on the Entity"
            />

            <Show when={formData?.apiMode === 'url'}>
              <SettingsFormItem
                label="GET Url"
                name="getUrl"
                tooltip="The API url that will be used to fetch the data. Write the code that returns the string"
              >
                {(value) => 
                <CodeEditor
                  readOnly={readOnly}
                  mode="dialog"
                  setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
                  propertyName="getUrl"
                  value={value}
                  onChange={(val) => {
                    onValuesChange({getUrl: val});
                  }}
                  label="GET Url"
                  description="The API url that will be used to fetch the data. Write the code that returns the string"
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
                }
              </SettingsFormItem>
            </Show>

            <SettingsFormItem
              label="POST Url"
              name="postUrl"
              tooltip="The API url that will be used to update data. Write the code that returns the string"
            >
              <CodeEditor
                readOnly={readOnly}
                mode="dialog"
                setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
                propertyName="postUrl"
                label="POST Url"
                description="The API url that will be used to update data. Write the code that returns the string"
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

            <SettingsFormItem
              label="PUT Url"
              name="putUrl"
              tooltip="The API url that will be used to update data. Write the code that returns the string"
            >
              <CodeEditor
                readOnly={readOnly}
                mode="dialog"
                setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
                propertyName="putUrl"
                label="PUT Url"
                description="The API url that will be used to update data. Write the code that returns the string"
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
          </Show>
      </SettingsCollapsiblePanel>

      <SectionSeparator title="Actions" />

      <SettingsFormItem
        label="On Submit"
        name="beforeGet"
        tooltip="Triggered before retrieving the sub-form object from the back-end"
      >
        <CodeEditor
          readOnly={readOnly}
          mode="dialog"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          propertyName="beforeGet"
          label="On Submit"
          description="Triggered before retrieving the sub-form object from the back-end"
          exposedVariables={[
            {
              id: '788673a5-5eb9-4a9a-a34b-d8cea9cacb3c',
              name: 'data',
              description: 'Form data',
              type: 'object',
            },
            {
              id: '27ad7bc6-1b04-4e63-a1a9-6771fae8dd5c',
              name: 'initialValues',
              description:
                "Initial values (from the parent form. It's value is the formData if the is the sub-form of the main form)",
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

      <SettingsFormItem
        label="On Created"
        name="onCreated"
        tooltip="Triggered after successfully creating a new sub-form object in the back-end"
      >
        <CodeEditor
          readOnly={readOnly}
          mode="dialog"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          propertyName="onCreated"
          label="On Created"
          description="Triggered after successfully creating a new sub-form object in the back-end"
          exposedVariables={[
            {
              id: 'a4fa029d-731b-4fda-a527-0e109c8c2218',
              name: 'response',
              description: 'Submitted data',
              type: 'object',
            },
            {
              id: 'ab8a5818-00d7-4a4b-a736-9081252d145d',
              name: 'data',
              description: 'Form data',
              type: 'object',
            },
            {
              id: '9fc8c63f-9fd5-48a8-b841-bc804c08ae97',
              name: 'globalState',
              description: 'The global state',
              type: 'object',
            },
            {
              id: '9d75b33e-c247-4465-8cc3-7440d2807c66',
              name: 'message',
              description: 'Toast message',
              type: 'object',
            },
            {
              id: 'ecada650-c940-438c-80ae-8986ba54bce1',
              name: 'publish',
              description: 'Event publisher',
              type: 'function',
            },
          ]}
        />
      </SettingsFormItem>

      <SettingsFormItem
        label="On Updated"
        name="onUpdated"
        tooltip="Triggered after successfully creating a new sub-form object in the back-end"
      >
        <CodeEditor
          readOnly={readOnly}
          mode="dialog"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          propertyName="onUpdated"
          label="On Updated"
          description="Triggered after successfully updating the sub-form object in the back-end"
          exposedVariables={[
            {
              id: 'a4fa029d-731b-4fda-a527-0e109c8c2218',
              name: 'response',
              description: 'Submitted data',
              type: 'object',
            },
            {
              id: 'ab8a5818-00d7-4a4b-a736-9081252d145d',
              name: 'data',
              description: 'Form data',
              type: 'object',
            },
            {
              id: '9fc8c63f-9fd5-48a8-b841-bc804c08ae97',
              name: 'globalState',
              description: 'The global state',
              type: 'object',
            },
            {
              id: '9d75b33e-c247-4465-8cc3-7440d2807c66',
              name: 'message',
              description: 'Toast message',
              type: 'object',
            },
            {
              id: 'ecada650-c940-438c-80ae-8986ba54bce1',
              name: 'publish',
              description: 'Event publisher',
              type: 'function',
            },
          ]}
        />
      </SettingsFormItem>

      <SectionSeparator title="Layout" />

      <SettingsFormItem name="labelCol" label="Label Col" jsSetting>
        <InputNumber min={0} max={24} defaultValue={8} step={1} readOnly={readOnly} />
      </SettingsFormItem>

      <SettingsFormItem name="wrapperCol" label="Wrapper Col" jsSetting>
        <InputNumber min={0} max={24} defaultValue={16} step={1} readOnly={readOnly} />
      </SettingsFormItem>

      <SettingsFormItem name="style" label="Style">
        <CodeEditor
          readOnly={readOnly}
          mode="dialog"
          label="Style"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          propertyName="style"
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
      </>
  );
};
