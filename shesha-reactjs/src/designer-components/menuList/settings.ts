import { nanoid } from "@/utils/uuid";
import { FormLayout } from 'antd/lib/form/Form';
import { DesignerToolbarSettings } from "@/index";
import { fontTypes, fontWeights } from '../_settings/utils/font/utils';
import { getBorderInputs, getCornerInputs } from '../_settings/utils/border/utils';
import { backgroundTypeOptions, positionOptions, repeatOptions, sizeOptions } from '../_settings/utils/background/utils';

export const getSettings = (data: any) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const appearanceTabId = nanoid();
  const styleRouterId = nanoid();
  const pnlFontStyleId = nanoid();

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
              .addSettingsInputRow({
                id: nanoid(),
                parentId: commonTabId,
                inputs: [
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'hidden',
                    label: 'Hidden',
                    jsSetting: true,
                  }
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: commonTabId,
                inputs: [
                  {
                    type: 'dropdown',
                    id: nanoid(),
                    propertyName: 'overflow',
                    label: 'Overflow',
                    jsSetting: true,
                    dropdownOptions: [
                      { label: 'Dropdown', value: 'dropdown' },
                      { label: 'Menu', value: 'menu' },
                      { label: 'Scroll', value: 'scroll' }
                    ]
                  }
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .toJson()
            ]
          },
          {
            key: 'appearance',
            title: 'Appearance',
            id: appearanceTabId,
            components: [
              ...new DesignerToolbarSettings()
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
                        propertyName: 'pnlFontStyle',
                        label: 'Font',
                        labelAlign: 'right',
                        parentId: styleRouterId,
                        ghost: true,
                        collapsible: 'header',
                        content: {
                          id: pnlFontStyleId,
                          components: [...new DesignerToolbarSettings()
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: pnlFontStyleId,
                              inline: true,
                              propertyName: 'font',
                              inputs: [
                                {
                                  type: 'dropdown',
                                  id: `fontFamily-${styleRouterId}`,
                                  label: 'Family',
                                  propertyName: 'font.type',
                                  hideLabel: true,
                                  dropdownOptions: fontTypes,
                                },
                                {
                                  type: 'numberField',
                                  id: `fontSize-${styleRouterId}`,
                                  label: 'Size',
                                  propertyName: 'font.size',
                                  hideLabel: true,
                                  width: 50,
                                },
                                {
                                  type: 'dropdown',
                                  id: `fontWeight-${styleRouterId}`,
                                  label: 'Weight',
                                  propertyName: 'font.weight',
                                  hideLabel: true,
                                  tooltip: "Controls text thickness (light, normal, bold, etc.)",
                                  dropdownOptions: fontWeights,
                                  width: 100,
                                },
                                // {
                                //   type: 'colorPicker',
                                //   id: `fontColor-${styleRouterId}`,
                                //   label: 'Color',
                                //   hideLabel: true,
                                //   propertyName: 'font.color',
                                // },
                                // {
                                //   type: 'dropdown',
                                //   id: `fontAlign-${styleRouterId}`,
                                //   label: 'Align',
                                //   propertyName: 'font.align',
                                //   hideLabel: true,
                                //   width: 60,
                                //   dropdownOptions: textAlign,
                                // },
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
                        propertyName: 'pnlMenuSpecific',
                        label: 'Menu Specific',
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
                              inputs: [
                                {
                                  type: 'numberField',
                                  id: nanoid(),
                                  propertyName: 'gap',
                                  label: 'Gap',
                                  jsSetting: true,
                                  min: 1,
                                  max: 100,
                                  defaultValue: 12
                                }
                              ],
                              readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .toJson()
                          ]
                        }
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'pnlColors',
                        label: 'Colors',
                        parentId: styleRouterId,
                        labelAlign: 'right',
                        ghost: true,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [...new DesignerToolbarSettings()
                            // .addSectionSeparator({
                            //   id: nanoid(),
                            //   parentId: styleRouterId,
                            //   label: 'Selected Item'
                            // })
                            .addCollapsiblePanel({
                              id: nanoid(),
                              propertyName: 'pnlSelectedItem',
                              label: 'Selected Item',
                              parentId: styleRouterId,
                              labelAlign: 'right',
                              ghost: true,
                              collapsible: 'header',
                              content: {
                                id: nanoid(),
                                components: [
                                  ...new DesignerToolbarSettings()
                                    .addSettingsInputRow({
                                      id: nanoid(),
                                      parentId: styleRouterId,
                                      inputs: [
                                        {
                                          type: 'colorPicker',
                                          id: nanoid(),
                                          propertyName: 'selectedItemColor',
                                          label: 'Selected Item Color',
                                          jsSetting: true,
                                          allowClear: true
                                        },
                                        {
                                          type: 'colorPicker',
                                          id: nanoid(),
                                          propertyName: 'selectedItemBackground',
                                          label: 'Selected Item Background',
                                          jsSetting: true,
                                          allowClear: true
                                        }
                                      ],
                                      readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                    })
                                    .toJson()
                                ]
                              }
                            })
                            .addCollapsiblePanel({
                              id: nanoid(),
                              propertyName: 'pnlDefaultItem',
                              label: 'Default Item',
                              parentId: styleRouterId,
                              labelAlign: 'right',
                              ghost: true,
                              collapsible: 'header',
                              content: {
                                id: nanoid(),
                                components: [
                                  ...new DesignerToolbarSettings()
                                    .addSettingsInputRow({
                                      id: nanoid(),
                                      parentId: styleRouterId,
                                      inputs: [
                                        {
                                          type: 'colorPicker',
                                          id: nanoid(),
                                          propertyName: 'itemColor',
                                          label: 'Item Color',
                                          jsSetting: true,
                                          allowClear: true
                                        },
                                        {
                                          type: 'colorPicker',
                                          id: nanoid(),
                                          propertyName: 'itemBackground',
                                          label: 'Item Background',
                                          jsSetting: true,
                                          allowClear: true
                                        }
                                      ],
                                      readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                    })
                                    .toJson()
                                ]
                              }
                            })
                            .addCollapsiblePanel({
                              id: nanoid(),
                              propertyName: 'pnlHoverItem',
                              label: 'Hover Item',
                              parentId: styleRouterId,
                              labelAlign: 'right',
                              ghost: true,
                              collapsible: 'header',
                              content: {
                                id: nanoid(),
                                components: [
                                  ...new DesignerToolbarSettings()
                                    .addSettingsInputRow({
                                      id: nanoid(),
                                      parentId: styleRouterId,
                                      inputs: [
                                        {
                                          type: 'colorPicker',
                                          id: nanoid(),
                                          propertyName: 'hoverItemColor',
                                          label: 'Hover Item Color',
                                          jsSetting: true,
                                          allowClear: true
                                        },
                                        {
                                          type: 'colorPicker',
                                          id: nanoid(),
                                          propertyName: 'hoverItemBackground',
                                          label: 'Hover Background Color',
                                          jsSetting: true,
                                          allowClear: true
                                        }
                                      ],
                                      readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                    })
                                    .toJson()
                                ]
                              }
                            })
                            .toJson()
                          ]
                        }
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'pnlCustomStyle',
                        label: 'Custom Styles',
                        parentId: styleRouterId,
                        labelAlign: 'right',
                        ghost: true,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                              id: nanoid(),
                              inputType: 'codeEditor',
                              propertyName: 'style',
                              label: 'Style',
                              mode: 'dialog',
                              description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                              readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInput({
                              id: nanoid(),
                              inputType: 'codeEditor',
                              propertyName: 'styleOnHover',
                              label: 'Style On Hover',
                              mode: 'dialog',
                              description: 'A script that returns the hover style of the element as an object. This should conform to CSSProperties',
                              readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInput({
                              id: nanoid(),
                              inputType: 'codeEditor',
                              propertyName: 'styleOnSelected',
                              label: 'Style On Selected',
                              mode: 'dialog',
                              description: 'A script that returns the selected style of the element as an object. This should conform to CSSProperties',
                              readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInput({
                              id: nanoid(),
                              inputType: 'codeEditor',
                              propertyName: 'styleOnSubMenu',
                              label: 'Style On Sub Menu',
                              mode: 'dialog',
                              description: 'A script that returns the sub menu style of the element as an object. This should conform to CSSProperties',
                              readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
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