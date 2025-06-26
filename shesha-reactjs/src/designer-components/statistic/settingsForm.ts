import { DesignerToolbarSettings } from "@/index";
import { nanoid } from "@/utils/uuid";
import { FormLayout } from "antd/lib/form/Form";
import { getBorderInputs, getCornerInputs } from "../_settings/utils/border/utils";
import { fontTypes, fontWeights, textAlign } from "../_settings/utils/font/utils";
import { repeatOptions, positionOptions, sizeOptions } from "../_settings/utils/background/utils";

export const getSettings = (data: any) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const appearanceId = nanoid();
  const securityId = nanoid();
  const eventsId = nanoid();
  const styleRouterId = nanoid();
  const pnlFontStyleId = nanoid();
  const dimensionsStylePnlId = nanoid();
  const backgroundStylePnlId = nanoid();

  const shadowStylePnlId = nanoid();

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
                  "required": true
                },
                jsSetting: true,
                styledLabel: true,
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: commonTabId,
                inputs: [
                  {
                    type: 'textField',
                    id: nanoid(),
                    propertyName: 'title',
                    label: 'Title',
                    jsSetting: true,
                    value: 'Statistic',
                  },
                  {
                    type: 'textField',
                    id: nanoid(),
                    propertyName: 'placeholder',
                    label: 'Placeholder',
                    jsSetting: true,
                  }
                ]
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: commonTabId,
                inputs: [
                  {
                    type: 'numberField',
                    id: nanoid(),
                    propertyName: 'value',
                    label: 'Value',
                    jsSetting: true,
                    description: 'The value to display in the statistic. This value will will only override if there is no binding to the property name.',
                  },
                  {
                    type: 'numberField',
                    id: nanoid(),
                    propertyName: 'precision',
                    label: 'Precision',
                    jsSetting: true,
                    min: 0,
                  }
                ],
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: commonTabId,
                inputs: [
                  {
                    type: 'textField',
                    id: nanoid(),
                    propertyName: 'prefix',
                    label: 'Prefix',
                    jsSetting: true,
                  },
                  {
                    type: 'iconPicker',
                    id: nanoid(),
                    propertyName: 'prefixIcon',
                    label: 'Prefix Icon',
                    jsSetting: true,
                  },
                ],
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: commonTabId,
                inputs: [
                  {
                    type: 'textField',
                    id: nanoid(),
                    propertyName: 'suffix',
                    label: 'Suffix',
                    jsSetting: true,
                  },
                  {
                    type: 'iconPicker',
                    id: nanoid(),
                    propertyName: 'suffixIcon',
                    label: 'Suffix Icon',
                    jsSetting: true,
                  },
                ],
              })
              .toJson()
            ]
          },
          {
            key: 'events',
            title: 'Events',
            id: eventsId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                id: nanoid(),
                inputType: 'codeEditor',
                propertyName: 'onClickCustom',
                label: 'On Click',
                labelAlign: 'right',
                tooltip: 'Enter custom eventhandler on click of event.',
                parentId: eventsId
              })
              .toJson()
            ]
          },
          {
            key: 'appearance',
            title: 'Appearance',
            id: appearanceId,
            components: [
              ...new DesignerToolbarSettings()
                .addPropertyRouter({
                  id: styleRouterId,
                  propertyName: 'propertyRouter1',
                  componentName: 'propertyRouter',
                  label: 'Property router1',
                  labelAlign: 'right',
                  parentId: appearanceId,
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
                        propertyName: 'titleStyle',
                        label: 'Title Font',
                        labelAlign: 'right',
                        ghost: true,
                        parentId: styleRouterId,
                        collapsible: 'header',
                        collapsedByDefault: true,
                        content: {
                          id: nanoid(),
                          components: [...new DesignerToolbarSettings()
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: pnlFontStyleId,
                              inline: true,
                              propertyName: 'titleFont',
                              inputs: [
                                {
                                  type: 'dropdown',
                                  id: `fontFamily-${styleRouterId}`,
                                  label: 'Family',
                                  propertyName: 'titleFont.type',
                                  hideLabel: true,
                                  dropdownOptions: fontTypes,
                                },
                                {
                                  type: 'numberField',
                                  id: `fontSize-${styleRouterId}`,
                                  label: 'Size',
                                  propertyName: 'titleFont.size',
                                  hideLabel: true,
                                  width: 50,
                                },
                                {
                                  type: 'dropdown',
                                  id: `fontWeight-${styleRouterId}`,
                                  label: 'Weight',
                                  propertyName: 'titleFont.weight',
                                  hideLabel: true,
                                  dropdownOptions: fontWeights,
                                  width: 100,
                                },
                                {
                                  type: 'colorPicker',
                                  id: `fontColor-${styleRouterId}`,
                                  label: 'Color',
                                  hideLabel: true,
                                  propertyName: 'titleFont.color',
                                },
                                {
                                  type: 'dropdown',
                                  id: `fontAlign-${styleRouterId}`,
                                  label: 'Align',
                                  propertyName: 'titleFont.align',
                                  hideLabel: true,
                                  width: 60,
                                  dropdownOptions: textAlign,
                                },
                              ],
                            })
                            .addSettingsInput({
                              id: nanoid(),
                              inputType: 'codeEditor',
                              propertyName: 'titleStyle',
                              hideLabel: false,
                              label: 'Custom Styles',
                              description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                            })
                            .toJson()
                          ]
                        }
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'valueStyle',
                        label: 'Value Font',
                        labelAlign: 'right',
                        ghost: true,
                        parentId: styleRouterId,
                        collapsible: 'header',
                        collapsedByDefault: true,
                        content: {
                          id: nanoid(),
                          components: [...new DesignerToolbarSettings()
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: pnlFontStyleId,
                              inline: true,
                              propertyName: 'valueFont',
                              label: 'Value Font',
                              inputs: [
                                {
                                  type: 'dropdown',
                                  id: `fontFamily-${styleRouterId}`,
                                  label: 'Family',
                                  propertyName: 'valueFont.type',
                                  hideLabel: true,
                                  dropdownOptions: fontTypes,
                                },
                                {
                                  type: 'numberField',
                                  id: `fontSize-${styleRouterId}`,
                                  label: 'Size',
                                  propertyName: 'valueFont.size',
                                  hideLabel: true,
                                  width: 50,
                                },
                                {
                                  type: 'dropdown',
                                  id: `fontWeight-${styleRouterId}`,
                                  label: 'Weight',
                                  propertyName: 'valueFont.weight',
                                  hideLabel: true,
                                  dropdownOptions: fontWeights,
                                  width: 100,
                                },
                                {
                                  type: 'colorPicker',
                                  id: `fontColor-${styleRouterId}`,
                                  label: 'Color',
                                  hideLabel: true,
                                  propertyName: 'valueFont.color',
                                },
                                {
                                  type: 'dropdown',
                                  id: `fontAlign-${styleRouterId}`,
                                  label: 'Align',
                                  propertyName: 'valueFont.align',
                                  hideLabel: true,
                                  width: 60,
                                  dropdownOptions: textAlign,
                                },
                              ],
                            })
                            .addSettingsInput({
                              id: nanoid(),
                              inputType: 'codeEditor',
                              propertyName: 'valueStyle',
                              hideLabel: false,
                              label: 'Custom Styles',
                              description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                            })
                            .toJson()
                          ]
                        }
                      })
                      .addCollapsiblePanel({
                        id: 'dimensionsStyleCollapsiblePanel',
                        propertyName: 'pnlDimensions',
                        label: 'Dimensions',
                        parentId: styleRouterId,
                        labelAlign: 'right',
                        ghost: true,
                        collapsible: 'header',
                        collapsedByDefault: true,
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
                                  id: `width-${styleRouterId}`,
                                  label: "Width",
                                  width: 85,
                                  propertyName: "dimensions.width",
                                  icon: "widthIcon",
                                  tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"
                                },
                                {
                                  type: 'textField',
                                  id: `minWidth-${styleRouterId}`,
                                  label: "Min Width",
                                  width: 85,
                                  hideLabel: true,
                                  propertyName: "dimensions.minWidth",
                                  icon: "minWidthIcon",
                                },
                                {
                                  type: 'textField',
                                  id: `maxWidth-${styleRouterId}`,
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
                                  id: `height-${dimensionsStylePnlId}`,
                                  label: "Height",
                                  width: 85,
                                  propertyName: "dimensions.height",
                                  icon: "heightIcon",
                                  tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"
                                },
                                {
                                  type: 'textField',
                                  id: `minHeight-${dimensionsStylePnlId}`,
                                  label: "Min Height",
                                  width: 85,
                                  hideLabel: true,
                                  propertyName: "dimensions.minHeight",
                                  icon: "minHeightIcon",
                                },
                                {
                                  type: 'textField',
                                  id: `maxHeight-${dimensionsStylePnlId}`,
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
                        hidden: false,
                        collapsedByDefault: true,
                        content: {
                          id: 'borderStylePnl',
                          components: [...new DesignerToolbarSettings()
                            .addContainer({
                              id: 'borderStyleRow',
                              parentId: 'borderStylePnl',
                              components: getBorderInputs() as any
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
                        id: nanoid(),
                        propertyName: 'pnlBackgroundStyle',
                        label: 'Background',
                        labelAlign: 'right',
                        ghost: true,
                        parentId: styleRouterId,
                        collapsible: 'header',
                        collapsedByDefault: true,
                        content: {
                          id: backgroundStylePnlId,
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInput({
                                id: `${backgroundStylePnlId}-type`,
                                parentId: backgroundStylePnlId,
                                label: "Type",
                                jsSetting: false,
                                propertyName: "background.type",
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
                                id: `${backgroundStylePnlId}-color`,
                                parentId: backgroundStylePnlId,
                                inputs: [{
                                  type: 'colorPicker',
                                  id: nanoid(),
                                  label: "Color",
                                  propertyName: "background.color",
                                  hideLabel: true,
                                  jsSetting: false,
                                }],
                                hidden: { _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "color";', _mode: 'code', _value: false } as any,
                              })
                              .addSettingsInputRow({
                                id: `${backgroundStylePnlId}-gradient`,
                                parentId: backgroundStylePnlId,
                                inputs: [{
                                  type: 'multiColorPicker',
                                  id: nanoid(),
                                  propertyName: "background.gradient.colors",
                                  label: "Colors",
                                  jsSetting: false,
                                }
                                ],
                                hidden: { _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "gradient";', _mode: 'code', _value: false } as any,
                                hideLabel: true,
                              })
                              .addSettingsInputRow({
                                id: `${backgroundStylePnlId}-url`,
                                parentId: backgroundStylePnlId,
                                inputs: [{
                                  type: 'textField',
                                  id: nanoid(),
                                  propertyName: "background.url",
                                  jsSetting: false,
                                  label: "URL",
                                }],
                                hidden: { _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "url";', _mode: 'code', _value: false } as any,
                              })
                              .addSettingsInputRow({
                                id: `${backgroundStylePnlId}-image`,
                                parentId: backgroundStylePnlId,
                                inputs: [{
                                  type: 'imageUploader',
                                  id: 'backgroundStyle-image',
                                  propertyName: 'background.uploadFile',
                                  label: "Image",
                                  jsSetting: false,
                                }],
                                hidden: { _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "image";', _mode: 'code', _value: false } as any,
                              })
                              .addSettingsInputRow({
                                id: `${backgroundStylePnlId}-storedFile`,
                                parentId: backgroundStylePnlId,
                                hidden: { _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "storedFile";', _mode: 'code', _value: false } as any,
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
                                hidden: { _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                                inputs: [
                                  {
                                    type: 'customDropdown',
                                    id: 'backgroundStyleRow-size',
                                    label: "Size",
                                    hideLabel: true,
                                    propertyName: "background.size",
                                    customTooltip: 'Size of the background image, two space separated values with units e.g "100% 100px"',
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
                                  }
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
                                hidden: { _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
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
                        collapsedByDefault: true,
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
                                  label: 'H-Offset',
                                  hideLabel: true,
                                  width: 80,
                                  icon: "offsetHorizontalIcon",
                                  propertyName: 'shadow.offsetX',
                                  tooltip: 'OffsetX. The larger the value, the bigger the shadow',
                                  description: 'OffsetX. The larger the value, the bigger the shadow',
                                },
                                {
                                  type: 'numberField',
                                  id: nanoid(),
                                  label: 'V-Offset',
                                  hideLabel: true,
                                  width: 80,
                                  icon: 'offsetVerticalIcon',
                                  propertyName: 'shadow.offsetY',
                                  description: 'OffsetY. The larger the value, the bigger the shadow',
                                },
                                {
                                  type: 'numberField',
                                  id: nanoid(),
                                  label: 'Blur',
                                  hideLabel: true,
                                  width: 80,
                                  icon: 'blurIcon',
                                  propertyName: 'shadow.blurRadius',
                                  description: 'Blur. The larger the value, the bigger the blur',
                                },
                                {
                                  type: 'numberField',
                                  id: nanoid(),
                                  label: 'Spread',
                                  hideLabel: true,
                                  width: 80,
                                  icon: 'spreadIcon',
                                  propertyName: 'shadow.spreadRadius',
                                  description: 'Spread. The larger the value, the bigger the spread',
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
                        collapsedByDefault: true,
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
                        propertyName: 'style',
                        label: 'Custom Styles',
                        labelAlign: 'right',
                        ghost: true,
                        parentId: styleRouterId,
                        collapsible: 'header',
                        collapsedByDefault: true,
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
                      .toJson(),
                  ]
                })
                .toJson()
            ]
          },
          {
            key: 'security',
            title: 'Security',
            id: securityId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                id: nanoid(),
                inputType: 'permissions',
                propertyName: 'permissions',
                label: 'Permissions',
                size: 'small',
                parentId: securityId
              })
              .toJson()
            ]
          },
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
