import { DesignerToolbarSettings } from "@/index";
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';
import { fontTypes, fontWeightsOptions, textAlignOptions } from '../_settings/utils/font/utils';
import { getBorderInputs, getCornerInputs } from '../_settings/utils/border/utils';
import { backgroundTypeOptions, positionOptions, repeatOptions, sizeOptions } from '../_settings/utils/background/utils';

export const getSettings = (data: any) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const validationTabId = nanoid();
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
              .addSettingsInputRow({
                id: nanoid(),
                parentId: commonTabId,
                inputs: [
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
            title: 'Validation',
            id: validationTabId,
            components: [...new DesignerToolbarSettings()
              .toJson()
            ]
          },
          {
            key: '3',
            title: 'Events',
            id: eventsTabId,
            components: [...new DesignerToolbarSettings()
              .toJson()
            ]
          },
          {
            key: '4',
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
                      parentId: commonTabId,
                      inputs: [
                        {
                          type: 'dropdown',
                          id: nanoid(),
                          propertyName: 'overflow',
                          label: 'Overflow',
                          size: 'small',
                          jsSetting: true,
                          dropdownOptions: [
                            { label: 'Dropdown', value: 'dropdown' },
                            { label: 'Menu', value: 'menu' },
                            { label: 'Scroll', value: 'scroll' },
                          ],
                        },
                      ],
                    })
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
                          // Menu-specific style properties
                          .addSettingsInput({
                            id: nanoid(),
                            inputType: 'codeEditor',
                            propertyName: 'style',
                            label: 'Style',
                            description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                          })
                          .addSettingsInput({
                            id: nanoid(),
                            inputType: 'codeEditor',
                            propertyName: 'styleOnHover',
                            label: 'Style On Hover',
                            description: 'Style applied when menu item is hovered',
                          })
                          .addSettingsInput({
                            id: nanoid(),
                            inputType: 'codeEditor',
                            propertyName: 'styleOnSelected',
                            label: 'Style On Selected',
                            description: 'Style applied when menu item is selected',
                          })
                          .addSettingsInput({
                            id: nanoid(),
                            inputType: 'codeEditor',
                            propertyName: 'styleOnSubMenu',
                            label: 'Style On Sub Menu',
                            description: 'Style applied to submenu items',
                          })
                          // Menu color properties
                          .addColorPicker({
                            id: nanoid(),
                            propertyName: 'selectedItemColor',
                            label: 'Selected Item Color',
                            allowClear: true,
                            jsSetting: true,
                          })
                          .addColorPicker({
                            id: nanoid(),
                            propertyName: 'selectedItemBackground',
                            label: 'Selected Item Background',
                            allowClear: true,
                            jsSetting: true,
                          })
                          .addColorPicker({
                            id: nanoid(),
                            propertyName: 'itemColor',
                            label: 'Item Color',
                            allowClear: true,
                            jsSetting: true,
                          })
                          .addColorPicker({
                            id: nanoid(),
                            propertyName: 'itemBackground',
                            label: 'Item Background',
                            allowClear: true,
                            jsSetting: true,
                          })
                          .addColorPicker({
                            id: nanoid(),
                            propertyName: 'hoverItemColor',
                            label: 'Hover Item Color',
                            allowClear: true,
                            jsSetting: true,
                          })
                          .addColorPicker({
                            id: nanoid(),
                            propertyName: 'hoverItemBackground',
                            label: 'Hover Background Color',
                            allowClear: true,
                            jsSetting: true,
                          })
                          .toJson()
                        ]
                      }
                    })
                    .toJson()
                ]
              }).toJson()
            ]
          },
          {
            key: '5',
            title: 'Security',
            id: securityTabId,
            components: [...new DesignerToolbarSettings()
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