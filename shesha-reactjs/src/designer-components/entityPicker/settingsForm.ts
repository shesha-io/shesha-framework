import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { fontTypes, fontWeights, textAlign } from '../_settings/utils/font/utils';
import { getBorderInputs, getCornerInputs } from '../_settings/utils/border/utils';
import { nanoid } from '@/utils/uuid';
import { backgroundTypeOptions, positionOptions, repeatOptions, sizeOptions } from '../_settings/utils/background/utils';

export const getSettings = (data) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const dataTabId = nanoid();
  const validationTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();
  const securityTabId = nanoid();
  const styleRouterId = nanoid();
  const dataPanelId = nanoid();
  const fontStylePnlId = nanoid();
  const dimensionsStylePnlId = nanoid();
  const borderStylePnlId = nanoid();
  const backgroundStylePnlId = nanoid();
  const backgroundStyleRowId = nanoid();
  const shadowStylePnlId = nanoid();
  const modalSettingsPnlId = nanoid();

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
            key: '1',
            title: 'Common',
            id: commonTabId,
            components: [...new DesignerToolbarSettings()
              .addContextPropertyAutocomplete({
                id: nanoid(),
                propertyName: 'propertyName',
                label: 'Property Name',
                parentId: commonTabId,
                styledLabel: true,
                size: 'small',
                validate: {
                  required: true,
                },
                jsSetting: true,
              })
              .addLabelConfigurator({
                id: nanoid(),
                propertyName: 'hideLabel',
                label: 'Label',
                parentId: commonTabId,
                hideLabel: true,
              })
              .addSettingsInput({
                id: nanoid(),
                parentId: commonTabId,
                inputType: 'textField',
                propertyName: 'placeholder',
                label: 'Placeholder',
                size: 'small',
                jsSetting: true,
              })
              .addSettingsInput({
                inputType: 'textArea',
                id: nanoid(),
                propertyName: 'description',
                label: 'Tooltip',
                jsSetting: true,
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: commonTabId,
                inputs: [
                  {
                    type: 'dropdown',
                    id: nanoid(),
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
                    id: nanoid(),
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
                id: nanoid(),
                parentId: commonTabId,
                readOnly: false,
                hidden: { _code: 'return !getSettingValue(data?.entityType);', _mode: 'code', _value: false } as any,
                inputs: [
                  {
                    type: 'propertyAutocomplete',
                    id: nanoid(),
                    propertyName: 'displayEntityKey',
                    label: 'Display Property',
                    labelAlign: 'right',
                    parentId: dataPanelId,
                    hidden: false,
                    isDynamic: false,
                    description: 'Name of the property that should be displayed in the field. Live empty to use default display property defined on the back-end.',
                    validate: {},
                    modelType: {
                      _code: 'return getSettingValue(data?.entityType);',
                      _mode: 'code',
                      _value: false
                    } as any,
                    autoFillProps: false,
                    settingsValidationErrors: [],
                  },
                ],
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
                    defaultValue: 'inherited',
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
              .toJson()
            ]
          },
          {
            key: '2',
            title: 'Data',
            id: dataTabId,
            components: [...new DesignerToolbarSettings()
              .addContainer({
                id: dataPanelId,
                parentId: dataTabId,
                components: [...new DesignerToolbarSettings()
                  .addSettingsInputRow({
                    id: nanoid(),
                    parentId: dataPanelId,
                    inputs: [
                      {
                        type: 'queryBuilder',
                        id: nanoid(),
                        propertyName: 'filters',
                        label: 'Entity Filter',
                        modelType: '{{data.entityType}}',
                        fieldsUnavailableHint: 'Please select `Entity Type` to be able to configure this filter.',
                        hidden: { _code: 'return !getSettingValue(data?.entityType);', _mode: 'code', _value: false } as any,
                      },
                    ],
                  })
                  .addSettingsInput({
                    inputType: 'dropdown',
                    id: nanoid(),
                    propertyName: 'valueFormat',
                    parentId: dataPanelId,
                    label: 'Value Format',
                    jsSetting: true,
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
                    id: nanoid(),
                    parentId: dataPanelId,
                    hidden: { _code: 'return getSettingValue(data?.valueFormat) !== "custom";', _mode: 'code', _value: false } as any,
                    inputs: [
                      {
                        type: 'codeEditor',
                        id: nanoid(),
                        propertyName: 'incomeCustomJs',
                        label: 'ID Value',
                        parentId: dataPanelId,
                        validate: {},
                        settingsValidationErrors: [],
                        description: "Return string value of Id",
                      },
                      {
                        type: 'codeEditor',
                        id: nanoid(),
                        propertyName: 'outcomeCustomJs',
                        label: 'Custom Value',
                        parentId: dataPanelId,
                        validate: {},
                        settingsValidationErrors: [],
                        description: "Return value that will be stored as field value",
                      },
                    ],
                  })
                  .addSettingsInput({
                    id: nanoid(),
                    inputType: 'columnsConfig',
                    propertyName: 'items',
                    parentId: dataPanelId,
                    label: 'Columns',
                    items: [],
                    modelType: {
                      _code: 'return getSettingValue(data?.entityType);',
                      _mode: 'code',
                      _value: false
                    } as any,
                    parentComponentType: 'entityPicker',
                    jsSetting: true,
                  }).toJson()]
              })
              .addSettingsInput({
                inputType: 'switch',
                id: nanoid(),
                propertyName: 'allowNewRecord',
                parentId: 'root',
                label: 'Allow New Record',
              })
              .addCollapsiblePanel({
                id: nanoid(),
                propertyName: 'modalSettings',
                label: 'Dialog Settings',
                labelAlign: 'right',
                parentId: dataTabId,
                collapsible: 'header',
                ghost: true,
                hidden: { _code: 'return !getSettingValue(data?.allowNewRecord);', _mode: 'code', _value: false } as any,
                content: {
                  id: modalSettingsPnlId,
                  components: [...new DesignerToolbarSettings()
                    .addSettingsInputRow({
                      id: nanoid(),
                      parentId: modalSettingsPnlId,
                      inputs: [
                        {
                          type: 'textField',
                          id: nanoid(),
                          propertyName: 'modalTitle',
                          label: 'Title',
                          labelAlign: 'right',
                          parentId: modalSettingsPnlId,
                          hidden: false,
                          jsSetting: true,
                          validate: {
                            required: true,
                          }
                        },
                        {
                          type: 'formAutocomplete',
                          id: nanoid(),
                          propertyName: 'modalFormId',
                          label: 'Modal Form',
                          labelAlign: 'right',
                          parentId: modalSettingsPnlId,
                          hidden: false,
                          size: 'small',
                          jsSetting: true,
                          validate: {
                            required: true,
                          }
                        }
                      ]
                    })
                    .addSettingsInputRow({
                      id: nanoid(),
                      inputs: [{
                        id: nanoid(),
                        propertyName: 'footerButtons',
                        label: 'Buttons Type',
                        type: 'dropdown',
                        width: 120,
                        jsSetting: true,
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
                        jsSetting: true,
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
                        jsSetting: true,
                      }
                      ]
                    })
                    .addSettingsInput({
                      id: nanoid(),
                      propertyName: 'modalWidth',
                      inputType: 'customDropdown',
                      label: 'Dialog Width',
                      allowClear: true,
                      jsSetting: true,
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
            id: validationTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                id: nanoid(),
                propertyName: 'validate.required',
                label: 'Required',
                inputType: 'switch',
                size: 'small',
                layout: 'horizontal',
                jsSetting: true,
                parentId: validationTabId
              })
              .toJson()
            ]
          },
          {
            key: '4',
            title: 'Events',
            id: eventsTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                id: nanoid(),
                inputType: 'codeEditor',
                propertyName: 'onChangeCustom',
                label: 'On Change',
                labelAlign: 'right',
                tooltip: 'Enter custom eventhandler on changing of event.',
                parentId: eventsTabId
              })
              .toJson()
            ]
          },
          {
            key: '5',
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
                  _value: ""
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
                        id: fontStylePnlId,
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInputRow({
                            id: nanoid(),
                            parentId: fontStylePnlId,
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
                                dropdownOptions: fontWeights,
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
                      id: nanoid(),
                      propertyName: 'pnlDimensions',
                      label: 'Dimensions',
                      parentId: styleRouterId,
                      labelAlign: 'right',
                      ghost: true,
                      collapsible: 'header',
                      content: {
                        id: dimensionsStylePnlId,
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInputRow({
                            id: nanoid(),
                            parentId: dimensionsStylePnlId,
                            inline: true,
                            inputs: [
                              {
                                type: 'textField',
                                id: nanoid(),
                                label: "Width",
                                width: 85,
                                propertyName: "dimensions.width",
                                icon: "widthIcon",
                                tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"

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
                              }
                            ]
                          })
                          .addSettingsInputRow({
                            id: nanoid(),
                            parentId: dimensionsStylePnlId,
                            inline: true,
                            inputs: [
                              {
                                type: 'textField',
                                id: nanoid(),
                                label: "Height",
                                width: 85,
                                propertyName: "dimensions.height",
                                icon: "heightIcon",
                                tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"
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
                              }
                            ]
                          })
                          .toJson()
                        ]
                      }
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
                        id: borderStylePnlId,
                        components: [...new DesignerToolbarSettings()
                          .addContainer({
                            id: nanoid(),
                            parentId: borderStylePnlId,
                            components: getBorderInputs('', true, true) as any
                          })
                          .addContainer({
                            id: nanoid(),
                            parentId: borderStylePnlId,
                            components: getCornerInputs() as any
                          })
                          .toJson()
                        ]
                      }
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
                        id: backgroundStylePnlId,
                        components: [
                          ...new DesignerToolbarSettings()
                            .addSettingsInput({
                              id: nanoid(),
                              parentId: backgroundStylePnlId,
                              label: "Type",
                              jsSetting: false,
                              propertyName: "background.type",
                              inputType: "radio",
                              tooltip: "Select a type of background",
                              buttonGroupOptions: backgroundTypeOptions,
                              readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: backgroundStylePnlId,
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
                              parentId: backgroundStylePnlId,
                              inputs: [{
                                type: 'multiColorPicker',
                                id: nanoid(),
                                propertyName: "background.gradient.colors",
                                label: "Colors",
                                jsSetting: false,
                              }
                              ],
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "gradient";', _mode: 'code', _value: false } as any,
                              hideLabel: true,
                            })
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: backgroundStylePnlId,
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
                              parentId: backgroundStylePnlId,
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
                              parentId: backgroundStylePnlId,
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "storedFile";', _mode: 'code', _value: false } as any,
                              inputs: [
                                {
                                  type: 'textField',
                                  id: nanoid(),
                                  jsSetting: false,
                                  propertyName: "background.storedFile.id",
                                  label: "File ID"
                                }
                              ]
                            })
                            .addSettingsInputRow({
                              id: backgroundStyleRowId,
                              parentId: backgroundStylePnlId,
                              inline: true,
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                              readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                              inputs: [
                                {
                                  type: 'customDropdown',
                                  id: nanoid(),
                                  label: "Size",
                                  customTooltip: 'Size of the background image, two space separated values with units e.g "100% 100px"',
                                  hideLabel: true,
                                  propertyName: "background.size",
                                  dropdownOptions: sizeOptions,
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
                              ]
                            })
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: backgroundStylePnlId,
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
                            .toJson()
                        ],
                      }
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
                        id: shadowStylePnlId,
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInputRow({
                            id: nanoid(),
                            parentId: shadowStylePnlId,
                            inline: true,
                            inputs: [
                              {
                                type: 'numberField',
                                id: nanoid(),
                                label: 'Offset X',
                                hideLabel: true,
                                width: 80,
                                icon: "offsetHorizontalIcon",
                                propertyName: 'shadow.offsetX',
                              },
                              {
                                type: 'numberField',
                                id: nanoid(),
                                label: 'Offset Y',
                                hideLabel: true,
                                width: 80,
                                icon: 'offsetVerticalIcon',
                                propertyName: 'shadow.offsetY',
                              },
                              {
                                type: 'numberField',
                                id: nanoid(),
                                label: 'Blur',
                                hideLabel: true,
                                width: 80,
                                icon: 'blurIcon',
                                propertyName: 'shadow.blurRadius',
                              },
                              {
                                type: 'numberField',
                                id: nanoid(),
                                label: 'Spread',
                                hideLabel: true,
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
                          .toJson()
                        ]
                      }
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
                          .toJson()
                        ]
                      }
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
                            label: 'Style',
                            description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
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
            id: securityTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                id: nanoid(),
                inputType: 'permissions',
                propertyName: 'permissions',
                label: 'Permissions',
                size: 'small',
                parentId: securityTabId
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