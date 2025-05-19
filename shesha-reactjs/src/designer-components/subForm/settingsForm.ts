import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';
import { ISubFormComponentProps } from '.';

export const getSettings = (data: ISubFormComponentProps) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const dataTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();
  const securityTabId = nanoid();
  const styleRouterId = nanoid();

  const formTypes = ['Table', 'Create', 'Edit', 'Details', 'Quickview', 'ListItem', 'Picker'];

  return {
    components: new DesignerToolbarSettings(data)
      .addSearchableTabs({
        id: searchableTabsId,
        propertyName: 'settingsTabs',
        parentId: 'root',
        label: 'Settings',
        hideLabel: true,
        labelAlign: 'right',
        size: 'small',
        tabs: [
          {
            key: 'common',
            title: 'Common',
            id: commonTabId,
            components: [...new DesignerToolbarSettings()
              .addContextPropertyAutocomplete({
                id: nanoid(),
                propertyName: "propertyName",
                parentId: commonTabId,
                label: "Property Name",
                size: "small",
                validate: {
                  required: true
                },
                styledLabel: true,
                jsSetting: true,

              })

              //hide label by default
              .addLabelConfigurator({
                id: nanoid(),
                propertyName: 'hideLabel',
                label: 'Label',
                parentId: 's4gmBg31azZC0UjZjpfTm',
                hideLabel: true,
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: commonTabId,
                inputs: [
                  {
                    id: nanoid(),
                    type: "editModeSelector",
                    propertyName: "editMode",
                    parentId: commonTabId,
                    label: "Edit Mode",
                    jsSetting: true,
                    defaultValue: 'inherited'
                  },
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'hidden',
                    label: 'Hide',
                    jsSetting: true,
                  }
                ]
              })
              .toJson()
            ]
          },
          {
            key: 'data',
            title: 'Data',
            id: dataTabId,
            components: [...new DesignerToolbarSettings()
              // Form Selection Mode - from Main Settings section in map
              .addSettingsInput({
                id: nanoid(),
                inputType: "dropdown",
                propertyName: "formSelectionMode",
                parentId: commonTabId,
                label: "Form Selection Mode",
                tooltip: "Determines how form data is selected and processed",
                defaultValue: 'name',
                dropdownOptions: [
                  { label: "Name", value: "name" },
                  { label: "Dynamic", value: "dynamic" }
                ],
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: commonTabId,
                inputs: [
                  {
                    id: nanoid(),
                    type: "formTypeAutocomplete",
                    propertyName: "formType",
                    label: "Form Type",
                    jsSetting: true,
                    dropdownOptions: formTypes.map(value => ({ label: value, value }))
                  }
                ],
                hidden: { _code: 'return getSettingValue(data?.formSelectionMode) !== "dynamic";', _mode: 'code', _value: false } as any,
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: commonTabId,
                inputs: [
                  {
                    id: nanoid(),
                    type: "formAutocomplete",
                    propertyName: "formId",
                    label: "Form",
                    jsSetting: true
                  }
                ],
                hidden: { _code: 'return getSettingValue(data?.formSelectionMode) === "dynamic";', _mode: 'code', _value: false } as any,
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: "dropdown",
                propertyName: "dataSource",
                parentId: dataTabId,
                label: "Data Source",
                tooltip: "The list data to be used can be the data that comes with the form of can be fetched from the API",
                defaultValue: 'form',
                dropdownOptions: [
                  { label: "Form", value: "form" },
                  { label: "API", value: "api" }
                ],
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: dataTabId,
                inputs: [
                  {
                    id: nanoid(),
                    type: "dropdown",
                    propertyName: "apiMode",
                    label: "API Mode",
                    defaultValue: "entityType",
                    tooltip: "The API mode to use to fetch data",
                    dropdownOptions: [
                      { label: "Entity name", value: "entityName" },
                      { label: "URL", value: "url" }
                    ],
                    jsSetting: true,
                  }
                ],
                hidden: { _code: 'return getSettingValue(data?.dataSource) === "form";', _mode: 'code', _value: false } as any,
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: dataTabId,
                inputs: [
                  {
                    id: nanoid(),
                    type: "autocomplete",
                    propertyName: "entityType",
                    label: "Entity Type",
                    dataSourceType: "url",
                    dataSourceUrl: "/api/services/app/Metadata/TypeAutocomplete",
                    jsSetting: true,
                  }
                ],
                hidden: { _code: 'return getSettingValue(data?.dataSource) === "form" || getSettingValue(data?.apiMode) !== "entityName";', _mode: 'code', _value: false } as any,
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: dataTabId,
                inputs: [
                  {
                    id: nanoid(),
                    type: "codeEditor",
                    propertyName: "properties",
                    label: "Properties",
                    language: "graphql",
                    description: "Properties in GraphQL-like syntax",
                    jsSetting: true,
                    mode: "inline",
                    wrapInTemplate: false,
                  }
                ],
                hidden: { _code: 'return !getSettingValue(data?.entityType);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: dataTabId,
                inputs: [
                  {
                    id: nanoid(),
                    type: "codeEditor",
                    propertyName: "queryParams",
                    label: "Query Params",
                    hidden: { _code: 'return getSettingValue(data?.dataSource) === "form";', _mode: 'code', _value: false } as any,
                    tooltip: "The code that returns the query parameters to be used to fetch the data. Ideally this should be a function that returns an object with the entity id",
                    description: "The code that returns the query parameters to be used to fetch the data. Ideally this should be a function that returns an object with the entity id",
                    exposedVariables: [
                      {
                        name: 'data',
                        description: 'Form data',
                        type: 'object',
                      },
                      {
                        name: 'globalState',
                        description: 'The global state',
                        type: 'object',
                      },
                      {
                        name: 'queryParams',
                        description: 'Query parameters',
                        type: 'object',
                      }
                    ],
                    wrapInTemplate: true,
                    templateSettings: {
                      functionName: 'getQueryParams'
                    },
                  },
                  {
                    id: nanoid(),
                    type: "codeEditor",
                    propertyName: "getUrl",
                    parentId: dataTabId,
                    label: "GET URL",
                    tooltip: "The API URL that will be used to fetch the data. Write the code that returns the string",
                    mode: "dialog",
                    description: "The API URL that will be used to fetch the data. Write the code that returns the string",
                    readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                    hidden: { _code: 'return getSettingValue(data?.dataSource) === "form" || getSettingValue(data?.apiMode) === "entityName";', _mode: 'code', _value: false } as any,
                    exposedVariables: [
                      {
                        name: 'data',
                        description: 'Form data',
                        type: 'object',
                      },
                      {
                        name: 'globalState',
                        description: 'The global state',
                        type: 'object',
                      },
                      {
                        name: 'queryParams',
                        description: 'Query parameters',
                        type: 'object',
                      }
                    ],
                    wrapInTemplate: true,
                    templateSettings: {
                      functionName: 'getGetUrl'
                    },
                  }
                ],
              })

              .addSettingsInputRow({
                id: nanoid(),
                parentId: commonTabId,
                inputs: [
                  {
                    id: nanoid(),
                    hidden: { _code: 'return getSettingValue(data?.dataSource) === "form";', _mode: 'code', _value: false } as any,
                    type: "codeEditor",
                    propertyName: "postUrl",
                    parentId: dataTabId,
                    label: "POST URL",
                    tooltip: "The API URL that will be used to create new data. Write a function that returns this URL as a string.",
                    mode: "dialog",
                    description: "The API URL that will be used to update data. Write the code that returns the string",
                    readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                    exposedVariables: [
                      {
                        name: 'data',
                        description: 'Form data',
                        type: 'object',
                      },
                      {
                        name: 'globalState',
                        description: 'The global state',
                        type: 'object',
                      },
                      {
                        name: 'queryParams',
                        description: 'Query parameters',
                        type: 'object',
                      }
                    ],
                    wrapInTemplate: true,
                    templateSettings: {
                      functionName: 'getPostUrl'
                    },
                  },
                  {
                    id: nanoid(),
                    hidden: { _code: 'return getSettingValue(data?.dataSource) === "form";', _mode: 'code', _value: false } as any,
                    type: "codeEditor",
                    propertyName: "putUrl",
                    parentId: dataTabId,
                    label: "PUT URL",
                    tooltip: "The API URL that will be used to update data. Write the code that returns the string",
                    mode: "dialog",
                    description: "The API URL that will be used to update data. Write the code that returns the string",
                    readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                    exposedVariables: [
                      {
                        name: 'data',
                        description: 'Form data',
                        type: 'object',
                      },
                      {
                        name: 'globalState',
                        description: 'The global state',
                        type: 'object',
                      },
                      {
                        name: 'queryParams',
                        description: 'Query parameters',
                        type: 'object',
                      }
                    ],
                    wrapInTemplate: true,
                    templateSettings: {
                      functionName: 'getPutUrl'
                    },
                  }
                ],
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: "textField",
                propertyName: "uniqueStateId",
                parentId: commonTabId,
                label: "Unique State ID",
                tooltip: "A unique identifier used to maintain component state across sessions. Enable this if you need to preserve the component's state when the page reloads.",
                jsSetting: true,
              })
              .toJson()
            ]
          },
          {
            key: 'events',
            title: 'Events',
            id: eventsTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                id: nanoid(),
                inputType: "codeEditor",
                propertyName: "onCreated",
                parentId: eventsTabId,
                label: "On Created",
                tooltip: "Triggered after successfully creating a new sub-form object in the back-end",
                mode: "dialog",
                description: "Triggered after successfully creating a new sub-form object in the back-end",
                exposedVariables: [
                  {
                    name: 'response',
                    description: 'Submitted data',
                    type: 'object',
                  },
                  {
                    name: 'data',
                    description: 'Form data',
                    type: 'object',
                  },
                  {
                    name: 'globalState',
                    description: 'The global state',
                    type: 'object',
                  },
                  {
                    name: 'message',
                    description: 'Toast message',
                    type: 'object',
                  },
                  {
                    name: 'publish',
                    description: 'Event publisher',
                    type: 'function',
                  }
                ],
                wrapInTemplate: true,
                templateSettings: {
                  functionName: 'onCreated'
                },
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: "codeEditor",
                propertyName: "onUpdated",
                parentId: eventsTabId,
                label: "On Updated",
                tooltip: "Triggered after successfully updating the sub-form object in the back-end",
                mode: "dialog",
                description: "Triggered after successfully updating the sub-form object in the back-end",
                exposedVariables: [
                  {
                    name: 'response',
                    description: 'Submitted data',
                    type: 'object',
                  },
                  {
                    name: 'data',
                    description: 'Form data',
                    type: 'object',
                  },
                  {
                    name: 'globalState',
                    description: 'The global state',
                    type: 'object',
                  },
                  {
                    name: 'message',
                    description: 'Toast message',
                    type: 'object',
                  },
                  {
                    name: 'publish',
                    description: 'Event publisher',
                    type: 'function',
                  }
                ],
                wrapInTemplate: true,
                templateSettings: {
                  functionName: 'onUpdated'
                },
              })
              .toJson()
            ]
          },
          {
            key: 'appearance',
            title: 'Appearance',
            id: appearanceTabId,
            components: [...new DesignerToolbarSettings()
              .addPropertyRouter({
                id: styleRouterId,
                propertyName: 'propertyRouter1',
                componentName: 'propertyRouter',
                label: 'Property router1',
                labelAlign: 'right',
                parentId: appearanceTabId,
                hidden: false,
                propertyRouteName: {
                  _mode: "code",
                  _code: "return contexts.canvasContext?.designerDevice || 'desktop';",
                  _value: ""
                },
                components: [
                  ...new DesignerToolbarSettings()
                    .addCollapsiblePanel({
                      id: nanoid(),
                      propertyName: 'style',
                      label: 'Custom Styles',
                      collapsedByDefault: false,
                      labelAlign: 'right',
                      ghost: true,
                      parentId: styleRouterId,
                      collapsible: 'header',
                      content: {
                        id: nanoid(),
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInputRow({
                            id: nanoid(),
                            parentId: commonTabId,       
                            inputs: [
                              {
                                id: nanoid(),
                                type: "numberField",
                                propertyName: "wrapperCol",
                                parentId: commonTabId,
                                label: "Wrapper Col",
                                jsSetting: true,
                                min: 0,
                                max: 24,
                                defaultValue: 16,
                                step: 1,
                              },
                              {
                                id: nanoid(),
                                type: "numberField",
                                propertyName: "labelCol",
                                parentId: commonTabId,
                                label: "Label Col",
                                jsSetting: true,
                                min: 0,
                                max: 24,
                                defaultValue: 8,
                                step: 1,
                              }
                            ]
                          })
                          .toJson()
                        ]
                      }
                    })
                    .toJson()
                ]
              })
              .toJson()
            ]
          },
          {
            key: 'security',
            title: 'Security',
            id: securityTabId,
            components: [...new DesignerToolbarSettings()
              // Permissions - from Security section in map
              .addSettingsInput({
                id: nanoid(),
                inputType: 'permissions',
                propertyName: 'permissions',
                label: 'Permissions',
                tooltip: "Enter a list of permissions that should be associated with this component",
                parentId: securityTabId,
                jsSetting: true
              })
              .toJson()
            ]
          }
        ]
      })
      .toJson(),
    formSettings: {
      colon: false,
      layout: 'vertical' as FormLayout,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 }
    }
  };
};