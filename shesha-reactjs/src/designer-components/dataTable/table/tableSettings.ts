import { DesignerToolbarSettings } from "@/index";
import { nanoid } from "@/utils/uuid";
import { FormLayout } from "antd/lib/form/Form";
import { ITableComponentProps } from "./models";
import { fontTypes, fontWeightsOptions, textAlignOptions } from '../../_settings/utils/font/utils';
import { getBorderInputs, getCornerInputs } from '../../_settings/utils/border/utils';
import { backgroundTypeOptions, positionOptions, repeatOptions, sizeOptions } from '../../_settings/utils/background/utils';

const NEW_ROW_EXPOSED_VARIABLES = [
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

const ENABLE_CRUD_EXPOSED_VARIABLES = [
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
    name: 'moment',
    description: 'The moment.js object',
    type: 'object',
  },
].map((item) => JSON.stringify(item));

export const getSettings = (data: ITableComponentProps) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const crudTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();
  const securityTabId = nanoid();
  const styleRouterId = nanoid();

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
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'componentName',
                  label: 'Component Name',
                  inputType: 'textField',
                  validate: { required: true },
                  jsSetting: false,
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'editModeSelector',
                      id: nanoid(),
                      propertyName: 'editMode',
                      label: 'Edit Mode',
                      size: 'small',
                      jsSetting: true,
                    },
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'hidden',
                      label: 'Hide',
                      jsSetting: true,
                      layout: 'horizontal',
                    },
                  ],
                })
                .toJson(),
            ],
          },
          {
            key: 'data',
            title: 'Data',
            id: crudTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInputRow({
                  id: nanoid(),
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'items',
                      label: data.readOnly ? 'View Columns' : 'Customize Columns',
                      type: 'columnsConfig',
                      parentId: commonTabId,
                      jsSetting: true,
                    },
                    {
                      id: nanoid(),
                      propertyName: 'showExpandedView',
                      label: 'Show Expanded View',
                      type: 'switch',
                      tooltip: 'Limited to default display components',
                      description: 'Limited to default display components',
                      jsSetting: true,
                      parentId: commonTabId,
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'freezeHeaders',
                      label: 'Freeze Headers',
                      type: 'switch',
                      jsSetting: true,
                      parentId: commonTabId,
                    },
                    {
                      id: nanoid(),
                      propertyName: 'selectionMode',
                      label: 'Selection Mode',
                      type: 'dropdown',
                      jsSetting: true,
                      parentId: commonTabId,
                      tooltip: 'Controls how rows can be selected in the table',
                      dropdownOptions: [
                        { value: 'none', label: 'None' },
                        { value: 'single', label: 'Single' },
                        { value: 'multiple', label: 'Multiple' },
                      ],
                    },
                  ],
                })
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'canEditInline',
                  label: 'Can Edit Inline',
                  inputType: 'dropdown',
                  jsSetting: true,
                  parentId: crudTabId,
                  dropdownOptions: [
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No' },
                    { value: 'inherit', label: 'Inherit' },
                    { value: 'js', label: 'Expression' },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  hidden: { _code: 'return getSettingValue(data?.canEditInline) !== "js";', _mode: 'code', _value: false } as any,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'canEditInlineExpression',
                      label: 'Can Edit Inline Expression',
                      type: 'codeEditor',
                      parentId: crudTabId,
                      description: 'Return true to enable inline editing and false to disable.',
                      exposedVariables: ENABLE_CRUD_EXPOSED_VARIABLES,
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  hidden: { _code: 'return getSettingValue(data?.canEditInline) === "no";', _mode: 'code', _value: false } as any,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'inlineEditMode',
                      label: 'Row Edit Mode',
                      type: 'dropdown',
                      parentId: crudTabId,
                      dropdownOptions: [
                        { value: 'one-by-one', label: 'One by one' },
                        { value: 'all-at-once', label: 'All at once' },
                      ],
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  hidden: { _code: 'return getSettingValue(data?.canEditInline) === "no";', _mode: 'code', _value: false } as any,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'inlineSaveMode',
                      label: 'Save Mode',
                      type: 'dropdown',
                      parentId: crudTabId,
                      dropdownOptions: [
                        { value: 'auto', label: 'Auto' },
                        { value: 'manual', label: 'Manual' },
                      ],
                    },
                  ],
                })

                .addSettingsInputRow({
                  id: nanoid(),
                  hidden: { _code: 'return getSettingValue(data?.canEditInline) === "no";', _mode: 'code', _value: false } as any,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'customUpdateUrl',
                      label: 'Custom Update URL',
                      type: 'endpointsAutocomplete',
                      parentId: crudTabId,
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  hidden: false,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'canAddInline',
                      label: 'Can Add Inline',
                      type: 'dropdown',
                      jsSetting: true,
                      parentId: crudTabId,
                      dropdownOptions: [
                        { value: 'yes', label: 'Yes' },
                        { value: 'no', label: 'No' },
                        { value: 'inherit', label: 'Inherit' },
                        { value: 'js', label: 'Expression' },
                      ],
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  hidden: { _code: 'return getSettingValue(data?.canAddInline) !== "js";', _mode: 'code', _value: false } as any,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'canAddInlineExpression',
                      label: 'Can Add Inline Expression',
                      type: 'codeEditor',
                      parentId: crudTabId,
                      description: 'Return true to enable inline creation of new rows and false to disable.',
                      exposedVariables: ENABLE_CRUD_EXPOSED_VARIABLES,
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  hidden: { _code: 'return getSettingValue(data?.canAddInline) === "no";', _mode: 'code', _value: false } as any,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'newRowCapturePosition',
                      label: 'New Row Capture Position',
                      type: 'dropdown',
                      parentId: crudTabId,
                      dropdownOptions: [
                        { value: 'top', label: 'Top' },
                        { value: 'bottom', label: 'Bottom' },
                      ],
                    },
                  ],
                })

                .addSettingsInputRow({
                  id: nanoid(),
                  hidden: { _code: 'return true;', _mode: 'code', _value: true } as any,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'newRowInsertPosition',
                      label: 'New Row Insert Position',
                      type: 'dropdown',
                      parentId: crudTabId,
                      dropdownOptions: [
                        { value: 'top', label: 'Top' },
                        { value: 'bottom', label: 'Bottom' },
                      ],
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
                      parentId: crudTabId,
                    },
                  ],
                })

                .addSettingsInputRow({
                  id: nanoid(),
                  hidden: { _code: 'return getSettingValue(data?.canAddInline) === "no";', _mode: 'code', _value: false } as any,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'onNewRowInitialize',
                      label: 'New Row Init',
                      type: 'codeEditor',
                      parentId: crudTabId,
                      tooltip: 'Allows configurators to specify logic to initialise the object bound to a new row.',
                      description: 'Specify logic to initialise the object bound to a new row. This handler should return an object or a Promise<object>.',
                      exposedVariables: NEW_ROW_EXPOSED_VARIABLES,
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  hidden: { _code: 'return getSettingValue(data?.canAddInline) === "no" && getSettingValue(data?.canEditInline) === "no";', _mode: 'code', _value: false } as any,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'onRowSave',
                      label: 'On Row Save',
                      type: 'codeEditor',
                      tooltip: 'Custom business logic to be executed on saving of new/updated row (e.g. custom validation / calculations). This handler should return an object or a Promise<object>.',
                      description: 'Allows custom business logic to be executed on saving of new/updated row (e.g. custom validation / calculations).',
                      exposedVariables: ROW_SAVE_EXPOSED_VARIABLES,
                    },
                  ],
                })
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'canDeleteInline',
                  label: 'Can Delete Inline',
                  inputType: 'dropdown',
                  parentId: crudTabId,
                  jsSetting: true,
                  dropdownOptions: [
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No' },
                    { value: 'inherit', label: 'Inherit' },
                    { value: 'js', label: 'Expression' },
                  ],
                })

                .addSettingsInputRow({
                  id: nanoid(),
                  hidden: { _code: 'return getSettingValue(data?.canDeleteInline) !== "js";', _mode: 'code', _value: false } as any,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'canDeleteInlineExpression',
                      label: 'Can Delete Inline Expression',
                      type: 'codeEditor',
                      parentId: crudTabId,
                      description: 'Return true to enable inline deletion and false to disable.',
                      exposedVariables: ENABLE_CRUD_EXPOSED_VARIABLES,
                    },
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
                      parentId: crudTabId,
                    },
                  ],
                })


                .toJson(),
            ],
          },
          {
            key: 'events',
            title: 'Events',
            id: eventsTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addConfigurableActionConfigurator({
                  id: nanoid(),
                  propertyName: 'onRowClick',
                  parentId: eventsTabId,
                  label: 'On Row Click',
                  description: 'Action to execute when a row is clicked',
                })
                .addConfigurableActionConfigurator({
                  id: nanoid(),
                  propertyName: 'onRowDoubleClick',
                  parentId: eventsTabId,
                  label: 'On Row Double-Click',
                  description: 'Action to execute when a row is double-clicked',
                })
                .addConfigurableActionConfigurator({
                  id: nanoid(),
                  propertyName: 'onRowHover',
                  parentId: eventsTabId,
                  label: 'On Row Hover',
                  description: 'Action to execute when hovering over a row',
                })
                .addConfigurableActionConfigurator({
                  id: nanoid(),
                  propertyName: 'onRowSelect',
                  parentId: eventsTabId,
                  label: 'On Row Select',
                  description: 'Action to execute when a row is selected',
                })
                .addConfigurableActionConfigurator({
                  id: nanoid(),
                  propertyName: 'onSelectionChange',
                  parentId: eventsTabId,
                  label: 'On Selection Change',
                  description: 'Action to execute when the selection changes',
                })
                .addConfigurableActionConfigurator({
                  id: nanoid(),
                  propertyName: 'onRowSaveSuccessAction',
                  parentId: eventsTabId,
                  label: 'On Row Save Success',
                  description: 'Custom business logic to be executed after successfull saving of new/updated row.',
                  hideLabel: true,
                })
                .addConfigurableActionConfigurator({
                  id: nanoid(),
                  propertyName: 'onRowDeleteSuccessAction',
                  label: 'On Row Delete Success',
                  parentId: eventsTabId,
                  description: 'Custom business logic to be executed after successfull deletion of a row.',
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
                  _code: "return contexts.canvasContext?.designerDevice || 'desktop';",
                  _value: "",
                },
                components: [
                  ...new DesignerToolbarSettings()
                    .addCollapsiblePanel({
                      id: nanoid(),
                      propertyName: 'pnlFontStyle',
                      label: 'Font',
                      labelAlign: 'right',
                      parentId: styleRouterId,
                      ghost: true,
                      collapsible: 'header',
                      content: {
                        id: nanoid(),
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInputRow({
                            id: nanoid(),
                            parentId: styleRouterId,
                            inline: true,
                            propertyName: 'font',
                            inputs: [
                              {
                                type: 'dropdown',
                                id: nanoid(),
                                label: 'Family',
                                propertyName: 'font.type',
                                hideLabel: true,
                                dropdownOptions: fontTypes,
                              },
                              {
                                type: 'numberField',
                                id: nanoid(),
                                label: 'Size',
                                propertyName: 'font.size',
                                hideLabel: true,
                                width: 50,
                              },
                              {
                                type: 'dropdown',
                                id: nanoid(),
                                label: 'Weight',
                                propertyName: 'font.weight',
                                hideLabel: true,
                                tooltip: "Controls text thickness (light, normal, bold, etc.)",
                                dropdownOptions: fontWeightsOptions,
                                width: 100,
                              },
                              {
                                type: 'colorPicker',
                                id: nanoid(),
                                label: 'Color',
                                hideLabel: true,
                                propertyName: 'font.color',
                              },
                              {
                                type: 'dropdown',
                                id: nanoid(),
                                label: 'Align',
                                propertyName: 'font.align',
                                hideLabel: true,
                                width: 60,
                                dropdownOptions: textAlignOptions,
                              },
                            ],
                          })
                          .toJson(),
                        ],
                      },
                    })
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
                              }],
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
                      propertyName: 'dataTableSpecific',
                      label: 'Table Specific',
                      labelAlign: 'right',
                      ghost: true,
                      parentId: styleRouterId,
                      collapsible: 'header',
                      content: {
                        id: nanoid(),
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInputRow({
                            id: nanoid(),
                            inputs: [
                              {
                                id: nanoid(),
                                propertyName: 'striped',
                                label: 'Striped Rows',
                                type: 'switch',
                                tooltip: 'Enable alternating row colors',
                                jsSetting: true,
                              },
                              {
                                id: nanoid(),
                                propertyName: 'hoverHighlight',
                                label: 'Hover Highlight',
                                type: 'switch',
                                tooltip: 'Highlight rows on hover',
                                jsSetting: true,
                              },
                            ],
                          })
                          .addSettingsInputRow({
                            id: nanoid(),
                            inputs: [
                              {
                                id: nanoid(),
                                propertyName: 'rowBackgroundColor',
                                label: 'Row Background',
                                type: 'colorPicker',
                                tooltip: 'Default background color for table rows',
                                jsSetting: true,
                              },
                              {
                                id: nanoid(),
                                propertyName: 'rowAlternateBackgroundColor',
                                label: 'Alternate Background',
                                type: 'colorPicker',
                                tooltip: 'Background color for alternate rows (when striped is enabled)',
                                jsSetting: true,
                              },
                            ],
                          })
                          .addSettingsInputRow({
                            id: nanoid(),
                            inputs: [
                              {
                                id: nanoid(),
                                propertyName: 'rowHoverBackgroundColor',
                                label: 'Hover Background',
                                type: 'colorPicker',
                                tooltip: 'Background color when hovering over rows',
                                jsSetting: true,
                              },
                              {
                                id: nanoid(),
                                propertyName: 'rowSelectedBackgroundColor',
                                label: 'Selected Background',
                                type: 'colorPicker',
                                tooltip: 'Background color for selected rows',
                                jsSetting: true,
                              },
                            ],
                          })
                          .addSettingsInput({
                            id: nanoid(),
                            propertyName: 'stickyHeader',
                            label: 'Sticky Header',
                            inputType: 'switch',
                            tooltip: 'Make header stick to top when scrolling',
                            jsSetting: true,
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
                          .addSettingsInput({
                            id: nanoid(),
                            inputType: 'codeEditor',
                            propertyName: 'tableStyle',
                            hideLabel: false,
                            label: 'Table Style',
                            description: 'The style that will be applied to the table',
                          })
                          .addSettingsInput({
                            id: nanoid(),
                            inputType: 'codeEditor',
                            propertyName: 'containerStyle',
                            hideLabel: false,
                            label: 'Container Style',
                            description: 'The style that will be applied to the table container/wrapper',
                          })
                          .toJson(),
                        ],
                      },
                    })
                    .toJson(),
                ],
              })
              .toJson(),
            ],
          },
          {
            key: 'security',
            title: 'Security',
            id: securityTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'permissions',
                  label: 'Permissions',
                  inputType: 'permissions',
                  parentId: securityTabId,
                  jsSetting: true,
                  tooltip: 'Enter a list of permissions that should be associated with this component',
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
