import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { getBorderInputs, getCornerInputs } from '../_settings/utils/border/utils';
import { backgroundTypeOptions, positionOptions, repeatOptions, sizeOptions } from '../_settings/utils/background/utils';
import { fontTypes, fontWeights, textAlign } from '../_settings/utils/font/utils';
import { nanoid } from '@/utils/uuid';
import { overflowOptions } from '../_settings/utils/dimensions/utils';

export const getSettings = () => {
  // Generate unique IDs for main sections
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const appearanceTabId = nanoid();
  const securityTabId = nanoid();
  const styleRouterId = nanoid();

  return {
    components: new DesignerToolbarSettings()
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
            key: '1',
            title: 'Common',
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                inputType: 'textField',
                id: nanoid(),
                propertyName: 'componentName',
                parentId: commonTabId,
                label: 'Component Name',
                validate: {
                  required: true
                },
                jsSetting: false
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: commonTabId,
                inputs: [
                  {
                    type: 'textField',
                    id: nanoid(),
                    propertyName: 'label',
                    parentId: commonTabId,
                    label: 'Label',
                    jsSetting: true
                  },
                  {
                    id: nanoid(),
                    propertyName: 'hasCustomHeader',
                    parentId: commonTabId,
                    label: 'Custom Header',
                    type: 'switch',
                    jsSetting: true
                  }
                ]
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: commonTabId,
                inputs: [
                  {
                    id: nanoid(),
                    propertyName: 'expandIconPosition',
                    parentId: commonTabId,
                    label: 'Icon Position',
                    type: 'dropdown',
                    jsSetting: true,
                    dropdownOptions: [
                      {
                        label: 'Hide',
                        value: 'hide',
                      },
                      {
                        label: 'Start',
                        value: 'start',
                      },
                      {
                        label: 'End',
                        value: 'end',
                      }
                    ],
                    validate: {},
                  },
                  {
                    id: nanoid(),
                    propertyName: 'collapsible',
                    label: 'Collapsible',
                    type: 'dropdown',
                    jsSetting: true,
                    parentId: commonTabId,
                    dropdownOptions: [
                      {
                        label: 'Header',
                        value: 'header',
                      },
                      {
                        label: 'Icon',
                        value: 'icon',
                      },
                      {
                        label: 'Disabled',
                        value: 'disabled',
                      }
                    ],
                    validate: {},
                    version: 3
                  }
                ]
              })
              .addSettingsInputRow({
                id: nanoid(),
                propertyName: 'collapsedByDefault',
                labelAlign: 'right',
                parentId: commonTabId,
                inputs: [
                  {
                    id: nanoid(),
                    propertyName: 'collapsedByDefault',
                    label: 'Collapsed By Default',
                    labelAlign: 'right',
                    type: 'switch',
                    parentId: commonTabId,
                    hidden: false,
                    isDynamic: false,
                    description: '',
                    jsSetting: true,
                    validate: {},
                  },
                  {
                    id: nanoid(),
                    propertyName: 'hideWhenEmpty',
                    label: 'Hide When Empty',
                    labelAlign: 'right',
                    parentId: commonTabId,
                    type: 'switch',
                    jsSetting: true,
                    description: 'Allows to hide the panel when all components are hidden due to some conditions',
                  }
                ]
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: commonTabId,
                inputs: [
                  {
                    id: nanoid(),
                    propertyName: 'hidden',
                    parentId: commonTabId,
                    label: 'Hide',
                    type: 'switch',
                    jsSetting: true
                  }
                ]
              })
              .toJson()]
          },
          {
            key: '2',
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
                    .addSettingsInputRow({
                      id: nanoid(),
                      propertyName: 'ghost',
                      parentId: styleRouterId,
                      readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                      inputs: [
                        {
                          id: nanoid(),
                          label: 'Ghost',
                          propertyName: 'ghost',
                          type: 'switch',
                          parentId: styleRouterId,
                          jsSetting: true
                        },
                        {
                          id: nanoid(),
                          propertyName: 'isSimpleDesign',
                          parentId: styleRouterId,
                          label: 'Simple Design',
                          type: 'switch',
                          jsSetting: true
                        }
                      ]
                    })
                    .addSettingsInputRow({
                      id: nanoid(),
                      parentId: styleRouterId,
                      readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                      inputs: [
                        {
                          id: nanoid(),
                          propertyName: 'accentStyle',
                          label: 'Accent',
                          labelAlign: 'right',
                          parentId: styleRouterId,
                          type: 'switch',
                          jsSetting: true,
                          description: 'Applies accent styling to panel borders using the primary color',
                        },
                        {
                          id: nanoid(),
                          propertyName: 'hideCollapseContent',
                          label: 'Hide Top Bar',
                          labelAlign: 'right',
                          type: 'switch',
                          parentId: styleRouterId,
                          description: 'Hides the collapsible panel',
                          jsSetting: true
                        }

                      ]
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
                          .addSettingsInput({
                            id: nanoid(),
                            parentId: styleRouterId,
                            inline: true,
                            inputType: 'dropdown',
                            label: 'Overflow',
                            defaultValue: 'auto',
                            propertyName: 'overflow',
                            dropdownOptions: overflowOptions
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
                      hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.ghost) || getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.isSimpleDesign);', _mode: 'code', _value: false } as any,
                      content: {
                        id: nanoid(),
                        components: [...new DesignerToolbarSettings()
                          .addContainer({
                            id: nanoid(),
                            parentId: styleRouterId,
                            components: getBorderInputs() as any
                          })
                          .addContainer({
                            id: nanoid(),
                            parentId: styleRouterId,
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
                      hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.ghost) || getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.isSimpleDesign);', _mode: 'code', _value: false } as any,
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
                              }
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
                                  label: "File ID"
                                }
                              ]
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
                                  dropdownOptions: [
                                    {
                                      value: "cover",
                                      label: "Cover"
                                    },
                                    {
                                      value: "contain",
                                      label: "Contain"
                                    },
                                    {
                                      value: "auto",
                                      label: "Auto"
                                    }
                                  ],
                                },
                                {
                                  type: 'customDropdown',
                                  id: nanoid(),
                                  label: "Position",
                                  hideLabel: true,
                                  propertyName: "background.position",
                                  dropdownOptions: [
                                    {
                                      value: "center",
                                      label: "Center"
                                    },
                                    {
                                      value: "top",
                                      label: "Top"
                                    },
                                    {
                                      value: "left",
                                      label: "Left"
                                    },
                                    {
                                      value: "right",
                                      label: "Right"
                                    },
                                    {
                                      value: "bottom",
                                      label: "Bottom"
                                    },
                                    {
                                      value: "top left",
                                      label: "Top Left"
                                    },
                                    {
                                      value: "top right",
                                      label: "Top Right"
                                    },
                                    {
                                      value: "bottom left",
                                      label: "Bottom Left"
                                    },
                                    {
                                      value: "bottom right",
                                      label: "Bottom Right"
                                    }
                                  ],
                                }
                              ]
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
                      hidden: { _code: 'return  getSettingValue(data?.ghost) || getSettingValue(data?.isSimpleDesign);', _mode: 'code', _value: false } as any,
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
                      parentId: styleRouterId,
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
                            hideLabel: false,
                            label: 'Style',
                            description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                          })
                          .toJson()
                        ]
                      }
                    })
                    .addCollapsiblePanel({
                      id: nanoid(),
                      propertyName: 'header',
                      label: 'Header Style',
                      labelAlign: 'right',
                      ghost: true,
                      collapsible: 'header',
                      collapsedByDefault: true,
                      parentId: styleRouterId,
                      content: {
                        id: nanoid(),
                        components: [...new DesignerToolbarSettings()
                          .addCollapsiblePanel({
                            id: nanoid(),
                            propertyName: 'pnlFontStyle',
                            label: 'Font',
                            labelAlign: 'right',
                            collapsedByDefault: true,
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
                                      label: 'Font',
                                      hideLabel: true,
                                      propertyName: 'headerStyles.font.type',
                                      dropdownOptions: fontTypes,
                                    },
                                    {
                                      type: 'numberField',
                                      id: nanoid(),
                                      label: 'Size',
                                      propertyName: 'headerStyles.font.size',
                                      hideLabel: true,
                                      width: 50,
                                    },
                                    {
                                      type: 'dropdown',
                                      id: nanoid(),
                                      label: 'Weight',
                                      propertyName: 'headerStyles.font.weight',
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
                                      propertyName: 'headerStyles.font.color',
                                    },
                                    {
                                      type: 'dropdown',
                                      id: nanoid(),
                                      label: 'Align',
                                      propertyName: 'headerStyles.font.align',
                                      hideLabel: true,
                                      width: 60,
                                      dropdownOptions: textAlign,
                                    },
                                  ],
                                })
                                .toJson()]
                            }
                          })
                          .addCollapsiblePanel({
                            id: nanoid(),
                            propertyName: 'pnlDimensionsStyle',
                            label: 'Dimensions',
                            labelAlign: 'right',
                            collapsedByDefault: true,
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
                                      type: 'textField',
                                      id: nanoid(),
                                      label: "Height",
                                      width: 85,
                                      propertyName: "headerStyles.dimensions.height",
                                      icon: "heightIcon",
                                      tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"
                                    },
                                    {
                                      type: 'textField',
                                      id: nanoid(),
                                      label: "Min Height",
                                      width: 85,
                                      hideLabel: true,
                                      propertyName: "headerStyles.dimensions.minHeight",
                                      icon: "minHeightIcon",
                                    },
                                    {
                                      type: 'textField',
                                      id: nanoid(),
                                      label: "Max Height",
                                      width: 85,
                                      hideLabel: true,
                                      propertyName: "headerStyles.dimensions.maxHeight",
                                      icon: "maxHeightIcon",
                                    }
                                  ]
                                })
                                .toJson()]
                            }
                          })
                          .addCollapsiblePanel({
                            id: nanoid(),
                            propertyName: 'pnlBorderStyle',
                            label: 'Border',
                            labelAlign: 'right',
                            collapsedByDefault: true,
                            ghost: true,
                            parentId: styleRouterId,
                            hidden: {
                              _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.ghost)' +
                                ' || getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.accentStyle)' +
                                ' || getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.isSimpleDesign);',
                              _mode: 'code', _value: false
                            } as any,
                            content: {
                              id: nanoid(),
                              components: [...new DesignerToolbarSettings()
                                .addContainer({
                                  id: nanoid(),
                                  parentId: styleRouterId,
                                  components: getBorderInputs('headerStyles', true) as any
                                })
                                .toJson()]
                            }
                          })
                          .addCollapsiblePanel({
                            id: nanoid(),
                            propertyName: 'pnlBackgroundStyle',
                            label: 'Background',
                            labelAlign: 'right',
                            collapsedByDefault: true,
                            ghost: true,
                            hidden: { _code: 'return  getSettingValue(data?.ghost) || getSettingValue(data?.isSimpleDesign);', _mode: 'code', _value: false } as any,
                            parentId: styleRouterId,
                            collapsible: 'header',
                            content: {
                              id: nanoid(),
                              components: [...new DesignerToolbarSettings()
                                .addSettingsInput({
                                  id: nanoid(),
                                  parentId: styleRouterId,
                                  label: "Type",
                                  jsSetting: false,
                                  propertyName: "headerStyles.background.type",
                                  inputType: "radio",
                                  tooltip: "Select a type of background",
                                  buttonGroupOptions: [
                                    {
                                      value: "color",
                                      icon: "FormatPainterOutlined",
                                      title: "Color"
                                    },
                                    {
                                      value: "gradient",
                                      icon: "BgColorsOutlined",
                                      title: "Gradient"
                                    },
                                    {
                                      value: "image",
                                      icon: "PictureOutlined",
                                      title: "Image"
                                    },
                                    {
                                      value: "url",
                                      icon: "LinkOutlined",
                                      title: "URL"
                                    },
                                    {
                                      value: "storedFile",
                                      icon: "DatabaseOutlined",
                                      title: "Stored File"
                                    }
                                  ],
                                })
                                .addSettingsInputRow({
                                  id: nanoid(),
                                  parentId: styleRouterId,
                                  inputs: [{
                                    type: 'colorPicker',
                                    id: nanoid(),
                                    label: "Color",
                                    propertyName: "headerStyles.background.color",
                                    hideLabel: true,
                                    jsSetting: false,
                                  }],
                                  hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.headerStyles?.background?.type) !== "color";', _mode: 'code', _value: false } as any,
                                })
                                .addSettingsInputRow({
                                  id: nanoid(),
                                  parentId: styleRouterId,
                                  inputs: [{
                                    type: 'multiColorPicker',
                                    id: nanoid(),
                                    propertyName: "headerStyles.background.gradient.colors",
                                    label: "Colors",
                                    jsSetting: false,
                                  }
                                  ],
                                  hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.headerStyles?.background?.type) !== "gradient";', _mode: 'code', _value: false } as any,
                                  hideLabel: true,
                                })
                                .addSettingsInputRow({
                                  id: nanoid(),
                                  parentId: styleRouterId,
                                  inputs: [{
                                    type: 'textField',
                                    id: nanoid(),
                                    propertyName: "headerStyles.background.url",
                                    jsSetting: false,
                                    label: "URL",
                                  }],
                                  hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.headerStyles?.background?.type) !== "url";', _mode: 'code', _value: false } as any,
                                })
                                .addSettingsInputRow({
                                  id: nanoid(),
                                  parentId: styleRouterId,
                                  inputs: [{
                                    type: 'imageUploader',
                                    id: nanoid(),
                                    propertyName: 'headerStyles.background.uploadFile',
                                    label: "Image",
                                    jsSetting: false,
                                  }],
                                  hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.headerStyles?.background?.type) !== "image";', _mode: 'code', _value: false } as any,
                                })
                                .addSettingsInputRow({
                                  id: nanoid(),
                                  parentId: styleRouterId,
                                  hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.headerStyles?.background?.type) !== "storedFile";', _mode: 'code', _value: false } as any,
                                  inputs: [
                                    {
                                      type: 'textField',
                                      id: nanoid(),
                                      jsSetting: false,
                                      propertyName: "headerStyles.background.storedFile.id",
                                      label: "File ID"
                                    }
                                  ]
                                })
                                .addSettingsInputRow({
                                  id: nanoid(),
                                  parentId: styleRouterId,
                                  inline: true,
                                  hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.headerStyles?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                                  inputs: [
                                    {
                                      type: 'customDropdown',
                                      id: nanoid(),
                                      label: "Size",
                                      hideLabel: true,
                                      propertyName: "headerStyles.background.size",
                                      dropdownOptions: sizeOptions
                                    },
                                    {
                                      type: 'customDropdown',
                                      id: nanoid(),
                                      label: "Position",
                                      hideLabel: true,
                                      propertyName: "headerStyles.background.position",
                                      dropdownOptions: positionOptions,
                                    },
                                  ]
                                })
                                .addSettingsInputRow({
                                  id: nanoid(),
                                  parentId: styleRouterId,
                                  inputs: [{
                                    type: 'radio',
                                    id: nanoid(),
                                    label: 'Repeat',
                                    hideLabel: true,
                                    propertyName: 'headerStyles.background.repeat',
                                    inputType: 'radio',
                                    buttonGroupOptions: repeatOptions,
                                  }],
                                  hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.headerStyles?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                                })
                                .toJson()
                              ]
                            }
                          })
                          .addCollapsiblePanel({
                            id: nanoid(),
                            propertyName: 'stylingBox',
                            label: 'Margin and Padding',
                            labelAlign: 'right',
                            ghost: true,
                            parentId: styleRouterId,
                            collapsible: 'header',
                            content: {
                              id: nanoid(),
                              components: [...new DesignerToolbarSettings()
                                .addStyleBox({
                                  id: nanoid(),
                                  label: 'Margin Padding',
                                  hideLabel: true,
                                  propertyName: 'headerStyles.stylingBox',
                                })
                                .toJson()]
                            }
                          })
                          .addCollapsiblePanel({
                            id: nanoid(),
                            propertyName: 'customStyle',
                            label: 'Custom Styles',
                            labelAlign: 'right',
                            collapsedByDefault: true,
                            ghost: true,
                            parentId: styleRouterId,
                            collapsible: 'header',
                            content: {
                              id: nanoid(),
                              components: [...new DesignerToolbarSettings()
                                .addSettingsInput({
                                  id: nanoid(),
                                  inputType: 'codeEditor',
                                  propertyName: 'headerStyles.style',
                                  hideLabel: false,
                                  label: 'Style',
                                  description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                                })
                                .toJson()]
                            }
                          })
                          .toJson()]
                      }
                    })
                    .toJson()]
              }).toJson()]
          },
          {
            key: '3',
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