import { CodeEditor } from '../codeEditor/codeEditor';
import FormAutocomplete from '@/components/formAutocomplete';
import React, { FC, useState } from 'react';
import ReadOnlyModeSelector from '@/components/editModeSelector/index';
import SectionSeparator from '@/components/sectionSeparator';
import SettingsCollapsiblePanel from '@/designer-components/_settings/settingsCollapsiblePanel';
import SettingsForm, { useSettingsForm } from '@/designer-components/_settings/settingsForm';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import Show from '@/components/show';
import {
  AutoComplete,
  Checkbox,
  Input,
  InputNumber,
  Select
} from 'antd';
import { Autocomplete } from '@/components/autocomplete';
import { ContextPropertyAutocomplete } from '@/designer-components/contextPropertyAutocomplete';
import { ISettingsFormFactoryArgs } from '@/interfaces';
import { ISubFormComponentProps } from '.';
import { useForm } from '@/providers';
import { useFormDesigner } from '@/providers/formDesigner';
import { useAvailableConstantsMetadata } from '@/utils/metadata/useAvailableConstants';
import { SheshaConstants } from '@/utils/metadata/standardProperties';

const Option = Select.Option;

interface ISubFormSettingsState extends ISubFormComponentProps { }

const formTypes = ['Table', 'Create', 'Edit', 'Details', 'Quickview', 'ListItem', 'Picker'];

const SubFormSettings: FC<ISettingsFormFactoryArgs<ISubFormComponentProps>> = ({ readOnly }) => {
  const { values: formData, onValuesChange } = useSettingsForm<ISubFormComponentProps>();

  const designerModelType = useFormDesigner(false)?.formSettings?.modelType;
  const { formSettings } = useForm();

  const [formTypesOptions, setFormTypesOptions] = useState<{ value: string }[]>(
    formTypes.map(i => {
      return { value: i };
    })
  );

  
  const getStyleConstants = useAvailableConstantsMetadata({
    addGlobalConstants: false,
    standardConstants: [
      SheshaConstants.globalState,
      SheshaConstants.formData,
    ]
  });
  const commonUrlsConstants = useAvailableConstantsMetadata({
    addGlobalConstants: true,
    standardConstants: [
      SheshaConstants.globalState,
      SheshaConstants.formData,
    ],
    onBuild: (builder) => {
      builder.addObject("queryParams", "Query parameters", undefined);
    }
  });

  const onCreatedOrUpdatedConstants = useAvailableConstantsMetadata({
    addGlobalConstants: true,
    standardConstants: [
      SheshaConstants.globalState,
      SheshaConstants.message,
      SheshaConstants.formData,
    ],
    onBuild: (builder) => {
      builder.addObject("response", "Submitted data", undefined);
      builder.addFunction("publish", "Event publisher");
    }
  });

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
      </SettingsCollapsiblePanel>
      <SettingsCollapsiblePanel header='Data source'>
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
                    onValuesChange({ apiMode: val, getUrl: null });
                  } else {
                    onValuesChange({ apiMode: val, entityType: null });
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
                    onValuesChange({ entityType: val, properties: null });
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
                  propertyName="properties"
                  value={typeof value === 'string' ? value : value?.join(' ')}
                  onChange={(val) => {
                    onValuesChange({ properties: val });
                  }}
                  language="graphql"
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
              propertyName="getQueryParams"
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
                }
              ]}
              wrapInTemplate={true}
              templateSettings={{
                functionName: 'getQueryParams'
              }}
              availableConstants={commonUrlsConstants}
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
                  propertyName="getUrl"
                  value={value}
                  onChange={(val) => {
                    onValuesChange({ getUrl: val });
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
                  wrapInTemplate={true}
                  templateSettings={{
                    functionName: 'getGetUrl'
                  }}
                  availableConstants={commonUrlsConstants}
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
              wrapInTemplate={true}
              templateSettings={{
                functionName: 'getPostUrl'
              }}
              availableConstants={commonUrlsConstants}
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
              wrapInTemplate={true}
              templateSettings={{
                functionName: 'getPutUrl'
              }}
              availableConstants={commonUrlsConstants}
            />
          </SettingsFormItem>
        </Show>
      </SettingsCollapsiblePanel>
      <SettingsCollapsiblePanel header="Actions">
        <SettingsFormItem
          label="On Created"
          name="onCreated"
          tooltip="Triggered after successfully creating a new sub-form object in the back-end"
        >
          <CodeEditor
            readOnly={readOnly}
            mode="dialog"
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
            wrapInTemplate={true}
            templateSettings={{
              functionName: 'onCreated'
            }}
            availableConstants={onCreatedOrUpdatedConstants}
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
            wrapInTemplate={true}
            templateSettings={{
              functionName: 'onUpdated'
            }}
            availableConstants={onCreatedOrUpdatedConstants}
          />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>
      <SettingsCollapsiblePanel header="Layout">

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
            wrapInTemplate={true}
              templateSettings={{
                functionName: 'getStyle'
              }}
              availableConstants={getStyleConstants}
          />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>
    </>
  );
};

export const SubFormSettingsForm: FC<ISettingsFormFactoryArgs<ISubFormComponentProps>> = (props) => {
  return (
    SettingsForm<ISubFormSettingsState>({ ...props, children: <SubFormSettings {...props} /> })
  );
};