import { DesignerToolbarSettings } from "@/index";
import { nanoid } from "@/utils/uuid";
import { FormLayout } from "antd/lib/form/Form";

export const getSettings = (data?: any) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const dataTabId = nanoid();
  const appearanceTabId = nanoid();
  const securityTabId = nanoid();
  const visibilityTabId = nanoid();
  
  const dataContainerId = nanoid();
  const formContainerId = nanoid();
  const actionContainerId = nanoid();
  const dataComponentsContainerId = nanoid();
  const formComponentsContainerId = nanoid();

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
            id: commonTabId,
            key: 'common',
            title: 'Common',
            components: [...new DesignerToolbarSettings()
      .addSettingsInput({
        id: nanoid(),
        propertyName: "columnType",
        parentId: commonTabId,
        label: "Type",
        inputType: "dropdown",
        validate: {
          required: true
        },
        dropdownOptions: [
          {
            label: "Action",
            value: "action"
          },
          {
            label: "CRUD Operations",
            value: "crud-operations"
          },
          {
            label: "Data",
            value: "data"
          },
          {
            label: "Form",
            value: "form"
          }
        ]
      })
      .addContainer({
        id: dataContainerId,
        propertyName: "dataContainer",
        parentId: commonTabId,
        label: "Data Container",
        hidden: { _code: 'return getSettingValue(data?.columnType) !== "data";', _mode: 'code', _value: false },
        direction: "vertical",
        components: [
          ...new DesignerToolbarSettings()
            .addSettingsInput({
              id: nanoid(),
              propertyName: "propertyName",
              parentId: dataContainerId,
              label: "Property Name",
              inputType: "propertyAutocomplete"
            })
            .toJson()
        ]
      })
      .addContainer({
        id: formContainerId,
        propertyName: "dataContainerp",
        parentId: commonTabId,
        label: "Form Container",
        hidden: { _code: 'return getSettingValue(data?.columnType) !== "form";', _mode: 'code', _value: false },
        direction: "vertical",
        components: [
          ...new DesignerToolbarSettings()
            .addSettingsInput({
              id: nanoid(),
              propertyName: "propertiesNames",
              parentId: formContainerId,
              label: "Properties to fetch",
              inputType: "propertyAutocomplete",
              mode: "multiple"
            })
            .toJson()
        ]
      })
      .addSettingsInput({
        id: nanoid(),
        propertyName: "caption",
        parentId: commonTabId,
        label: "Caption",
        inputType: "text"
      })
      .addSettingsInput({
        id: nanoid(),
        propertyName: "description",
        parentId: commonTabId,
        label: "Tooltip Description",
        inputType: "textArea"
      })
      .addContainer({
        id: actionContainerId,
        propertyName: "cntButton",
        parentId: commonTabId,
        label: "Action Container",
        hidden: { _code: 'return getSettingValue(data?.columnType) !== "action";', _mode: 'code', _value: false },
        direction: "vertical",
        components: [
          ...new DesignerToolbarSettings()
            .addSettingsInput({
              id: nanoid(),
              propertyName: "icon",
              parentId: actionContainerId,
              label: "Icon",
              inputType: "iconPicker"
            })
            .addConfigurableActionConfigurator({
              id: nanoid(),
              propertyName: "actionConfiguration",
              parentId: actionContainerId,
              label: "Action Configuration",
            })
            .toJson()
        ]
      })
      .toJson()
          ]
          },
          {
            id: dataTabId,
            key: 'data',
            title: 'Data',
            components: [...new DesignerToolbarSettings()
              .addContainer({
                id: dataComponentsContainerId,
                propertyName: "container3",
                parentId: dataTabId,
                label: "Data Components",
                hidden: { _code: 'return getSettingValue(data?.columnType) !== "data";', _mode: 'code', _value: false },
                direction: "vertical",
                components: []
              })
              .addContainer({
                id: formComponentsContainerId,
                propertyName: "container3fp",
                parentId: dataTabId,
                label: "Form Components",
                hidden: { _code: 'return getSettingValue(data?.columnType) !== "form";', _mode: 'code', _value: false },
                direction: "vertical",
                components: [
                  ...new DesignerToolbarSettings()
                    .addSettingsInput({
                      id: nanoid(),
                      propertyName: "displayFormId",
                      parentId: formComponentsContainerId,
                      label: "Display form",
                      inputType: "formAutocomplete"
                    })
                    .addSettingsInput({
                      id: nanoid(),
                      propertyName: "createFormId",
                      parentId: formComponentsContainerId,
                      label: "Create form",
                      inputType: "formAutocomplete"
                    })
                    .addSettingsInput({
                      id: nanoid(),
                      propertyName: "editFormId",
                      parentId: formComponentsContainerId,
                      label: "Edit form",
                      inputType: "formAutocomplete"
                    })
                    .toJson()
                ]
              })
              .addSettingsInput({
                id: nanoid(),
                propertyName: "allowSorting",
                parentId: dataTabId,
                label: "Allow sorting",
                inputType: "switch",
                hidden: { _code: 'return getSettingValue(data?.columnType) !== "data";', _mode: 'code', _value: false }
              })
              .toJson()
            ]
          },
          {
            id: appearanceTabId,
            key: 'appearance',
            title: 'Appearance',
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                id: nanoid(),
                propertyName: "minWidth",
                parentId: appearanceTabId,
                label: "Min Width",
                inputType: "number"
              })
              .addSettingsInput({
                id: nanoid(),
                propertyName: "maxWidth",
                parentId: appearanceTabId,
                label: "Max Width",
                inputType: "number"
              })
              .addSettingsInput({
                id: nanoid(),
                propertyName: "minHeight",
                parentId: appearanceTabId,
                label: "Min Height",
                inputType: "number",
                hidden: { _code: 'return getSettingValue(data?.columnType) !== "form";', _mode: 'code', _value: false }
              })
              .addSettingsInput({
                id: nanoid(),
                propertyName: "isVisible",
                parentId: appearanceTabId,
                label: "Is Visible",
                inputType: "switch"
              })
              .addSettingsInput({
                id: nanoid(),
                propertyName: "anchored",
                parentId: appearanceTabId,
                label: "Anchored",
                inputType: "dropdown",
                dropdownOptions: [
                  {
                    label: "Left",
                    value: "left"
                  },
                  {
                    label: "Right",
                    value: "right"
                  }
                ],
                allowClear: true
              })
              .addColorPicker({
                id: nanoid(),
                propertyName: "backgroundColor",
                parentId: appearanceTabId,
                label: "Background color",
                allowClear: true,
                showText: true,
              })
              .toJson()
            ]
          },
          {
            id: visibilityTabId,
            key: 'visibility',
            title: 'Visibility',
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                id: nanoid(),
                propertyName: "customVisibility",
                parentId: visibilityTabId,
                label: "Custom Visibility",
                inputType: "codeEditor",
                description: "Enter custom visibility code. You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key.",
                exposedVariables: [
                  `{
                    name: "globalState",
                    description: "The global state of the application",
                    type: "object"
                  }`,
                  `{
                    name: "data",
                    description: "Selected form values",
                    type: "object"
                  }`
                ],
                language: "typescript",
                wrapInTemplate: true,
                templateSettings: {
                  functionName: "customVisibility"
                },
                availableConstantsExpression: "return metadataBuilder.object(\"constants\").addStandard([\"shesha:formData\", \"shesha:globalState\"]).build();"
              })
              .toJson()
            ]
          },
          {
            id: securityTabId,
            key: 'security',
            title: 'Security',
            components: [...new DesignerToolbarSettings()
              .addPermissionAutocomplete({
                id: nanoid(),
                propertyName: "permissions",
                parentId: securityTabId,
                label: "Permissions",
              })
              .toJson()
            ]
          }
        ]
      })
      .toJson(),
    formSettings: {
      isSettingsForm: true,
      layout: "horizontal" as FormLayout,
      colon: true,
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
      access: null,
      permissions: null,
      version: 6,
      dataLoaderType: "gql",
      dataSubmitterType: "gql",
      onBeforeDataLoad: "form.setFieldsValue({...form.formArguments});",
      onAfterDataLoad: null,
      onPrepareSubmitData: null,
      onBeforeSubmit: null,
      onSubmitSuccess: null,
      onSubmitFailed: null,
      dataSubmittersSettings: {
        gql: {
          endpointType: "default",
          dynamicEndpoint: "return data?.id ? form.defaultApiEndpoints.update : form.defaultApiEndpoints.create"
        }
      },
      dataLoadersSettings: {
        gql: {
          endpointType: "default"
        },
        custom: {}
      }
    }
  };
};