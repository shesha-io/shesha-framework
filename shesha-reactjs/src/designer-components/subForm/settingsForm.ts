import { DesignerToolbarSettings } from '@/index';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';
import { ISubFormComponentProps } from '.';
import { ISettingsFormFactoryArgs } from '@/interfaces';

export const getSettings = (data: any) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const dataSourceTabId = nanoid();
  const actionsTabId = nanoid();
  const layoutTabId = nanoid();
  const securityTabId = nanoid();

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
              .addCollapsiblePanel({
                id: nanoid(),
                propertyName: 'displaySettings',
                parentId: commonTabId,
                label: 'Display',
                labelAlign: "left",
                expandIconPosition: "start",
                ghost: true,
                collapsible: 'header',
                content: {
                  id: nanoid(),
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
                      readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                    })
                    .addLabelConfigurator({
                      id: nanoid(),
                      propertyName: 'hideLabel',
                      label: 'Label',
                      parentId: 's4gmBg31azZC0UjZjpfTm',
                      hideLabel: true,
                  })
                    .addSettingsInput({
                      id: nanoid(),
                      inputType: "editModeSelector", 
                      propertyName: "editMode",
                      parentId: commonTabId,
                      label: "Edit Mode",
                      jsSetting: true,
                      readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                    })
                    .addSettingsInputRow({
                      id: nanoid(),
                      parentId: commonTabId,
                      readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                      inputs: [
                        {
                          type: 'switch',
                          id: nanoid(),
                          propertyName: 'hidden',
                          label: 'Hidden',
                          jsSetting: true,
                        }
                      ]
                    })
                    .addSettingsInput({
                      id: nanoid(),
                      inputType: "textField",
                      propertyName: "uniqueStateId",
                      parentId: commonTabId,
                      label: "Unique State ID",
                      tooltip: "Important for accessing the component state",
                      jsSetting: true,
                      readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                    })
                    .addSettingsInput({
                      id: nanoid(),
                      inputType: "dropdown",
                      propertyName: "formSelectionMode",
                      parentId: commonTabId,
                      label: "Form selection mode",
                      defaultValue: 'name',
                      dropdownOptions: [
                        { label: "Name", value: "name" },
                        { label: "Dynamic", value: "dynamic" }
                      ],
                      readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                    })
                    .addSettingsInputRow({
                      id: nanoid(),
                      parentId: commonTabId,
                      readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                      inputs: [
                        {
                          id: nanoid(),
                          type: "autocomplete",
                          propertyName: "formType",
                          label: "Form type",
                          jsSetting: true,
                          dataSourceType: "entitiesList",
                          dropdownOptions: [
                            { label: "Table", value: "Table" },
                            { label: "Create", value: "Create" },
                            { label: "Edit", value: "Edit" },
                            { label: "Details", value: "Details" },
                            { label: "Quickview", value: "Quickview" },
                            { label: "ListItem", value: "ListItem" },
                            { label: "Picker", value: "Picker" }
                          ]
                        }
                      ],
                      hidden: { _code: 'return getSettingValue(data?.formSelectionMode) !== "dynamic";', _mode: 'code', _value: false } as any,
                    })
                    .addSettingsInputRow({
                      id: nanoid(),
                      parentId: commonTabId,
                      readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
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
                    .toJson()
                  ]
                }
              })
              .toJson()
            ]
          },
          {
            key: 'dataSource',
            title: 'Data source',
            id: dataSourceTabId,
            components: [...new DesignerToolbarSettings()
              .addCollapsiblePanel({
                id: nanoid(),
                propertyName: 'dataSourceSettings',
                parentId: dataSourceTabId,
                label: 'Data source',
                labelAlign: "left",
                expandIconPosition: "start",
                ghost: true,
                collapsible: 'header',
                content: {
                  id: nanoid(),
                  components: [...new DesignerToolbarSettings()
                    .addSettingsInput({
                      id: nanoid(),
                      inputType: "dropdown",
                      propertyName: "dataSource",
                      parentId: dataSourceTabId,
                      label: "Data source",
                      tooltip: "The list data to be used can be the data that comes with the form of can be fetched from the API",
                      defaultValue: 'form',
                      dropdownOptions: [
                        { label: "form", value: "form" },
                        { label: "api", value: "api" }
                      ],
                      readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                    })
                    .addSettingsInputRow({
                      id: nanoid(),
                      parentId: dataSourceTabId,
                      readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                      inputs: [
                        {
                          id: nanoid(),
                          type: "dropdown",
                          propertyName: "apiMode",
                          label: "API Mode",
                          defaultValue: "entityType",
                          tooltip: "The API mode to use to fetch data",
                          dropdownOptions: [
                            { label: "Entity Name", value: "entityName" },
                            { label: "URL", value: "url" }
                          ],
                          jsSetting: true,
                        }
                      ],
                      hidden: { _code: 'return getSettingValue(data?.dataSource) !== "api";', _mode: 'code', _value: false } as any,
                    })
                    .addSettingsInputRow({
                      id: nanoid(),
                      parentId: dataSourceTabId,
                      readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                      inputs: [
                        {
                          id: nanoid(),
                          type: "autocomplete",
                          propertyName: "entityType",
                          label: "Entity type",
                          dataSourceType: "url",
                          dataSourceUrl: "/api/services/app/Metadata/TypeAutocomplete",
                          jsSetting: true,
                        }
                      ],
                      hidden: { _code: 'return getSettingValue(data?.dataSource) !== "api" || getSettingValue(data?.apiMode) !== "entityName";', _mode: 'code', _value: false } as any,
                    })
                    .addSettingsInputRow({
                      id: nanoid(),
                      parentId: dataSourceTabId,
                      readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                      inputs: [
                        {
                          id: nanoid(),
                          type: "codeEditor",
                          propertyName: "properties",
                          label: "Properties",
                          language: "graphql",
                          description: "Properties in GraphQL-like syntax",
                          jsSetting: true,
                        }
                      ],
                      hidden: { _code: 'return !getSettingValue(data?.entityType);', _mode: 'code', _value: false } as any,
                    })
                    .addSettingsInputRow({
                      id: nanoid(),
                      parentId: dataSourceTabId,
                      readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                      inputs: [
                        {
                          id: nanoid(),
                          type: "codeEditor",
                          propertyName: "queryParams",
                          label: "Query Params",
                          tooltip: "The code that returns the query parameters to be used to fetch the data. Ideally this should be a function that returns an object with the entity id",
                          description: "The code that returns the query parameters to be used to fetch the data. Ideally this should be a function that returns an object with the entity id",
                          //exposedVariables: QUERY_PARAMS_EXPOSED_VARIABLES.map(setting => setting.toString()),
                        }
                      ],
                      hidden: { _code: 'return getSettingValue(data?.dataSource) !== "api";', _mode: 'code', _value: false } as any,
                    })
                    .addSettingsInputRow({
                      id: nanoid(),
                      parentId: dataSourceTabId,
                      readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                      inputs: [
                        {
                          id: nanoid(),
                          type: "codeEditor",
                          propertyName: "getUrl",
                          label: "GET Url",
                          tooltip: "The API url that will be used to fetch the data. Write the code that returns the string",
                          description: "The API url that will be used to fetch the data. Write the code that returns the string",
                          //exposedVariables: URL_EXPOSED_VARIABLES.map(setting => setting.toString()),
                        }
                      ],
                      hidden: { _code: 'return getSettingValue(data?.dataSource) !== "api" || getSettingValue(data?.apiMode) !== "url";', _mode: 'code', _value: false } as any,
                    })
                    .addSettingsInputRow({
                      id: nanoid(),
                      parentId: dataSourceTabId,
                      readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                      inputs: [
                        {
                          id: nanoid(),
                          type: "codeEditor",
                          propertyName: "postUrl",
                          label: "POST Url",
                          tooltip: "The API url that will be used to update data. Write the code that returns the string",
                          description: "The API url that will be used to update data. Write the code that returns the string",
                          //exposedVariables: URL_EXPOSED_VARIABLES.map(setting => setting.toString()),
                        }
                      ],
                      hidden: { _code: 'return getSettingValue(data?.dataSource) !== "api";', _mode: 'code', _value: false } as any,
                    })
                    .addSettingsInputRow({
                      id: nanoid(),
                      parentId: dataSourceTabId,
                      readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                      inputs: [
                        {
                          id: nanoid(),
                          type: "codeEditor",
                          propertyName: "putUrl",
                          label: "PUT Url",
                          tooltip: "The API url that will be used to update data. Write the code that returns the string",
                          description: "The API url that will be used to update data. Write the code that returns the string",
                          //exposedVariables: URL_EXPOSED_VARIABLES.map(setting => setting.toString()),
                        }
                      ],
                      hidden: { _code: 'return getSettingValue(data?.dataSource) !== "api";', _mode: 'code', _value: false } as any,
                    })






                    .toJson()
                  ]
                }
              })
              .toJson()
            ]
          },{
            key: 'actions',
            title: 'Actions',
            id: actionsTabId,
            components: [...new DesignerToolbarSettings()
              .addCollapsiblePanel({
                id: nanoid(),
                propertyName: 'actionSettings',
                parentId: actionsTabId,
                label: 'Actions',
                labelAlign: "left",
                expandIconPosition: "start",
                ghost: true,
                collapsible: 'header',
                content: {
                  id: nanoid(),
                  components: [...new DesignerToolbarSettings()
                    .addSettingsInput({
                      id: nanoid(),
                      inputType: "codeEditor",
                      propertyName: "getUrl",
                      parentId: actionsTabId,
                      label: "GET Url",
                      tooltip: "The API url that will be used to fetch the data. Write the code that returns the string",
                      mode: "dialog",
                      description: "The API url that will be used to fetch the data. Write the code that returns the string",
                      hidden: { _code: 'return !(getSettingValue(data?.dataSource) === "api" && getSettingValue(data?.apiMode) === "url");', _mode: 'code', _value: false } as any,
                      readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                    })
                    .addSettingsInput({
                      id: nanoid(),
                      inputType: "codeEditor",
                      propertyName: "postUrl",
                      parentId: actionsTabId,
                      label: "POST Url",
                      tooltip: "The API url that will be used to update data. Write the code that returns the string",
                      mode: "dialog",
                      description: "The API url that will be used to update data. Write the code that returns the string",
                      hidden: { _code: 'return getSettingValue(data?.dataSource) !== "api";', _mode: 'code', _value: false } as any,
                      readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                    })
                    .addSettingsInput({
                      id: nanoid(),
                      inputType: "codeEditor",
                      propertyName: "putUrl",
                      parentId: actionsTabId,
                      label: "PUT Url",
                      tooltip: "The API url that will be used to update data. Write the code that returns the string",
                      mode: "dialog",
                      description: "The API url that will be used to update data. Write the code that returns the string",
                      hidden: { _code: 'return getSettingValue(data?.dataSource) !== "api";', _mode: 'code', _value: false } as any,
                      readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                    })
                    .addSettingsInput({
                      id: nanoid(),
                      inputType: "codeEditor",
                      propertyName: "onCreated",
                      parentId: actionsTabId,
                      label: "On Created",
                      tooltip: "Triggered after successfully creating a new sub-form object in the back-end",
                      mode: "dialog",
                      description: "Triggered after successfully creating a new sub-form object in the back-end",
                      readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                    })
                    .addSettingsInput({
                      id: nanoid(),
                      inputType: "codeEditor",
                      propertyName: "onUpdated",
                      parentId: actionsTabId,
                      label: "On Updated",
                      tooltip: "Triggered after successfully updating the sub-form object in the back-end",
                      mode: "dialog",
                      description: "Triggered after successfully updating the sub-form object in the back-end",
                      readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                    })
                    .toJson()
                  ]
                }
              })
              .toJson()
            ]
          },
          {
            key: 'layout',
            title: 'Layout',
            id: layoutTabId,
            components: [...new DesignerToolbarSettings()
              .addCollapsiblePanel({
                id: nanoid(),
                propertyName: 'layoutSettings',
                parentId: layoutTabId,
                label: 'Layout',
                labelAlign: "left",
                expandIconPosition: "start",
                ghost: true,
                collapsible: 'header',
                content: {
                  id: nanoid(),
                  components: [...new DesignerToolbarSettings()
                    .addSettingsInput({
                      id: nanoid(),
                      inputType: "numberField",
                      propertyName: "labelCol",
                      parentId: layoutTabId,
                      label: "Label Col",
                      jsSetting: true,
                      min: 0,
                      max: 24,
                      defaultValue: 8,
                      step: 1,
                      readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                    })
                    .addSettingsInput({
                      id: nanoid(),
                      inputType: "numberField",
                      propertyName: "wrapperCol",
                      parentId: layoutTabId,
                      label: "Wrapper Col",
                      jsSetting: true,
                      min: 0,
                      max: 24,
                      defaultValue: 16,
                      step: 1,
                      readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                    })
                    .addSettingsInput({
                      id: nanoid(),
                      inputType: "codeEditor",
                      propertyName: "style",
                      parentId: layoutTabId,
                      label: "Style",
                      mode: "dialog",
                      description: "CSS Style",
                      exposedVariables: [
                        `{
                          id: nanoid(),
                          name: 'data',
                          description: 'Form data',
                          type: 'object',
                        }`,
                      ],
                      readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                    })
                    .toJson()
                  ]
                }
              })
              .toJson()
            ]
          },
          {
            key: 'security',
            title: 'Security',
            id: securityTabId,
            components: [...new DesignerToolbarSettings()
              .addCollapsiblePanel({
                id: nanoid(),
                propertyName: 'securitySettings',
                parentId: securityTabId,
                label: 'Security',
                labelAlign: "left",
                expandIconPosition: "start",
                ghost: true,
                collapsible: 'header',
                content: {
                  id: nanoid(),
                  components: [...new DesignerToolbarSettings()
                    .addSettingsInput({
                      id: nanoid(),
                      inputType: "permissions",
                      propertyName: "permissions",
                      parentId: securityTabId,
                      label: "Permissions",
                      tooltip: "Enter a list of permissions that should be associated with this component",
                      jsSetting: true,
                      readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                    })
                    .toJson()
                  ]
                }
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

export const SubFormSettingsForm = (props: ISettingsFormFactoryArgs<ISubFormComponentProps>) => {
  return getSettings(props.model);
};