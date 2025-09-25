import { DesignerToolbarSettings } from "@/index";
import { nanoid } from '@/utils/uuid';
import { FormLayout } from "antd/es/form/Form";
import { backgroundTypeOptions, positionOptions, repeatOptions, sizeOptions } from "../_settings/utils/background/utils";
import { getBorderInputs, getCornerInputs } from "../_settings/utils/border/utils";

export const getSettings = (data: any) => {
  const commonTabId = nanoid();
  const dataTabId = nanoid();
  const appearanceTabId = nanoid();
  const eventsTabId = nanoid();
  const securityTabId = nanoid();
  const styleRouterId = nanoid();
  const containerStylePnlId = nanoid();
  const containerDimensionsStylePnlId = nanoid();

  const ROW_SAVE_EXPOSED_VARIABLES = [
    {
      id: nanoid(),
      name: 'data',
      description: 'Current row data',
      type: 'object',
    },
    {
      id: nanoid(),
      name: 'formData',
      description: 'Form values',
      type: 'object',
    },
    {
      id: nanoid(),
      name: 'globalState',
      description: 'The global state of the application',
      type: 'object',
    },
    {
      id: nanoid(),
      name: 'http',
      description: 'axios instance used to make http requests',
      type: 'object',
    },
    {
      id: nanoid(),
      name: 'moment',
      description: 'The moment.js object',
      type: 'object',
    },
  ].map((item) => JSON.stringify(item));

  return {
    components: new DesignerToolbarSettings(data)
      .addSearchableTabs({
        id: nanoid(),
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
              .addSettingsInput({
                id: nanoid(),
                inputType: 'textField',
                propertyName: "componentName",
                parentId: commonTabId,
                label: "Component Name",
                validate: {
                  required: true,
                },
                jsSetting: false,
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'switch',
                propertyName: "hidden",
                parentId: commonTabId,
                label: "Hide",
                jsSetting: true,
                value: 'checked',
              })
              .toJson(),
            ],
          },
          {
            key: 'data',
            title: 'Data',
            id: dataTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                id: nanoid(),
                inputType: 'dropdown',
                propertyName: "formSelectionMode",
                parentId: dataTabId,
                label: "Form Selection Mode",
                jsSetting: false,
                dropdownOptions: [
                  { label: 'Name', value: 'name' },
                  { label: 'Dynamic', value: 'view' },
                  { label: 'Expression', value: 'expression' },
                ],
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: dataTabId,
                hidden: {
                  _code: 'return getSettingValue(data?.formSelectionMode) !== "view";',
                  _mode: 'code',
                  _value: false,
                } as any,
                inputs: [
                  {
                    id: nanoid(),
                    propertyName: 'formType',
                    label: 'Form Type',
                    parentId: dataTabId,
                    type: 'formTypeAutocomplete',
                    jsSetting: true,
                    width: '100%',
                    allowClear: true,
                  },
                ],
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: dataTabId,
                hidden: {
                  _code: 'return getSettingValue(data?.formSelectionMode) !== "name";',
                  _mode: 'code',
                  _value: false,
                } as any,
                inputs: [
                  {
                    id: nanoid(),
                    propertyName: 'formId',
                    label: 'Form',
                    tooltip: 'Form to use to display item content',
                    type: 'formAutocomplete',
                    labelAlign: 'right',
                    hidden: false,
                    validate: {
                      required: true,
                    },
                  },
                ],
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: dataTabId,
                hidden: {
                  _code: 'return getSettingValue(data?.formSelectionMode) !== "expression";',
                  _mode: 'code',
                  _value: false,
                } as any,
                inputs: [
                  {
                    id: nanoid(),
                    type: 'codeEditor',
                    propertyName: "formIdExpression",
                    label: "Form Identifier Expression",
                    hidden: { _code: 'return getSettingValue(data?.formSelectionMode) !== "expression";', _mode: 'code', _value: false } as any,
                    jsSetting: false,
                    description: "Enter code to get form identifier. You must return { name: string; module?: string; version?: number; } object. The global variable data is provided, and allows you to access the data of any form component, by using its API key.",
                    exposedVariables: [
                      `{ name: "item", description: "List item", type: "object" }`,
                      `{ name: "data", description: "Selected form values", type: "object" }`,
                      `{ name: "contexts", description: "Contexts data", type: "object" }`,
                      `{ name: "globalState", description: "The global model of the application", type: "object" }`,
                      `{ name: "setGlobalState", description: "Setting the global state of the application", type: "function" }`,
                      `{ name: "formMode", description: "Form mode", type: "object" }`,
                      `{ name: "form", description: "Form instance", type: "object" }`,
                      `{ name: "selectedListItem", description: "Selected list item of nearest table (null if not available)", type: "object" }`,
                      `{ name: "moment", description: "moment", type: "object" }`,
                      `{ name: "http", description: "axiosHttp", type: "object" }`,
                      `{ name: "message", description: "message framework", type: "object" }`,
                    ],
                  },
                ],
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'dropdown',
                propertyName: "selectionMode",
                parentId: dataTabId,
                label: "Selection Mode",
                jsSetting: true,
                dropdownOptions: [
                  { label: 'None', value: 'none' },
                  { label: 'Single', value: 'single' },
                  { label: 'Multiple', value: 'multiple' },
                ],
              })
              .addSettingsInput({
                id: nanoid(),
                propertyName: 'canAddInline',
                label: 'Can Add Inline',
                inputType: 'dropdown',
                parentId: dataTabId,
                jsSetting: true,
                dropdownOptions: [
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                  { value: 'inherit', label: 'Inherit' },
                ],
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: dataTabId,
                hidden: {
                  _code: 'return getSettingValue(data?.canAddInline) === "no" || getSettingValue(data?.formSelectionMode) === "view";',
                  _mode: 'code',
                  _value: false,
                } as any,
                inputs: [
                  {
                    id: nanoid(),
                    propertyName: 'createFormId',
                    label: 'Form',
                    type: 'formAutocomplete',
                    labelAlign: 'right',
                    hidden: false,
                    jsSetting: true,
                    validate: {
                      required: true,
                    },
                  },
                ],
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: dataTabId,
                hidden: {
                  _code: 'return getSettingValue(data?.canAddInline) === "no" || getSettingValue(data?.formSelectionMode) !== "view";',
                  _mode: 'code',
                  _value: false,
                } as any,
                inputs: [
                  {
                    id: nanoid(),
                    propertyName: 'createFormType',
                    label: 'Form Type',
                    type: 'formTypeAutocomplete',
                    jsSetting: true,
                    width: '100%',
                    allowClear: true,
                  },
                ],
              })
              .addSettingsInputRow({
                id: nanoid(),
                hidden: { _code: 'return getSettingValue(data?.canAddInline) === "no";', _mode: 'code', _value: false } as any,
                inputs: [
                  {
                    id: nanoid(),
                    propertyName: 'customCreateUrl',
                    label: 'Custom Create URL',
                    type: 'endpointsAutocomplete',
                    jsSetting: true,
                  },
                ],
              })
              .addSettingsInputRow({
                id: nanoid(),
                hidden: { _code: 'return getSettingValue(data?.canAddInline) === "no";', _mode: 'code', _value: false } as any,
                inputs: [{
                  id: nanoid(),
                  type: 'codeEditor',
                  propertyName: 'onNewListItemInitialize',
                  label: 'New List Item Init',
                  jsSetting: false,
                  tooltip: 'Custom code to initialize new list items with default values or setup logic',
                },
                ],
                hideLabel: true,
              })
              .addSettingsInputRow({
                id: nanoid(),
                hidden: { _code: 'return getSettingValue(data?.canAddInline) === "no";', _mode: 'code', _value: false } as any,
                inputs: [
                  {
                    id: nanoid(),
                    propertyName: 'modalWidth',
                    customTooltip: 'You can use any unit (%, px, em, etc). px by default if without unit',
                    label: 'Dialog Width',
                    parentId: dataTabId,
                    type: 'customDropdown',
                    allowClear: true,
                    jsSetting: true,
                    customDropdownMode: 'single',
                    defaultValue: 'Medium',
                    dropdownOptions: [
                      {
                        label: 'Small',
                        value: '40%',
                      },
                      {
                        label: 'Medium',
                        value: '60%',
                      },
                      {
                        label: 'Large',
                        value: '80%',
                      },
                    ],
                    width: '60%',
                  },
                ],
                hideLabel: true,
              })
              .addSettingsInput({
                id: nanoid(),
                propertyName: 'canEditInline',
                label: 'Can Edit Inline',
                inputType: 'dropdown',
                parentId: dataTabId,
                jsSetting: true,
                dropdownOptions: [
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                  { value: 'inherit', label: 'Inherit' },
                ],
              })
              .addSettingsInputRow({
                parentId: dataTabId,
                id: nanoid(),
                hidden: { _code: 'return getSettingValue(data?.canEditInline) === "no";', _mode: 'code', _value: false } as any,
                inputs: [
                  {
                    id: nanoid(),
                    propertyName: 'inlineEditMode',
                    label: 'Edit Mode',
                    type: 'dropdown',
                    dropdownOptions: [
                      { value: 'all-at-once', label: 'All at Once' },
                      { value: 'one-by-one', label: 'One by One' },
                    ],
                  },
                  {
                    id: nanoid(),
                    propertyName: 'inlineSaveMode',
                    label: 'Save Mode',
                    type: 'dropdown',
                    dropdownOptions: [
                      { value: 'auto', label: 'Auto' },
                      { value: 'manual', label: 'Manual' },
                    ],
                  },
                ],
              })
              .addSettingsInputRow({
                parentId: dataTabId,
                id: nanoid(),
                hidden: { _code: 'return getSettingValue(data?.canEditInline) === "no";', _mode: 'code', _value: false } as any,
                inputs: [
                  {
                    id: nanoid(),
                    propertyName: 'customUpdateUrl',
                    label: 'Custom Update URL',
                    type: 'endpointsAutocomplete',
                    parentId: dataTabId,
                    jsSetting: true,
                  },
                ],
              })
              .addSettingsInput({
                id: nanoid(),
                propertyName: 'canDeleteInline',
                label: 'Can Delete Inline',
                inputType: 'dropdown',
                parentId: dataTabId,
                jsSetting: true,
                dropdownOptions: [
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                  { value: 'inherit', label: 'Inherit' },
                ],
              })
              .addSettingsInputRow({
                id: nanoid(),
                hidden: { _code: 'return getSettingValue(data?.canDeleteInline) === "no";', _mode: 'code', _value: false } as any,
                inputs: [
                  {
                    id: nanoid(),
                    propertyName: 'customDeleteUrl',
                    label: 'Custom Delete URL',
                    type: 'endpointsAutocomplete',
                    parentId: dataTabId,
                    jsSetting: true,
                  },
                ],
              }).toJson(),
            ],
          },
          {
            key: 'events',
            title: 'Events',
            id: eventsTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInputRow({
                id: nanoid(),
                inputs: [{
                  id: nanoid(),
                  type: 'codeEditor',
                  propertyName: 'onListItemSave',
                  label: 'On List Item Save',
                  jsSetting: false,
                  tooltip: 'Custom business logic executed when saving list items (validation, calculations, etc.)',
                },
                ],
                hideLabel: true,
              })
              .addConfigurableActionConfigurator({
                id: nanoid(),
                propertyName: "dblClickActionConfiguration",
                parentId: eventsTabId,
                label: "On Double-Click",
                jsSetting: false,
              })
              .addConfigurableActionConfigurator({
                id: nanoid(),
                propertyName: 'onListItemSaveSuccessAction',
                label: 'On List Item Save Success',
                hideLabel: true,
                description: 'Custom Action configuration executed when saving list items (validation, calculations, etc.)',
              })
              .addSettingsInput({
                id: nanoid(),
                propertyName: 'onRowSave',
                label: 'On Row Save',
                inputType: 'codeEditor',
                parentId: eventsTabId,
                tooltip: 'Custom business logic to be executed on saving of new/updated row (e.g. custom validation / calculations). This handler should return an object or a Promise<object>.',
                hidden: { _code: 'return getSettingValue(data?.canAddInline) === "no" && getSettingValue(data?.canEditInline) === "no";', _mode: 'code', _value: false } as any,
                description: 'Allows custom business logic to be executed on saving of new/updated row (e.g. custom validation / calculations).',
                exposedVariables: ROW_SAVE_EXPOSED_VARIABLES,
              })
              .addConfigurableActionConfigurator({
                id: nanoid(),
                propertyName: 'onRowDeleteSuccessAction',
                label: 'On List Item Delete Success',
                description: 'Custom business logic to be executed after successfull deletion of a list item.',
                hideLabel: true,
              })
              .toJson(),
            ],
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
                  _code: "    return contexts.canvasContext?.designerDevice || 'desktop';",
                  _value: "",
                },
                components: [
                  ...new DesignerToolbarSettings()
                    .addCollapsiblePanel({
                      id: nanoid(),
                      propertyName: 'pnlDimensions',
                      label: 'Dimensions',
                      parentId: styleRouterId,
                      labelAlign: 'right',
                      ghost: true,
                      collapsible: 'header',
                      content: {
                        id: nanoid(),
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInputRow({
                            id: nanoid(),
                            parentId: styleRouterId,
                            inline: true,
                            inputs: [
                              {
                                type: 'textField',
                                id: nanoid(),
                                label: "Width",
                                width: 85,
                                propertyName: "dimensions.width",
                                icon: "widthIcon",
                                tooltip: "You can use any unit (%, px, em, etc). px by default if without unit",

                              },
                              {
                                type: 'textField',
                                id: nanoid(),
                                label: "Min Width",
                                width: 85,
                                hideLabel: true,
                                propertyName: "dimensions.minWidth",
                                icon: "minWidthIcon",
                              },
                              {
                                type: 'textField',
                                id: nanoid(),
                                label: "Max Width",
                                width: 85,
                                hideLabel: true,
                                propertyName: "dimensions.maxWidth",
                                icon: "maxWidthIcon",
                              },
                            ],
                          })
                          .addSettingsInputRow({
                            id: nanoid(),
                            parentId: styleRouterId,
                            inline: true,
                            inputs: [
                              {
                                type: 'textField',
                                id: nanoid(),
                                label: "Height",
                                width: 85,
                                propertyName: "dimensions.height",
                                icon: "heightIcon",
                                tooltip: "You can use any unit (%, px, em, etc). px by default if without unit",
                              },
                              {
                                type: 'textField',
                                id: nanoid(),
                                label: "Min Height",
                                width: 85,
                                hideLabel: true,
                                propertyName: "dimensions.minHeight",
                                icon: "minHeightIcon",
                              },
                              {
                                type: 'textField',
                                id: nanoid(),
                                label: "Max Height",
                                width: 85,
                                hideLabel: true,
                                propertyName: "dimensions.maxHeight",
                                icon: "maxHeightIcon",
                              },
                            ],
                          })
                          .toJson(),
                        ],
                      },
                    })
                    .addCollapsiblePanel({
                      id: nanoid(),
                      propertyName: 'pnlBorderStyle',
                      label: 'Border',
                      labelAlign: 'right',
                      ghost: true,
                      parentId: styleRouterId,
                      collapsible: 'header',
                      content: {
                        id: nanoid(),
                        components: [...new DesignerToolbarSettings()

                          .addContainer({
                            id: nanoid(),
                            parentId: styleRouterId,
                            components: getBorderInputs() as any,
                          })
                          .addContainer({
                            id: nanoid(),
                            parentId: styleRouterId,
                            components: getCornerInputs() as any,
                          })
                          .toJson(),
                        ],
                      },
                    })
                    .addCollapsiblePanel({
                      id: nanoid(),
                      propertyName: 'pnlBackgroundStyle',
                      label: 'Background',
                      labelAlign: 'right',
                      ghost: true,
                      parentId: styleRouterId,
                      collapsible: 'header',
                      content: {
                        id: nanoid(),
                        components: [
                          ...new DesignerToolbarSettings()
                            .addSettingsInput({
                              id: nanoid(),
                              parentId: styleRouterId,
                              label: "Type",
                              jsSetting: false,
                              propertyName: "background.type",
                              inputType: "radio",
                              tooltip: "Select a type of background",
                              buttonGroupOptions: backgroundTypeOptions,
                            })
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: styleRouterId,
                              inputs: [{
                                type: 'colorPicker',
                                id: nanoid(),
                                label: "Color",
                                propertyName: "background.color",
                                hideLabel: true,
                                jsSetting: false,
                              }],
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "color";', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: styleRouterId,
                              inputs: [{
                                type: 'multiColorPicker',
                                id: nanoid(),
                                propertyName: "background.gradient.colors",
                                label: "Colors",
                                jsSetting: false,
                              },
                              ],
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "gradient";', _mode: 'code', _value: false } as any,
                              hideLabel: true,
                            })
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: styleRouterId,
                              inputs: [{
                                type: 'textField',
                                id: nanoid(),
                                propertyName: "background.url",
                                jsSetting: false,
                                label: "URL",
                              }],
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "url";', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: styleRouterId,
                              inputs: [{
                                type: 'imageUploader',
                                id: nanoid(),
                                propertyName: 'background.uploadFile',
                                label: "Image",
                                jsSetting: false,
                              }],
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "image";', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: styleRouterId,
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "storedFile";', _mode: 'code', _value: false } as any,
                              inputs: [
                                {
                                  type: 'textField',
                                  id: nanoid(),
                                  jsSetting: false,
                                  propertyName: "background.storedFile.id",
                                  label: "File ID",
                                },
                              ],
                            })
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: styleRouterId,
                              inline: true,
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                              inputs: [
                                {
                                  type: 'customDropdown',
                                  id: nanoid(),
                                  label: "Size",
                                  hideLabel: true,
                                  propertyName: "background.size",
                                  customTooltip: 'Size of the background image, two space separated values with units e.g "100% 100px"',
                                  dropdownOptions: sizeOptions,
                                  hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                                },
                                {
                                  type: 'customDropdown',
                                  id: nanoid(),
                                  label: "Position",
                                  hideLabel: true,
                                  customTooltip: 'Position of the background image, two space separated values with units e.g "5em 100px"',
                                  propertyName: "background.position",
                                  dropdownOptions: positionOptions,
                                },
                              ],
                            })
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: styleRouterId,
                              inputs: [{
                                type: 'radio',
                                id: nanoid(),
                                label: 'Repeat',
                                hideLabel: true,
                                propertyName: 'background.repeat',
                                inputType: 'radio',
                                buttonGroupOptions: repeatOptions,
                              }],
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                            })
                            .toJson(),
                        ],
                      },
                    })
                    .addCollapsiblePanel({
                      id: nanoid(),
                      propertyName: 'pnlShadowStyle',
                      label: 'Shadow',
                      labelAlign: 'right',
                      ghost: true,
                      parentId: styleRouterId,
                      collapsible: 'header',
                      content: {
                        id: nanoid(),
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInputRow({
                            id: nanoid(),
                            parentId: styleRouterId,
                            inline: true,
                            inputs: [
                              {
                                type: 'numberField',
                                id: nanoid(),
                                label: 'Offset X',
                                hideLabel: true,
                                tooltip: 'Offset X',
                                width: 80,
                                icon: "offsetHorizontalIcon",
                                propertyName: 'shadow.offsetX',
                              },
                              {
                                type: 'numberField',
                                id: nanoid(),
                                label: 'Offset Y',
                                hideLabel: true,
                                tooltip: 'Offset Y',
                                width: 80,
                                icon: 'offsetVerticalIcon',
                                propertyName: 'shadow.offsetY',
                              },
                              {
                                type: 'numberField',
                                id: nanoid(),
                                label: 'Blur',
                                hideLabel: true,
                                tooltip: 'Blur Radius',
                                width: 80,
                                icon: 'blurIcon',
                                propertyName: 'shadow.blurRadius',
                              },
                              {
                                type: 'numberField',
                                id: nanoid(),
                                label: 'Spread',
                                hideLabel: true,
                                tooltip: 'Spread Radius',
                                width: 80,
                                icon: 'spreadIcon',
                                propertyName: 'shadow.spreadRadius',
                              },
                              {
                                type: 'colorPicker',
                                id: nanoid(),
                                label: 'Color',
                                hideLabel: true,
                                propertyName: 'shadow.color',
                              },
                            ],
                          })
                          .toJson(),
                        ],
                      },
                    })
                    .addCollapsiblePanel({
                      id: nanoid(),
                      propertyName: 'stylingBox',
                      label: 'Margin & Padding',
                      labelAlign: 'right',
                      ghost: true,
                      collapsible: 'header',
                      content: {
                        id: nanoid(),
                        components: [...new DesignerToolbarSettings()
                          .addStyleBox({
                            id: nanoid(),
                            label: 'Margin Padding',
                            hideLabel: true,
                            propertyName: 'stylingBox',
                          })
                          .toJson(),
                        ],
                      },
                    })
                    .addCollapsiblePanel({
                      id: nanoid(),
                      propertyName: 'customStyle',
                      label: 'Custom Styles',
                      labelAlign: 'right',
                      ghost: true,
                      parentId: styleRouterId,
                      collapsible: 'header',
                      content: {
                        id: nanoid(),
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInput({
                            id: nanoid(),
                            inputType: 'codeEditor',
                            propertyName: 'style',
                            hideLabel: false,
                            label: 'Style',
                            description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                          })
                          .toJson(),
                        ],
                      },
                    })
                    .addCollapsiblePanel({
                      id: nanoid(),
                      propertyName: 'pnlContainerStyle',
                      label: 'Container Styles',
                      labelAlign: 'right',
                      ghost: true,
                      parentId: styleRouterId,
                      collapsible: 'header',
                      content: {
                        id: containerStylePnlId,
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInput({
                            id: nanoid(),
                            inputType: 'dropdown',
                            propertyName: "orientation",
                            parentId: containerStylePnlId,
                            label: "Orientation",
                            jsSetting: true,
                            defaultValue: 'vertical',
                            dropdownOptions: [
                              { label: 'Vertical', value: 'vertical' },
                              { label: 'Horizontal', value: 'horizontal' },
                              { label: 'Wrap', value: 'wrap' },
                            ],
                          })
                          .addSettingsInputRow({
                            id: nanoid(),
                            parentId: containerStylePnlId,
                            inputs: [
                              {
                                id: nanoid(),
                                propertyName: 'gap',
                                label: 'Gap',
                                type: 'numberField',
                                description: 'The gap between the datalist cards.',
                                jsSetting: true,
                              },
                            ],
                          })
                          .addCollapsiblePanel({
                            id: nanoid(),
                            propertyName: 'containerDimensionsPanel',
                            label: 'Dimensions',
                            parentId: styleRouterId,
                            labelAlign: 'right',
                            ghost: true,
                            collapsible: 'header',
                            content: {
                              id: containerDimensionsStylePnlId,
                              components: [...new DesignerToolbarSettings()
                                .addSettingsInputRow({
                                  id: nanoid(),
                                  parentId: containerDimensionsStylePnlId,
                                  inline: true,
                                  // hidden: { _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.orientation) === "vertical";', _mode: 'code', _value: false } as any,
                                  inputs: [
                                    {
                                      type: 'textField',
                                      id: nanoid(),
                                      label: "Width",
                                      width: 85,
                                      propertyName: "container.dimensions.width",
                                      icon: "widthIcon",
                                      tooltip: "You can use any unit (%, px, em, etc). px by default if without unit",
                                      defaultValue: 'auto',
                                    },
                                    {
                                      type: 'textField',
                                      id: nanoid(),
                                      label: "Min Width",
                                      width: 85,
                                      hideLabel: true,
                                      propertyName: "container.dimensions.minWidth",
                                      icon: "minWidthIcon",
                                      defaultValue: 'auto',
                                    },
                                    {
                                      type: 'textField',
                                      id: nanoid(),
                                      label: "Max Width",
                                      width: 85,
                                      hideLabel: true,
                                      propertyName: "container.dimensions.maxWidth",
                                      icon: "maxWidthIcon",
                                      defaultValue: 'auto',
                                    },
                                  ],
                                })
                                .addSettingsInputRow({
                                  id: nanoid(),
                                  parentId: containerDimensionsStylePnlId,
                                  inline: true,
                                  // hidden: { _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.orientation) === "horizontal";', _mode: 'code', _value: false } as any,
                                  inputs: [
                                    {
                                      type: 'textField',
                                      id: nanoid(),
                                      label: "Height",
                                      width: 85,
                                      propertyName: "container.dimensions.height",
                                      icon: "heightIcon",
                                      tooltip: "You can use any unit (%, px, em, etc). px by default if without unit",
                                      defaultValue: 'auto',
                                    },
                                    {
                                      type: 'textField',
                                      id: nanoid(),
                                      label: "Min Height",
                                      width: 85,
                                      hideLabel: true,
                                      propertyName: "container.dimensions.minHeight",
                                      icon: "minHeightIcon",
                                      defaultValue: 'auto',
                                    },
                                    {
                                      type: 'textField',
                                      id: nanoid(),
                                      label: "Max Height",
                                      width: 85,
                                      hideLabel: true,
                                      propertyName: "container.dimensions.maxHeight",
                                      icon: "maxHeightIcon",
                                      defaultValue: 'auto',
                                    },
                                  ],
                                })
                                .toJson(),
                              ],
                            },
                          })
                          .addCollapsiblePanel({
                            id: nanoid(),
                            propertyName: 'containerStylingBoxPanel',
                            label: 'Margin & Padding',
                            labelAlign: 'right',
                            collapsible: 'header',
                            ghost: true,
                            parentId: styleRouterId,
                            content: {
                              id: 'containerStylingBoxPanel',
                              components: [
                                ...new DesignerToolbarSettings()
                                  .addStyleBox({
                                    id: nanoid(),
                                    label: 'Margin Padding',
                                    hideLabel: true,
                                    propertyName: 'container.stylingBox',
                                    parentId: 'containerStylingBoxPanel',
                                  })
                                  .toJson(),
                              ],
                            },
                          })
                          .addCollapsiblePanel({
                            id: nanoid(),
                            propertyName: 'containerCustomStylePanel',
                            label: 'Custom Styles',
                            labelAlign: 'right',
                            ghost: true,
                            parentId: styleRouterId,
                            collapsible: 'header',
                            content: {
                              id: 'containerCustomStylePanel',
                              components: [...new DesignerToolbarSettings()
                                .addSettingsInput({
                                  id: nanoid(),
                                  inputType: 'codeEditor',
                                  propertyName: 'container.style',
                                  hideLabel: false,
                                  label: 'Style',
                                  description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                                  parentId: 'containerCustomStylePanel',
                                })
                                .toJson(),
                              ],
                            },
                          })
                          .toJson()],
                      },
                    })
                    .toJson()],
              })

            // new props
            // to remove

            // .addSettingsInputRow({
            //   id: nanoid(),
            //   inputs: [
            //     {
            //       id: nanoid(),
            //       type: 'textField',
            //       propertyName: "cardMinWidth",
            //       label: "Card Minimum Width",
            //       tooltip: "You can use any unit (%, px, em, etc)",
            //       hidden: { _code: 'return getSettingValue(data?.orientation) !== "wrap";', _mode: 'code', _value: false } as any,
            //       jsSetting: false,
            //     },
            //     {
            //       id: nanoid(),
            //       type: 'textField',
            //       propertyName: "cardMaxWidth",
            //       label: "Card Maximum Width",
            //       tooltip: "You can use any unit (%, px, em, etc)",
            //       hidden: { _code: 'return getSettingValue(data?.orientation) !== "wrap";', _mode: 'code', _value: false } as any,
            //       jsSetting: false,
            //     }
            //   ]
            // })
            // .addSettingsInputRow({
            //   id: nanoid(),
            //   inputs: [
            //     {
            //       id: nanoid(),
            //       type: 'textField',
            //       propertyName: "cardHeight",
            //       label: "Card Height",
            //       tooltip: "You can use any unit (%, px, em, etc)",
            //       hidden: { _code: 'return getSettingValue(data?.orientation) !== "wrap";', _mode: 'code', _value: false } as any,
            //       jsSetting: false,
            //     },
            //     {
            //       id: nanoid(),
            //       type: 'textField',
            //       propertyName: "gap",
            //       label: "Gap",
            //       tooltip: "You can use any unit (%, px, em, etc)",
            //       hidden: { _code: 'return getSettingValue(data?.orientation) !== "wrap";', _mode: 'code', _value: false } as any,
            //       jsSetting: false,
            //     }
            //   ]
            // })
            // .addSettingsInputRow({
            //   id: nanoid(),
            //   inputs: [
            //     {
            //       id: nanoid(),
            //       type: 'switch',
            //       propertyName: 'showBorder',
            //       label: "Show Border",
            //       hidden: { _code: 'return getSettingValue(data?.orientation) !== "wrap";', _mode: 'code', _value: false } as any,
            //       jsSetting: false,
            //     }
            //   ]
            // })


              // legacy
              // .addSettingsInputRow({
              //   id: nanoid(),
              //   inputs: [{
              //     id: nanoid(),
              //     type: 'customDropdown',
              //     propertyName: "listItemWidth",
              //     parentId: appearanceTabId,
              //     label: "List Item Width",
              //     hidden: { _code: 'return getSettingValue(data?.orientation) !== "horizontal";', _mode: 'code', _value: false } as any,
              //     jsSetting: true,
              //     customDropdownMode: 'single',
              //     dropdownOptions: [
              //       { label: '100%', value: '1' },
              //       { label: '50%', value: '0.5' },
              //       { label: '33%', value: '0.33' },
              //       { label: '25%', value: '0.25' },
              //       { label: '(Custom)', value: 'custom' },
              //     ],
              //   }]
              // })
              // .addSettingsInputRow({
              //   id: nanoid(),
              //   hidden: { _code: 'return getSettingValue(data?.orientation) !== "horizontal" || getSettingValue(data?.listItemWidth) !== "custom";', _mode: 'code', _value: false } as any,
              //   inputs: [
              //     {
              //       id: nanoid(),
              //       type: 'numberField',
              //       propertyName: "customListItemWidth",
              //       label: "Custom List Item Width (px)",
              //       jsSetting: false,
              //     }
              //   ]
              // })
              .addCollapsiblePanel({
                id: nanoid(),
                propertyName: 'pnlGroup',
                label: 'Group Styles',
                parentId: appearanceTabId,
                labelAlign: 'right',
                ghost: true,
                collapsible: 'header',
                content: {
                  id: nanoid(),
                  components: [...new DesignerToolbarSettings()
                    .addSettingsInputRow({
                      id: nanoid(),
                      inputs: [{
                        id: nanoid(),
                        type: "switch",
                        propertyName: "collapsible",
                        label: "Collapsible",
                        labelAlign: "right",
                        hidden: false,
                        jsSetting: true,
                      },
                      {
                        id: nanoid(),
                        type: "switch",
                        propertyName: "collapseByDefault",
                        label: "Collapsible By Default",
                        labelAlign: "right",
                        hidden: false,
                        jsSetting: true,
                      }],
                      hideLabel: true,
                    })
                    .addSettingsInputRow({
                      id: nanoid(),
                      inputs: [{
                        id: nanoid(),
                        type: 'codeEditor',
                        propertyName: "groupStyle",
                        parentId: appearanceTabId,
                        label: "Header Style",
                        jsSetting: false,
                        exposedVariables: [
                          { name: "data", description: "Selected form values", type: "object" },
                        ],
                      },
                      ],
                      hideLabel: true,
                    })
                    .toJson(),
                  ],
                },
              })
              .addCollapsiblePanel({
                id: nanoid(),
                parentId: appearanceTabId,
                propertyName: 'datalistEmptyState',
                label: 'Empty State',
                labelAlign: 'right',
                ghost: true,
                collapsible: 'header',
                content: {
                  id: nanoid(),
                  components: [...new DesignerToolbarSettings()
                    .addSettingsInput({
                      id: nanoid(),
                      propertyName: 'noDataIcon',
                      label: 'Icon',
                      inputType: 'iconPicker',
                      jsSetting: true,
                    })
                    .addSettingsInput({
                      id: nanoid(),
                      propertyName: 'noDataText',
                      label: 'Primary Text',
                      inputType: 'textField',
                      jsSetting: true,
                    })
                    .addSettingsInput({
                      id: nanoid(),
                      propertyName: 'noDataSecondaryText',
                      label: 'Secondary Text',
                      inputType: 'textField',
                      jsSetting: true,
                    }).toJson(),
                  ],
                },
              })
              .toJson(),
            ],
          },
          {
            key: 'security',
            title: 'Security',
            id: securityTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                id: nanoid(),
                inputType: 'permissions',
                propertyName: 'permissions',
                label: "Permissions",
                tooltip: "Enter a list of permissions that should be associated with this component",
                jsSetting: true,
              })
              .toJson(),
            ],
          },
        ],
      })
      .toJson(),
    formSettings: {
      colon: false,
      layout: 'vertical' as FormLayout,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    },
  };
};
