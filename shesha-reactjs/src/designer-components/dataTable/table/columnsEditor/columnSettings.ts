import { FormMarkupWithSettings } from "@/index";
import { DesignerToolbarSettings } from "@/interfaces/toolbarSettings";
import { isDefined } from "@/utils/nullables";

export const getColumnSettings = (data?: object): FormMarkupWithSettings => {
  const dataType = isDefined(data) ? data['type'] : undefined;
  return {
    components: new DesignerToolbarSettings()
      .addSearchableTabs({
        id: "searchableTabs1",
        propertyName: "settingsTabs",
        parentId: "root",
        label: "Settings",
        hideLabel: true,
        labelAlign: "right",
        size: "small",
        tabs: [
          {
            key: "common",
            title: "Common",
            id: "commonTab1",
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: "columnType1",
                  inputType: "dropdown",
                  propertyName: "columnType",
                  label: "Type",
                  labelAlign: "right",
                  dropdownOptions: [
                    {
                      label: "Action",
                      value: "action",
                    },
                    {
                      label: "CRUD operations",
                      value: "crud-operations",
                    },
                    {
                      label: "Data",
                      value: "data",
                    },
                    {
                      label: "Form",
                      value: "form",
                    },
                  ],
                  validate: {
                    required: true,
                  },
                })
                .addContainer({
                  id: "dataContainer1",
                  propertyName: "dataContainer",
                  label: "Data Settings",
                  hidden: {
                    _code: "return getSettingValue(data?.columnType) !== 'data';",
                    _mode: "code",
                    _value: false,
                  },
                  components: [
                    ...new DesignerToolbarSettings()
                      .addSettingsInput({
                        id: "propertyName1",
                        inputType: "propertyAutocomplete",
                        propertyName: "propertyName",
                        label: "Property Name",
                        labelAlign: "right",
                      })
                      .toJson(),
                  ],

                })
                .addContainer({
                  id: "formContainer1",
                  propertyName: "formContainer",
                  label: "Form Settings",
                  hidden: {
                    _code: "return getSettingValue(data?.columnType) !== 'form';",
                    _mode: "code",
                    _value: false,
                  },
                  components: [
                    ...new DesignerToolbarSettings()
                      .addSettingsInput({
                        id: "propertiesNames1",
                        inputType: "propertyAutocomplete",
                        propertyName: "propertiesNames",
                        label: "Properties to Fetch",
                        labelAlign: "right",
                        mode: "multiple",
                      }).toJson(),
                  ],

                })
                .addSettingsInputRow({
                  id: "caption-tooltip-row",
                  propertyName: "captionTooltipRow",
                  label: "Caption & Tooltip",
                  labelAlign: "right",
                  inputs: [
                    {
                      id: "caption1",
                      type: "textField",
                      propertyName: "caption",
                      label: "Caption",
                      labelAlign: "right",
                    },
                    {
                      id: "description1",
                      type: "textArea",
                      propertyName: "description",
                      label: "Tooltip",
                      labelAlign: "right",
                      hidden: {
                        _code: "return getSettingValue(data?.columnType) !== 'data';",
                        _mode: "code",
                        _value: false,
                      },
                    },
                  ],

                })
                .addContainer({
                  id: "actionContainer1",
                  propertyName: "actionContainer",
                  label: "Action Settings",
                  hidden: {
                    _code: "return getSettingValue(data?.columnType) !== 'action';",
                    _mode: "code",
                    _value: false,
                  },
                  components: [
                    ...new DesignerToolbarSettings()
                      .addSettingsInput({
                        id: "icon1",
                        inputType: "iconPicker",
                        propertyName: "icon",
                        label: "Icon",
                        labelAlign: "right",
                      })
                      .addConfigurableActionConfigurator({
                        id: "F3B46A95-703F-4465-96CA-A58496A5F78C",
                        propertyName: "actionConfiguration",
                        label: "Action Configuration",
                        hidden: false,
                        validate: {},
                        settingsValidationErrors: [],
                        parentId: "root",
                        version: 1,
                      })
                      .toJson(),
                  ],
                })
                .addContainer({
                  id: "displayContainer1",
                  propertyName: "displayContainer",
                  label: "Display Settings",
                  hidden: {
                    _code: "return getSettingValue(data?.columnType) !== 'data';",
                    _mode: "code",
                    _value: false,
                  },
                  components: [
                    ...new DesignerToolbarSettings()
                      .addSettingsInput({
                        id: "displayComponent1",
                        inputType: "componentSelector",
                        propertyName: "displayComponent",
                        label: "Display Component",
                        componentType: "output",
                        noSelectionItemText: "Default",
                        noSelectionItemValue: "[default]",
                        propertyAccessor: "{{data.propertyName}}",
                        hidden: dataType === 'entityPicker',
                      })
                      .addSettingsInput({
                        id: "editComponent1",
                        inputType: "componentSelector",
                        propertyName: "editComponent",
                        label: "Edit Component",
                        componentType: "input",
                        noSelectionItemText: "Not Editable",
                        noSelectionItemValue: "[not-editable]",
                        propertyAccessor: "{{data.propertyName}}",
                        hidden: dataType === 'entityPicker',
                      })
                      .addSettingsInput({
                        id: "createComponent1",
                        inputType: "componentSelector",
                        propertyName: "createComponent",
                        label: "Create Component",
                        componentType: "input",
                        noSelectionItemText: "Not Editable",
                        noSelectionItemValue: "[not-editable]",
                        propertyAccessor: "{{data.propertyName}}",
                        hidden: dataType === 'entityPicker',
                      })
                      .toJson(),
                  ],

                })
                .addContainer({
                  id: "formDisplayContainer1",
                  propertyName: "formDisplayContainer",
                  label: "Form Display Settings",
                  hidden: {
                    _code: "return getSettingValue(data?.columnType) !== 'form';",
                    _mode: "code",
                    _value: false,
                  },
                  components: [
                    ...new DesignerToolbarSettings()
                      .addSettingsInput({
                        id: "displayFormId1",
                        inputType: "formAutocomplete",
                        propertyName: "displayFormId",
                        label: "Display Form",
                      })
                      .addSettingsInput({
                        id: "createFormId1",
                        inputType: "formAutocomplete",
                        propertyName: "createFormId",
                        label: "Create Form",
                      })
                      .addSettingsInput({
                        id: "editFormId1",
                        inputType: "formAutocomplete",
                        propertyName: "editFormId",
                        label: "Edit Form",

                      })
                      .toJson(),
                  ],

                })
                .addSettingsInputRow({
                  id: "allowSortingContainer1",
                  propertyName: "allowSortingContainer",
                  hidden: {
                    _code: "return getSettingValue(data?.columnType) === 'form';",
                    _mode: "code",
                    _value: false,
                  },
                  labelAlign: "right",
                  inputs: [
                    {
                      id: "anchored1",
                      type: "settingsInput",
                      inputType: "radio",
                      propertyName: "anchored",
                      label: "Anchored",
                      jsSetting: true,
                      buttonGroupOptions: [
                        {
                          title: "Left",
                          value: "left",
                          icon: "LeftOutlined",
                        },
                        {
                          title: "Right",
                          value: "right",
                          icon: "RightOutlined",
                        },
                      ],
                      allowClear: true,
                    },
                    {
                      id: "allowSorting1",
                      type: "settingsInput",
                      inputType: "switch",
                      propertyName: "allowSorting",
                      label: "Allow Sorting",
                      jsSetting: true,
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: "isVisible-anchored-row",
                  propertyName: "isVisibleAnchoredRow",
                  label: "Hide & Anchored",
                  labelAlign: "right",
                  inputs: [
                    {
                      id: "customVisibility1",
                      type: "codeEditor",
                      propertyName: "customVisibility",
                      label: "Custom Visibility",
                      description: "Enter custom visibility code. You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key.",
                      exposedVariables: [
                        {
                          name: "globalState",
                          description: "The global state of the application",
                          type: "object",
                        },
                        {
                          name: "data",
                          description: "Selected form values",
                          type: "object",
                        },
                      ],
                      language: "typescript",
                      wrapInTemplate: true,
                      templateSettings: {
                        functionName: "customVisibility",
                      },
                    },
                    {
                      id: "isVisible1",
                      type: "switch",
                      propertyName: "isVisible",
                      label: "Visible",
                      labelAlign: "right",
                      jsSetting: true,
                    },
                  ],
                })
                .toJson(),
            ],
          },
          {
            key: 'appearance',
            forceRender: true,
            title: 'Appearance',
            id: 'elgrlievlfwehhh848r8hsdnflsdnclurbd',
            components: [...new DesignerToolbarSettings()
              .addCollapsiblePanel({
                id: 'dimensionsStyleCollapsiblePanel',
                propertyName: 'pnlDimensions',
                label: 'Dimensions',
                labelAlign: 'right',
                ghost: true,
                collapsible: 'header',
                content: {
                  id: 'dimensionsStylePnl',
                  components: [...new DesignerToolbarSettings()
                    .addSettingsInputRow({
                      id: 'dimensionsStyleRowWidth',
                      parentId: 'dimensionsStylePnl',
                      inputs: [
                        {
                          id: "minWidth1",
                          type: "numberField",
                          propertyName: "minWidth",
                          label: "Min Width",
                          labelAlign: "right",
                          icon: "minWidthIcon",
                          tooltip: "You can use any unit (%, px, em, etc). px by default if without unit",
                        },
                        {
                          id: "maxWidth1",
                          type: "numberField",
                          propertyName: "maxWidth",
                          label: "Max Width",
                          labelAlign: "right",
                          icon: "maxWidthIcon",
                          tooltip: "You can use any unit (%, px, em, etc). px by default if without unit",
                        },
                      ],
                    })
                    .addSettingsInputRow({
                      id: 'dimensionsStyleRowHeight',
                      parentId: 'dimensionsStylePnl',
                      hidden: {
                        _code: "return getSettingValue(data?.columnType) !== 'form';",
                        _mode: "code",
                        _value: false,
                      },
                      inputs: [
                        {
                          id: "minHeight1",
                          type: "textField",
                          propertyName: "minHeight",
                          label: "Min Height",
                          labelAlign: "right",
                          icon: "heightIcon",
                          tooltip: "You can use any unit (%, px, em, etc). px by default if without unit",
                        },
                      ],
                    })
                    .toJson(),
                  ],
                },
              })
              .addCollapsiblePanel({
                id: 'backgroundStyleCollapsiblePanel',
                propertyName: 'pnlBackgroundStyle',
                label: 'Background',
                labelAlign: 'right',
                ghost: true,
                collapsible: 'header',
                hidden: { _code: 'return  ["text", "link", "ghost"].includes(getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.buttonType));', _mode: 'code', _value: false } as any,
                content: {
                  id: 'backgroundStylePnl',
                  components: [
                    ...new DesignerToolbarSettings()
                      .addSettingsInput(
                        {
                          id: "backgroundColor1",
                          inputType: "colorPicker",
                          propertyName: "backgroundColor",
                          label: "Background Color",
                          allowClear: true,
                          showText: true,
                          jsSetting: true,
                        })
                      .toJson(),
                  ],
                },
              })
              .toJson()],
          },
          {
            key: "security",
            title: "Security",
            id: "securityTab1",
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: "permissions1",
                  inputType: "permissions",
                  propertyName: "permissions",
                  label: "Permissions",
                  jsSetting: true,
                })
                .toJson(),
            ],
          },
        ],
      })
      .toJson(),
    formSettings: {
      isSettingsForm: true,
      layout: "vertical",
      colon: false,
      labelCol: {
        span: 8,
      },
      wrapperCol: {
        span: 16,
      },
    },
  };
};
