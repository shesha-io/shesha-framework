import { AutoComplete, Checkbox, Form, Input, InputNumber, Select } from 'antd';
import React, { FC, useState } from 'react';
import SectionSeparator from '../../../sectionSeparator';
import PropertyAutocomplete from '../../../propertyAutocomplete/propertyAutocomplete';
import CodeEditor from '../codeEditor/codeEditor';
import Show from '../../../show';
import { AutocompleteRaw } from '../../../autocomplete';
import { ISubFormProps } from '../../../../providers/subForm/interfaces';
import FormAutocomplete from '../../../formAutocomplete';

const Option = Select.Option;

const FormItem = Form.Item;

export interface ISubFormSettingsProps {
  readOnly: boolean;
  model: ISubFormProps;
  onSave: (model: ISubFormProps) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: ISubFormProps) => void;
}

interface ISubFormSettingsState extends ISubFormProps {}

const formTypes = ['Table', 'Create', 'Edit', 'Details', 'Quickview', 'ListItem', 'Picker'];

export const SubFormSettings: FC<ISubFormSettingsProps> = ({ readOnly, onSave, model, onValuesChange }) => {
  const [state, setState] = useState<ISubFormSettingsState>(model);
  const [form] = Form.useForm();

  const [formTypesOptions, setFormTypesOptions] = useState<{ value: string }[]>(
    formTypes.map((i) => {
      return { value: i };
    })
  );

  return (
    <Form
      form={form}
      onFinish={onSave}
      layout="vertical"
      onValuesChange={(changedValues: ISubFormProps, values: ISubFormProps) => {
        const incomingState = { ...values };

        if (Object.hasOwn(changedValues, 'entityType')) {
          incomingState.properties = null;

          form?.setFieldsValue({ properties: null });
        }

        if (Object.hasOwn(changedValues, 'apiMode')) {
          if (changedValues?.apiMode === 'entityName') {
            incomingState.getUrl = null;
            form?.setFieldsValue({ getUrl: null });
          } else {
            incomingState.entityType = null;
            form?.setFieldsValue({ entityType: null });
          }
        }

        setState((prev) => ({ ...prev, ...incomingState }));

        onValuesChange(changedValues, incomingState);
      }}
      initialValues={{
        ...model,
        properties: typeof model?.properties === 'string' ? model?.properties : model?.properties?.join(' '),
      }}
      // initialValues={initialValues}
    >
      <SectionSeparator title="Display" />

      <FormItem name="name" label="Name">
        <PropertyAutocomplete id="fb71cb51-884f-4f34-aa77-820c12276c95" readOnly={readOnly} />
      </FormItem>

      <FormItem name="label" label="Label">
        <Input readOnly={readOnly} />
      </FormItem>

      <FormItem name="readOnly" label="Read Only" valuePropName="checked">
        <Checkbox disabled={readOnly} />
      </FormItem>

      <Form.Item name="hideLabel" label="Hide Label" valuePropName="checked">
        <Checkbox disabled={readOnly} />
      </Form.Item>

      <FormItem name="uniqueStateId" label="Unique State ID" tooltip="Important for accessing the ">
        <Input readOnly={readOnly} />
      </FormItem>

      <FormItem name="formSelectionMode" initialValue={'name'} label="Form selection mode">
        <Select disabled={readOnly}>
          <Option value="name">Name</Option>
          <Option value="dynamic">Dynamic</Option>
        </Select>
      </FormItem>

      {state?.formSelectionMode === 'dynamic' && (
        <>
          <FormItem name="formType" label="Form type">
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
          </FormItem>
        </>
      )}

      {(!state?.formSelectionMode || state?.formSelectionMode === 'name') && (
        <>
          <FormItem name="formId" label="Form">
            <FormAutocomplete readOnly={readOnly} convertToFullId={true} />
          </FormItem>

          <SectionSeparator title="Data" />

          <FormItem
            name="dataSource"
            initialValue={'form'}
            label="Data source"
            tooltip="The list data to be used can be the data that comes with the form of can be fetched from the API"
          >
            <Select disabled={readOnly}>
              <Option value="form">form</Option>
              <Option value="api">api</Option>
            </Select>
          </FormItem>

          <Show when={state?.dataSource === 'api'}>
            <FormItem
              name="apiMode"
              initialValue={'entityType'}
              label="API Mode"
              tooltip="The API mode to use to fetch data"
            >
              <Select disabled={readOnly}>
                <Option value="entityName">entityName</Option>
                <Option value="url">url</Option>
              </Select>
            </FormItem>

            <Show when={state?.apiMode === 'entityName'}>
              <FormItem name="entityType" label="Entity type">
                <AutocompleteRaw
                  dataSourceType="url"
                  dataSourceUrl="/api/services/app/Metadata/TypeAutocomplete"
                  readOnly={readOnly}
                />
              </FormItem>
            </Show>

            <Show when={Boolean(state?.entityType)}>
              <FormItem name="properties" label="Properties">
                <CodeEditor
                  readOnly={readOnly}
                  mode="inline"
                  setOptions={{ minLines: 15, maxLines: 500, fixedWidthGutter: true }}
                  name="properties"
                  type={''}
                  id={''}
                  language="graphqlschema"
                  label="Query Params"
                  description="Properties in GraphQL-like syntax"
                />
              </FormItem>
            </Show>

            <FormItem
              label="Query Params"
              name="queryParams"
              tooltip="The code that returns the query parameters to be used to fetch the data. Ideally this should be a function that returns an object with the entity id"
            >
              <CodeEditor
                readOnly={readOnly}
                mode="dialog"
                setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
                name="getUrl"
                type={''}
                id={''}
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
            </FormItem>

            <SectionSeparator
              title="URLs"
              tooltip="These settings are not mandatory except if you do not want to use the default URL, which is dependent on the Entity"
            />

            <Show when={state?.apiMode === 'url'}>
              <FormItem
                label="GET Url"
                name="getUrl"
                tooltip="The API url that will be used to fetch the data. Write the code that returns the string"
              >
                <CodeEditor
                  readOnly={readOnly}
                  mode="dialog"
                  setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
                  name="getUrl"
                  type={''}
                  id={''}
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
              </FormItem>
            </Show>

            <FormItem
              label="POST Url"
              name="postUrl"
              tooltip="The API url that will be used to update data. Write the code that returns the string"
            >
              <CodeEditor
                readOnly={readOnly}
                mode="dialog"
                setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
                name="postUrl"
                label="POST Url"
                type={''}
                id={''}
                description="he API url that will be used to update data. Write the code that returns the string"
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

            <FormItem
              label="PUT Url"
              name="putUrl"
              tooltip="The API url that will be used to update data. Write the code that returns the string"
            >
              <CodeEditor
                readOnly={readOnly}
                mode="dialog"
                setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
                name="putUrl"
                label="PUT Url"
                type={''}
                id={''}
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
            </FormItem>
          </Show>
        </>
      )}
      <SectionSeparator title="Actions" />

      <FormItem
        label="On Submit"
        name="beforeGet"
        tooltip="Triggered before retrieving the sub-form object from the back-end"
      >
        <CodeEditor
          readOnly={readOnly}
          mode="dialog"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          name="beforeGet"
          label="On Submit"
          type={''}
          id={''}
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
      </FormItem>

      <FormItem
        label="On Created"
        name="onCreated"
        tooltip="Triggered after successfully creating a new sub-form object in the back-end"
      >
        <CodeEditor
          readOnly={readOnly}
          mode="dialog"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          name="onCreated"
          label="On Created"
          type={''}
          id={''}
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
      </FormItem>

      <FormItem
        label="On Updated"
        name="onUpdated"
        tooltip="Triggered after successfully creating a new sub-form object in the back-end"
      >
        <CodeEditor
          readOnly={readOnly}
          mode="dialog"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          name="onUpdated"
          label="On Updated"
          type={''}
          id={''}
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
      </FormItem>

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

      <FormItem
        label="Custom Visibility"
        name="customVisibility"
        tooltip={
          'Enter custom visibility code.  You must return true to show the component. ' +
          'The global variable data is provided, and allows you to access the data of any form component, by using its API key.'
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
          description={
            'Enter custom visibility code.  You must return true to show the component. ' +
            'The global variable data is provided, and allows you to access the data of any form component, by using its API key.'
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
      </FormItem>
    </Form>
  );
};
