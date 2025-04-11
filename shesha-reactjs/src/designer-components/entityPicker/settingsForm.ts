import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { fontTypes, fontWeights, textAlign } from '../_settings/utils/font/utils';
import { borderStyles, getBorderInputs, getCornerInputs } from '../_settings/utils/border/utils';
import { nanoid } from '@/utils/uuid';
import { backgroundTypeOptions, positionOptions, repeatOptions, sizeOptions } from '../_settings/utils/background/utils';

export const getSettings = (data) => {

  return {
    components: new DesignerToolbarSettings(data)
      .addSearchableTabs({
        id: 'W_m7doMyCpCYwAYDfRh6I',
        propertyName: 'settingsTabs',
        parentId: 'root',
        label: 'Settings',
        hideLabel: true,
        labelAlign: 'right',
        size: 'small',
        tabs: [
          {
            key: '1',
            title: 'Common',
            id: 's4gmBg31azZC0UjZjpfTm',
            components: [...new DesignerToolbarSettings()
              .addContextPropertyAutocomplete({
                id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
                propertyName: 'propertyName',
                label: 'Property Name',
                parentId: 's4gmBg31azZC0UjZjpfTm',
                styledLabel: true,
                size: 'small',
                validate: {
                  required: true,
                },
                jsSetting: true,
              })
              .addLabelConfigurator({
                id: '46d07439-4c18-468c-89e1-60c002ce96c5',
                propertyName: 'hideLabel',
                label: 'Label',
                parentId: 's4gmBg31azZC0UjZjpfTm',
                hideLabel: true,
              })
              .addSettingsInputRow({
                id: 'palceholder-tooltip-s4gmBg31azZC0UjZjpfTm',
                parentId: 's4gmBg31azZC0UjZjpfTm',
                inputs: [
                  {
                    type: 'textField',
                    id: 'placeholder-s4gmBg31azZC0UjZjpfTm',
                    propertyName: 'placeholder',
                    label: 'Placeholder',
                    size: 'small',
                    jsSetting: true,
                  },
                  {
                    type: 'textArea',
                    id: 'tooltip-s4gmBg31azZC0UjZjpfTm',
                    propertyName: 'description',
                    label: 'Tooltip',
                    jsSetting: true,
                  },
                ],
              })
              .addSettingsInputRow({
                id: 'type-default-value-s4gmBg31azZC0UjZjpfTm',
                parentId: 's4gmBg31azZC0UjZjpfTm',
                inputs: [
                  {
                    type: 'dropdown',
                    id: 'type-s4gmBg31azZC0UjZjpfTm',
                    propertyName: 'mode',
                    label: 'Selection Type',
                    size: 'small',
                    jsSetting: true,
                    dropdownOptions: [
                      {
                        label: 'Single',
                        value: 'single',
                      },
                      {
                        label: 'Multiple',
                        value: 'multiple',
                      },
                    ],
                  },
                  {
                    type: 'autocomplete',
                    id: 'initialValue-s4gmBg31azZC0UjZjpfTm',
                    propertyName: 'entityType',
                    label: 'Entity Type',
                    jsSetting: true,
                    dataSourceType: 'url',
                    validate: {},
                    dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
                    settingsValidationErrors: [],
                  },
                ],
              })

              .addSettingsInputRow({
                id: 'default-value-s4gmBg31azZC0UjZjpfTm',
                parentId: 's4gmBg31azZC0UjZjpfTm',
                readOnly: false,
                hidden: { _code: 'return !getSettingValue(data?.entityType);', _mode: 'code', _value: false } as any,
                inputs: [
                  {
                    type: 'propertyAutocomplete',
                    id: 'hpm6rN_aj-L_KaG5MLIZt',
                    propertyName: 'displayEntityKey',
                    label: 'Display Property',
                    labelAlign: 'right',
                    parentId: 'pn154bf6-f76d-4139-a850-c99bf06c8b69',
                    hidden: false,
                    isDynamic: false,
                    description: 'Name of the property that should be displayed in the field. Live empty to use default display property defined on the back-end.',
                    validate: {},
                    modelType: '{{data.entityType}}',
                    autoFillProps: false,
                    settingsValidationErrors: [],
                  },
                ],
              })
              .addSettingsInputRow({
                id: '12d700d6-ed4d-49d5-9cfd-fe8f0060f3b6',
                parentId: 's4gmBg31azZC0UjZjpfTm',
                inputs: [
                  {
                    type: 'editModeSelector',
                    id: 'editMode-s4gmBg31azZC0UjZjpfTm',
                    propertyName: 'editMode',
                    label: 'Edit Mode',
                    size: 'small',
                    defaultValue: 'inherited',
                    jsSetting: true,
                  },
                  {
                    type: 'switch',
                    id: 'hidden-s4gmBg31azZC0UjZjpfTm',
                    propertyName: 'hidden',
                    label: 'Hide',
                    jsSetting: true,
                    layout: 'horizontal',
                  },
                ],
              })
              .toJson()
            ]
          },
          {
            key: '2',
            title: 'Data',
            id: 's4gmBg31azZC0UjZjpfTm',
            components: [...new DesignerToolbarSettings()
              .addContainer({
                id: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
                parentId: 's4gmBg31azZC0UjZjpfTm',
                components: [...new DesignerToolbarSettings()
                  .addSettingsInputRow({
                    id: 'query-builder-s4gmBg31azZC0UjZjpfTm',
                    parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
                      inputs: [
                      {
                        type: 'queryBuilder',
                        id: 'query-builder-s4gmBg31azZC0UjZjpfTm',
                        propertyName: 'filters',
                        label: 'Entity Filter',
                        jsSetting: true,
                        modelType: '{{data.entityType}}',
                        fieldsUnavailableHint: 'Please select `Entity Type` to be able to configure this filter.',
                        hidden: { _code: 'return !getSettingValue(data?.entityType);', _mode: 'code', _value: false } as any,
                      },
                    ],
                  })
                  .addSettingsInput({
                      inputType: 'dropdown',
                    id: 'acb2d566-fe48-43bd-84e0-28b7103354c1',
                    propertyName: 'valueFormat',
                    parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
                    label: 'Value Format',
                    dropdownOptions: [
                      {
                        label: 'Simple ID',
                        value: 'simple',
                      },
                      {
                        label: 'Entity reference',
                        value: 'entityReference',
                      },
                      {
                        label: 'Custom',
                        value: 'custom',
                      },
                    ],
                    defaultValue: ['simple'],
                  })
                  .addSettingsInputRow({
                    id: 'customJs-s4gmBg31azZC0UjZjpfTm',
                    parentId: 's4gmBg31azZC0UjZjpfTm',
                    hidden: { _code: 'return getSettingValue(data?.valueFormat) !== "custom";', _mode: 'code', _value: false } as any,
                    inputs: [
                      {
                        type: 'codeEditor',
                        id: '405b0599-914d-4d2d-875c-765a495472f8',
                        propertyName: 'incomeCustomJs',
                        label: 'Id Value',
                        parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
                        validate: {},
                        settingsValidationErrors: [],
                        description: "Return string value of Id",
                      },
                      {
                        type: 'codeEditor',
                        id: '81fb0599-914d-4d2d-875c-765a495472f8',
                        propertyName: 'outcomeCustomJs',
                        label: 'Custom Value',
                        parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
                        validate: {},
                        settingsValidationErrors: [],
                        description: "Return value that will be stored as field value",
                      },
                    ],
                    })
                  .addSettingsInput({
                    id: 'columns-s4gmBg31azZC0UjZjpfTm',
                      inputType: 'columnsConfig',
                    propertyName: 'items',
                    parentId: 'pn154bf6-f76d-4139-a850-c99bf06c8b69',
                    label: 'Columns',
                    items: [],
                    modelType: '{{data.entityType}}',
                    parentComponentType: 'entityPicker',
                  }).toJson()]
              })
              .addSettingsInput({
                inputType: 'switch',
                id: '0cc0b997-f3f7-4a3d-ba36-8590687af9bd',
                propertyName: 'allowNewRecord',
                parentId: 'root',
                label: 'Allow New Record',
              })
              .addCollapsiblePanel({
                id: 'modalSettingsCollapsiblePanel',
                propertyName: 'modalSettings',
                label: 'Dialog Settings',
                labelAlign: 'right',
                parentId: 's4gmBg31azZC0UjZjpfTm',
                collapsible: 'header',
                hidden: { _code: 'return !getSettingValue(data?.allowNewRecord);', _mode: 'code', _value: false } as any,
                content: {
                  id: 'modalSettingsPnl',
                  components: [...new DesignerToolbarSettings()
                    .addSettingsInputRow({
                      id: 'data-source-s4gmBg31azZC0UjZjpfTm',
                          inputs: [
                        {
                          type: 'textField',
                          id: '4b3b0da0-f126-4e37-b5f5-568367dc008f',
                          propertyName: 'modalTitle',
                          label: 'Title',
                          labelAlign: 'right',
                          parentId: '2a5acbcf-cd52-487e-9cd7-09594a04793a',
                          hidden: false,
                          validate: {
                            required: true,
                          }
                        },
                        {
                          type: 'formAutocomplete',
                          id: 'fd3d4ef4-be06-40e9-9815-118754707d0e',
                          propertyName: 'modalFormId',
                          label: 'Modal Form',
                          labelAlign: 'right',
                          parentId: '2a5acbcf-cd52-487e-9cd7-09594a04793a',
                          hidden: false,
                          size: 'small',
                          validate: {
                            required: true,
                          }
                        }
                      ]
                    })
                    .addSettingsInputRow({
                      id: 'buttons-s4gmBg31azZC0UjZjpfTm',
                          inputs: [{
                        id: nanoid(),
                        propertyName: 'footerButtons',
                        label: 'Buttons Type',
                        type: 'dropdown',
                        width: 120,
                        dropdownOptions: [
                          { label: 'Default', value: 'default' },
                          { label: 'Custom', value: 'custom' },
                          { label: 'None', value: 'none' },
                        ],
                        defaultValue: 'default',
                      },
                      {
                        type: 'dropdown',
                        id: nanoid(),
                        hidden: { _code: 'return !(getSettingValue(data?.showModalFooter) === true || getSettingValue(data?.footerButtons) === "default");', _mode: 'code', _value: false } as any,
                        propertyName: 'submitHttpVerb',
                        label: 'Submit HTTP Verb',
                        dropdownOptions: [
                          { label: 'POST', value: 'POST' },
                          { label: 'PUT', value: 'PUT' },
                        ],
                        defaultValue: 'POST',
                      },
                      {
                        id: nanoid(),
                        propertyName: 'buttons',
                        hidden: { _code: 'return !(getSettingValue(data?.footerButtons) === "custom");', _mode: 'code', _value: false } as any,
                        label: 'Configure Modal Buttons',
                        type: 'buttonGroupConfigurator',
                      }
                      ]
                    })
                    .addSettingsInput({
                      id: '264903ff-b525-4a6e-893f-d560b219df9d',
                      propertyName: 'modalWidth',
                      inputType: 'customDropdown',
                      label: 'Dialog Width',
                      allowClear: true,
                      customDropdownMode: 'single',
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
                        }
                      ]
                    })
                    .toJson()]
                }
              })
              .toJson()
            ]
          },
          {
            key: '3',
            title: 'Validation',
            id: '6eBJvoll3xtLJxdvOAlnB',
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                id: '3be9da3f-f47e-48ae-b4c3-f5cc36e534d9',
                propertyName: 'validate.required',
                label: 'Required',
                inputType: 'switch',
                size: 'small',
                layout: 'horizontal',
                jsSetting: true,
                parentId: '6eBJvoll3xtLJxdvOAlnB'
              })
              .toJson()
            ]
          },
          {
            key: '4',
            title: 'Events',
            id: 'Cc47W08MWrKdhoGqFKMI2',
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                id: '3cef348b-6bba-4176-93f6-f3a8b21e33c9',
                inputType: 'codeEditor',
                propertyName: 'onChangeCustom',
                label: 'On Change',
                labelAlign: 'right',
                tooltip: 'Enter custom eventhandler on changing of event. (form, event) are exposed',
                parentId: 'Cc47W08MWrKdhoGqFKMI2'
              })
              .toJson()
            ]
          },
          {
            key: '5',
            title: 'Appearance',
            id: 'elgrlievlfwehhh848r8hsdnflsdnclurbd',
            components: [...new DesignerToolbarSettings()
              .addPropertyRouter({
                id: 'styleRouter',
                propertyName: 'propertyRouter1',
                componentName: 'propertyRouter',
                label: 'Property router1',
                labelAlign: 'right',
                parentId: 'elgrlievlfwehhh848r8hsdnflsdnclurbd',
                hidden: false,
                propertyRouteName: {
                  _mode: "code",
                  _code: "    return contexts.canvasContext?.designerDevice || 'desktop';",
                  _value: ""
                },
                components: [
                  ...new DesignerToolbarSettings()
                    .addCollapsiblePanel({
                      id: 'fontStyleCollapsiblePanel',
                      propertyName: 'pnlFontStyle',
                      label: 'Font',
                      labelAlign: 'right',
                      parentId: 'styleRouter',
                      ghost: true,
                      collapsible: 'header',
                      content: {
                        id: 'fontStylePnl',
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInputRow({
                            id: 'try26voxhs-HxJ5k5ngYE',
                            parentId: 'fontStylePnl',
                            inline: true,
                            propertyName: 'font',
                                      inputs: [
                              {
                                type: 'dropdown',
                                id: 'fontFamily-s4gmBg31azZC0UjZjpfTm',
                                label: 'Family',
                                propertyName: 'font.type',
                                hideLabel: true,
                                dropdownOptions: fontTypes,
                              },
                              {
                                type: 'numberField',
                                id: 'fontSize-s4gmBg31azZC0UjZjpfTm',
                                label: 'Size',
                                propertyName: 'font.size',
                                hideLabel: true,
                                width: 50,
                              },
                              {
                                type: 'dropdown',
                                id: 'fontWeight-s4gmBg31azZC0UjZjpfTm',
                                label: 'Weight',
                                propertyName: 'font.weight',
                                hideLabel: true,
                                tooltip: "Controls text thickness (light, normal, bold, etc.)",
                                dropdownOptions: fontWeights,
                                width: 100,
                              },
                              {
                                type: 'colorPicker',
                                id: 'fontColor-s4gmBg31azZC0UjZjpfTm',
                                label: 'Color',
                                hideLabel: true,
                                propertyName: 'font.color',
                              },
                              {
                                type: 'dropdown',
                                id: 'fontAlign-s4gmBg31azZC0UjZjpfTm',
                                label: 'Align',
                                propertyName: 'font.align',
                                hideLabel: true,
                                width: 60,
                                dropdownOptions: textAlign,
                                hidden: { _code: 'return  getSettingValue(data?.mode) === "multiple";', _mode: 'code', _value: false } as any,
                              },
                            ],
                          })
                          .toJson()
                        ]
                      }
                    })
                    .addCollapsiblePanel({
                      id: 'dimensionsStyleCollapsiblePanel',
                      propertyName: 'pnlDimensions',
                      label: 'Dimensions',
                      parentId: 'styleRouter',
                      labelAlign: 'right',
                      ghost: true,
                      collapsible: 'header',
                      content: {
                        id: 'dimensionsStylePnl',
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInputRow({
                            id: 'dimensionsStyleRowWidth',
                            parentId: 'dimensionsStylePnl',
                            inline: true,
                                      inputs: [
                              {
                                type: 'textField',
                                id: 'width-s4gmBg31azZC0UjZjpfTm',
                                label: "Width",
                                width: 85,
                                propertyName: "dimensions.width",
                                icon: "widthIcon",
                                tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"

                              },
                              {
                                type: 'textField',
                                id: 'minWidth-s4gmBg31azZC0UjZjpfTm',
                                label: "Min Width",
                                width: 85,
                                hideLabel: true,
                                propertyName: "dimensions.minWidth",
                                icon: "minWidthIcon",
                              },
                              {
                                type: 'textField',
                                id: 'maxWidth-s4gmBg31azZC0UjZjpfTm',
                                label: "Max Width",
                                width: 85,
                                hideLabel: true,
                                propertyName: "dimensions.maxWidth",
                                icon: "maxWidthIcon",
                              }
                            ]
                          })
                          .addSettingsInputRow({
                            id: 'dimensionsStyleRowHeight',
                            parentId: 'dimensionsStylePnl',
                            inline: true,
                                      inputs: [
                              {
                                type: 'textField',
                                id: 'height-s4gmBg31azZC0UjZjpfTm',
                                label: "Height",
                                width: 85,
                                propertyName: "dimensions.height",
                                icon: "heightIcon",
                                tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"
                              },
                              {
                                type: 'textField',
                                id: 'minHeight-s4gmBg31azZC0UjZjpfTm',
                                label: "Min Height",
                                width: 85,
                                hideLabel: true,
                                propertyName: "dimensions.minHeight",
                                icon: "minHeightIcon",
                              },
                              {
                                type: 'textField',
                                id: 'maxHeight-s4gmBg31azZC0UjZjpfTm',
                                label: "Max Height",
                                width: 85,
                                hideLabel: true,
                                propertyName: "dimensions.maxHeight",
                                icon: "maxHeightIcon",
                              }
                            ]
                          })
                          .toJson()
                        ]
                      }
                    })
                    .addCollapsiblePanel({
                      id: 'borderStyleCollapsiblePanel',
                      propertyName: 'pnlBorderStyle',
                      label: 'Border',
                      labelAlign: 'right',
                      ghost: true,
                      parentId: 'styleRouter',
                      collapsible: 'header',
                      content: {
                        id: 'borderStylePnl',
                        components: [...new DesignerToolbarSettings()
                          .addContainer({
                            id: 'borderStyleRow',
                            parentId: 'borderStylePnl',
                            components: getBorderInputs('', true, true) as any
                          })
                          .addContainer({
                            id: 'borderRadiusStyleRow',
                            parentId: 'borderStylePnl',
                            components: getCornerInputs() as any
                          })
                          .toJson()
                        ]
                      }
                    })

                    .addCollapsiblePanel({
                      id: 'backgroundStyleCollapsiblePanel',
                      propertyName: 'pnlBackgroundStyle',
                      label: 'Background',
                      labelAlign: 'right',
                      ghost: true,
                      parentId: 'styleRouter',
                      collapsible: 'header',
                      content: {
                        id: 'backgroundStylePnl',
                        components: [
                          ...new DesignerToolbarSettings()
                            .addSettingsInput({
                              id: "backgroundStyleRow-selectType",
                              parentId: "backgroundStylePnl",
                              label: "Type",
                              jsSetting: false,
                              propertyName: "background.type",
                              inputType: "radio",
                              tooltip: "Select a type of background",
                              buttonGroupOptions: backgroundTypeOptions,
                              readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInputRow({
                              id: "backgroundStyleRow-color",
                              parentId: "backgroundStylePnl",
                              inputs: [{
                                type: 'colorPicker',
                                id: 'backgroundStyleRow-color',
                                label: "Color",
                                propertyName: "background.color",
                                hideLabel: true,
                                jsSetting: false,
                              }],
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "color";', _mode: 'code', _value: false } as any,
                                        })
                            .addSettingsInputRow({
                              id: "backgroundStyle-gradientColors",
                              parentId: "backgroundStylePnl",
                              inputs: [{
                                type: 'multiColorPicker',
                                id: 'backgroundStyle-gradientColors',
                                propertyName: "background.gradient.colors",
                                label: "Colors",
                                jsSetting: false,
                              }
                              ],
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "gradient";', _mode: 'code', _value: false } as any,
                              hideLabel: true,
                                        })
                            .addSettingsInputRow({
                              id: "backgroundStyle-url",
                              parentId: "backgroundStylePnl",
                              inputs: [{
                                type: 'textField',
                                id: 'backgroundStyle-url',
                                propertyName: "background.url",
                                jsSetting: false,
                                label: "URL",
                              }],
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "url";', _mode: 'code', _value: false } as any,
                                        })
                            .addSettingsInputRow({
                              id: "backgroundStyle-image",
                              parentId: 'backgroundStylePnl',
                              inputs: [{
                                type: 'imageUploader',
                                id: 'backgroundStyle-image',
                                propertyName: 'background.uploadFile',
                                label: "Image",
                                jsSetting: false,
                              }],
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "image";', _mode: 'code', _value: false } as any,
                                        })
                            .addSettingsInputRow({
                              id: "backgroundStyleRow-storedFile",
                              parentId: 'backgroundStylePnl',
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "storedFile";', _mode: 'code', _value: false } as any,
                                          inputs: [
                                {
                                  type: 'textField',
                                  id: 'backgroundStyle-storedFile',
                                  jsSetting: false,
                                  propertyName: "background.storedFile.id",
                                  label: "File ID"
                                }
                              ]
                            })
                            .addSettingsInputRow({
                              id: "backgroundStyleRow-controls",
                              parentId: 'backgroundStyleRow',
                              inline: true,
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                              readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                              inputs: [
                                {
                                  type: 'customDropdown',
                                  id: 'backgroundStyleRow-size',
                                  label: "Size",
                                  customTooltip: 'Size of the background image, two space separated values with units e.g "100% 100px"',
                                  hideLabel: true,
                                  propertyName: "background.size",
                                  dropdownOptions: sizeOptions,
                                },
                                {
                                  type: 'customDropdown',
                                  id: 'backgroundStyleRow-position',
                                  label: "Position",
                                  hideLabel: true,
                                  customTooltip: 'Position of the background image, two space separated values with units e.g "5em 100px"',
                                  propertyName: "background.position",
                                  dropdownOptions: positionOptions,
                                },
                              ]
                            })
                            .addSettingsInputRow({
                              id: 'backgroundStyleRow-repeat',
                              parentId: 'backgroundStyleRow',
                                          inputs: [{
                                type: 'radio',
                                id: 'backgroundStyleRow-repeat-radio',
                                label: 'Repeat',
                                hideLabel: true,
                                propertyName: 'background.repeat',
                                inputType: 'radio',
                                buttonGroupOptions: repeatOptions,
                              }],
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                            })
                            .toJson()
                        ],
                      }
                    })
                    .addCollapsiblePanel({
                      id: 'shadowStyleCollapsiblePanel',
                      propertyName: 'pnlShadowStyle',
                      label: 'Shadow',
                      labelAlign: 'right',
                      ghost: true,
                      parentId: 'styleRouter',
                      collapsible: 'header',
                      content: {
                        id: 'shadowStylePnl',
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInputRow({
                            id: 'shadowStyleRow',
                            parentId: 'shadowStylePnl',
                            inline: true,
                                      inputs: [
                              {
                                type: 'numberField',
                                id: 'shadowStyleRow-offsetX',
                                label: 'Offset X',
                                hideLabel: true,
                                width: 80,
                                icon: "offsetHorizontalIcon",
                                propertyName: 'shadow.offsetX',
                              },
                              {
                                type: 'numberField',
                                id: 'shadowStyleRow-offsetY',
                                label: 'Offset Y',
                                hideLabel: true,
                                width: 80,
                                icon: 'offsetVerticalIcon',
                                propertyName: 'shadow.offsetY',
                              },
                              {
                                type: 'numberField',
                                id: 'shadowStyleRow-blurRadius',
                                label: 'Blur',
                                hideLabel: true,
                                width: 80,
                                icon: 'blurIcon',
                                propertyName: 'shadow.blurRadius',
                              },
                              {
                                type: 'numberField',
                                id: 'shadowStyleRow-spreadRadius',
                                label: 'Spread',
                                hideLabel: true,
                                width: 80,
                                icon: 'spreadIcon',
                                propertyName: 'shadow.spreadRadius',
                              },
                              {
                                type: 'colorPicker',
                                id: 'shadowStyleRow-color',
                                label: 'Color',
                                hideLabel: true,
                                propertyName: 'shadow.color',
                              },
                            ],
                          })
                          .toJson()
                        ]
                      }
                    })
                    .addCollapsiblePanel({
                      id: 'styleCollapsiblePanel',
                      propertyName: 'stylingBox',
                      label: 'Margin & Padding',
                      labelAlign: 'right',
                      ghost: true,
                      collapsible: 'header',
                      content: {
                        id: 'stylePnl-M5-911',
                        components: [...new DesignerToolbarSettings()
                          .addStyleBox({
                            id: 'styleBoxPnl',
                            label: 'Margin Padding',
                            hideLabel: true,
                            propertyName: 'stylingBox',
                          })
                          .toJson()
                        ]
                      }
                    })
                    .addCollapsiblePanel({
                      id: 'customStyleCollapsiblePanel',
                      propertyName: 'customStyle',
                      label: 'Custom Style',
                      labelAlign: 'right',
                      ghost: true,
                      parentId: 'styleRouter',
                      collapsible: 'header',
                      content: {
                        id: 'stylePnl-M500-911MFR',
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInput({
                                      id: 'custom-css-412c-8461-4c8d55e5c073',
                            inputType: 'codeEditor',
                            propertyName: 'style',
                            label: 'Style',
                            description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                          })
                          .toJson()
                        ]
                      }
                    })
                    .addCollapsiblePanel({
                      id: 'entityPickerDividerCollapsiblePanel',
                      propertyName: 'entityPickerDivider',
                      label: 'Entity Picker Divider',
                      labelAlign: 'right',
                      ghost: true,
                      content: {
                        id: 'entityPickerDividerPnl',
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInputRow({
                            id: nanoid(),
                            parentId: 'borderStylePnl',
                            inline: true,
                            readOnly: false,
                            inputs: [
                              {
                                id: nanoid(),
                                type: 'textField',
                                label: "Width",
                                hideLabel: true,
                                propertyName: 'dividerWidth',
                              },
                              {
                                id: nanoid(),
                                label: "Style",
                                propertyName: 'dividerStyle',
                                type: "dropdown",
                                hideLabel: true,
                                width: 60,
                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                dropdownOptions: borderStyles,
                              },
                              {
                                id: nanoid(),
                                label: `Color`,
                                propertyName: 'dividerColor',
                                type: "colorPicker",
                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                hideLabel: true,
                              }
                            ]
                          })
                          .toJson()
                        ]
                      }
                    })
                    .toJson()]
              }).toJson()]
          },
          {
            key: '6',
            title: 'Security',
            id: '6Vw9iiDw9d0MD_Rh5cbIn',
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                id: '1adea529-1f0c-4def-bd41-ee166a5dfcd7',
                inputType: 'permissions',
                propertyName: 'permissions',
                label: 'Permissions',
                size: 'small',
                parentId: '6Vw9iiDw9d0MD_Rh5cbIn'
              })
              .toJson()
            ]
          }
        ]
      }).toJson(),
    formSettings: {
      colon: false,
      layout: 'vertical' as FormLayout,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 }
    }
  };
};