import { DesignerToolbarSettings } from "@/index";
import { nanoid } from "@/utils/uuid";
import { FormLayout } from "antd/lib/form/Form";
import { getBorderInputs, getCornerInputs } from "../_settings/utils/border/utils";

export const getSettings = (data: any) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const dataId = nanoid();
  const appearanceId = nanoid();
  const chartSettingsId = nanoid();
  const styleRouterId = nanoid();
  const dimensionsStylePnlId = nanoid();
  const borderStylePnlId = nanoid();
  const borderStyleRowId = nanoid();
  const backgroundStylePnlId = nanoid();
  const dataSettingsId = nanoid();
  const dataSettingsForUrlId = nanoid();

  const propertyNameId = nanoid();
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
                id: propertyNameId,
                propertyName: "propertyName",
                parentId: commonTabId,
                label: "Property Name",
                size: "small",
                validate: {
                  "required": true
                },
                styledLabel: true,
                jsSetting: true,
              })
              .addLabelConfigurator({
                id: nanoid(),
                propertyName: 'hideLabel',
                label: 'Label',
                parentId: commonTabId,
                hideLabel: true,
              })
              .toJson()
            ]
          },
          {
            key: 'data',
            title: 'Data',
            id: dataId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  id: nanoid(),
                  propertyName: 'validate.required',
                  label: 'Required',
                  inputType: 'switch',
                  size: 'small',
                  layout: 'horizontal',
                  jsSetting: true,
                  parentId: dataId
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: dataId,
                  inputs: [
                    {
                      type: 'number',
                      id: nanoid(),
                      propertyName: 'validate.minLength',
                      label: 'Min Length',
                      size: 'small',
                      jsSetting: true,
                    },
                    {
                      type: 'number',
                      id: nanoid(),
                      propertyName: 'validate.maxLength',
                      label: 'Max Length',
                      size: 'small',
                      jsSetting: true,
                    },
                  ],
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: dataId,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: "validate.message",
                      parentId: dataId,
                      label: "Message",
                      validate: {},
                      version: 3,
                      type: "text",
                      jsSetting: true,
                    },
                    {
                      type: 'codeEditor',
                      id: nanoid(),
                      propertyName: 'validate.validator',
                      label: 'Validator',
                      labelAlign: 'right',
                      tooltip: 'Enter custom validator logic for form.item rules. Returns a Promise',
                    }
                  ],
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                })
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: "spellCheck",
                  parentId: dataId,
                  label: "Spell Check",
                  version: 3,
                  inputType: "switch",
                  jsSetting: true,
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
                        id: 'dimensionsStyleCollapsiblePanel',
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
                              readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                              inputs: [
                                {
                                  type: 'text',
                                  id: `width-${styleRouterId}`,
                                  label: "Width",
                                  width: 85,
                                  propertyName: "dimensions.width",
                                  icon: "widthIcon",
                                  tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"
                                },
                                {
                                  type: 'text',
                                  id: `minWidth-${styleRouterId}`,
                                  label: "Min Width",
                                  width: 85,
                                  hideLabel: true,
                                  propertyName: "dimensions.minWidth",
                                  icon: "minWidthIcon",
                                },
                                {
                                  type: 'text',
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
                              readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                              inputs: [
                                {
                                  type: 'text',
                                  id: `height-${dimensionsStylePnlId}`,
                                  label: "Height",
                                  width: 85,
                                  propertyName: "dimensions.height",
                                  icon: "heightIcon",
                                  tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"
                                },
                                {
                                  type: 'text',
                                  id: `minHeight-${dimensionsStylePnlId}`,
                                  label: "Min Height",
                                  width: 85,
                                  hideLabel: true,
                                  propertyName: "dimensions.minHeight",
                                  icon: "minHeightIcon",
                                },
                                {
                                  type: 'text',
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
                        content: {
                          id: borderStylePnlId,
                          components: [...new DesignerToolbarSettings()
                            .addSettingsInputRow({
                              id: borderStyleRowId,
                              parentId: borderStylePnlId,
                              hidden: {
                                _code: 'return !getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.border?.hideBorder);', _mode: 'code', _value: false
                              } as any,
                              readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                              inputs: [
                                {
                                  type: 'button',
                                  id: `${borderStyleRowId}-hideBorder`,
                                  label: "Border",
                                  hideLabel: true,
                                  propertyName: "border.hideBorder",
                                  icon: "EyeOutlined",
                                  iconAlt: "EyeInvisibleOutlined"
                                },
                              ]
                            })
                            .addSettingsInputRow(
                              getBorderInputs()[0] as any
                            )
                            .addSettingsInputRow(
                              getBorderInputs()[1] as any
                            )
                            .addSettingsInputRow(
                              getBorderInputs()[2] as any
                            )
                            .addSettingsInputRow(
                              getBorderInputs()[3] as any
                            )
                            .addSettingsInputRow(
                              getBorderInputs()[4] as any
                            )
                            .addSettingsInputRow(
                              getCornerInputs()[0] as any
                            )
                            .addSettingsInputRow(
                              getCornerInputs()[1] as any
                            )
                            .addSettingsInputRow(
                              getCornerInputs()[2] as any
                            )
                            .addSettingsInputRow(
                              getCornerInputs()[3] as any
                            )
                            .addSettingsInputRow(
                              getCornerInputs()[4] as any
                            )
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
                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                              })
                              .addSettingsInputRow({
                                id: `${backgroundStylePnlId}-color`,
                                parentId: backgroundStylePnlId,
                                inputs: [{
                                  type: 'color',
                                  id: nanoid(),
                                  label: "Color",
                                  propertyName: "background.color",
                                  hideLabel: true,
                                  jsSetting: false,
                                }],
                                hidden: { _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "color";', _mode: 'code', _value: false } as any,
                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
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
                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                              })
                              .addSettingsInputRow({
                                id: `${backgroundStylePnlId}-url`,
                                parentId: backgroundStylePnlId,
                                inputs: [{
                                  type: 'text',
                                  id: nanoid(),
                                  propertyName: "background.url",
                                  jsSetting: false,
                                  label: "URL",
                                }],
                                hidden: { _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "url";', _mode: 'code', _value: false } as any,
                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
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
                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                              })
                              .addSettingsInputRow({
                                id: `${backgroundStylePnlId}-storedFile`,
                                parentId: backgroundStylePnlId,
                                hidden: { _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "storedFile";', _mode: 'code', _value: false } as any,
                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                inputs: [
                                  {
                                    type: 'text',
                                    id: 'backgroundStyle-storedFile',
                                    jsSetting: false,
                                    propertyName: "background.storedFile.id",
                                    label: "File ID"
                                  }
                                ]
                              })
                              .addSettingsInputRow({
                                id: `${backgroundStylePnlId}-controls`,
                                parentId: backgroundStylePnlId,
                                inline: true,
                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
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
                                  },
                                  {
                                    type: 'dropdown',
                                    id: nanoid(),
                                    label: "Repeat",
                                    hideLabel: true,
                                    propertyName: "background.repeat",
                                    dropdownOptions: [
                                      {
                                        value: "repeat",
                                        label: "repeat"
                                      },
                                      {
                                        value: "repeat-x",
                                        label: "repeatX"
                                      },
                                      {
                                        value: "repeat-y",
                                        label: "repeatY"
                                      },
                                      {
                                        value: "no-repeat",
                                        label: "noRepeat"
                                      }
                                    ],
                                  }
                                ]
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
                              readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                              inputs: [
                                {
                                  type: 'number',
                                  id: nanoid(),
                                  label: 'Offset X',
                                  hideLabel: true,
                                  width: 60,
                                  icon: "offsetHorizontalIcon",
                                  propertyName: 'shadow.offsetX',
                                  tooltip: 'OffsetX. The larger the value, the bigger the shadow',
                                },
                                {
                                  type: 'number',
                                  id: nanoid(),
                                  label: 'Offset Y',
                                  hideLabel: true,
                                  width: 60,
                                  icon: 'offsetVerticalIcon',
                                  propertyName: 'shadow.offsetY',
                                  description: 'OffsetY. The larger the value, the bigger the shadow',
                                },
                                {
                                  type: 'number',
                                  id: nanoid(),
                                  label: 'Blur',
                                  hideLabel: true,
                                  width: 60,
                                  icon: 'blurIcon',
                                  propertyName: 'shadow.blurRadius',
                                  description: 'Blur. The larger the value, the bigger the blur',
                                },
                                {
                                  type: 'number',
                                  id: nanoid(),
                                  label: 'Spread',
                                  hideLabel: true,
                                  width: 60,
                                  icon: 'spreadIcon',
                                  propertyName: 'shadow.spreadRadius',
                                  description: 'Spread. The larger the value, the bigger the spread',
                                },
                                {
                                  type: 'color',
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
                        propertyName: 'style',
                        label: 'Custom Style',
                        labelAlign: 'right',
                        ghost: true,
                        parentId: styleRouterId,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                              readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                              id: nanoid(),
                              inputType: 'codeEditor',
                              propertyName: 'style',
                              hideLabel: true,
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
            key: 'chartSettings',
            title: 'Chart Settings',
            id: chartSettingsId,
            components:
              [...new DesignerToolbarSettings()
                .addDropdown({
                  id: nanoid(),
                  propertyName: 'chartType',
                  parentId: 'root',
                  hidden: false,
                  label: 'Chart Type',
                  dataSourceType: 'values',
                  values: [
                    { id: nanoid(), label: 'Pie Chart', value: 'pie' },
                    { id: nanoid(), label: 'Line Chart', value: 'line' },
                    { id: nanoid(), label: 'Bar Chart', value: 'bar' },
                    { id: nanoid(), label: 'Polar Area Chart', value: 'polarArea' },
                  ],
                  validate: { required: true },
                  defaultValue: 'line',
                })
                .addCheckbox({
                  id: nanoid(),
                  propertyName: 'isDoughnut',
                  label: 'Is Doughnut',
                  parentId: 'root',
                  hidden: {
                    _code: "return getSettingValue(data?.chartType) !== `pie`",
                    _mode: "code",
                    _value: true
                  },
                  defaultValue: false,
                })
                .addDropdown({
                  id: nanoid(),
                  propertyName: 'simpleOrPivot',
                  parentId: 'root',
                  hidden: false,
                  label: 'Simple / Pivot',
                  dataSourceType: 'values',
                  values: [
                    { id: nanoid(), label: 'Simple', value: 'simple' },
                    { id: nanoid(), label: 'Pivot', value: 'pivot' }
                  ],
                  validate: { required: true },
                  defaultValue: 'simple',
                })
                .addCheckbox({
                  id: nanoid(),
                  propertyName: 'stacked',
                  label: 'Stacked',
                  parentId: 'root',
                  hidden: {
                    _code: "return !(getSettingValue(data?.chartType) === `bar` && getSettingValue(data?.simpleOrPivot) === `pivot`)",
                    _mode: "code",
                    _value: true
                  },
                  defaultValue: true,
                })
                .addTextField({
                  id: nanoid(),
                  propertyName: 'title',
                  parentId: 'root',
                  hidden: {
                    _code: "return getSettingValue(data?.showTitle) !== true",
                    _mode: "code",
                    _value: false
                  },
                  label: 'Title',
                  description: 'The title of the chart (if any)',
                  labelAlign: 'right',
                })
                .addCheckbox({
                  id: nanoid(),
                  propertyName: 'showTitle',
                  label: 'Show Title',
                  description: 'Show the title of the chart',
                  parentId: 'root',
                })
                .addCheckbox({
                  id: nanoid(),
                  propertyName: 'showLegend',
                  label: 'Show Legend',
                  description: 'Show the legend of the chart. Legend is the area that shows the color and what it represents.',
                  parentId: 'root',
                  defaultValue: true,
                })
                .addDropdown({
                  id: nanoid(),
                  propertyName: 'legendPosition',
                  parentId: 'root',
                  hidden: {
                    _code: "return getSettingValue(data?.showLegend) !== true",
                    _mode: "code",
                    _value: true
                  },
                  label: 'Legend Position',
                  dataSourceType: 'values',
                  values: [
                    { id: nanoid(), label: 'Top', value: 'top' },
                    { id: nanoid(), label: 'Bottom', value: 'bottom' },
                    { id: nanoid(), label: 'Left', value: 'left' },
                    { id: nanoid(), label: 'Right', value: 'right' },
                  ],
                  validate: { required: true },
                  defaultValue: 'top',
                })
                .addCheckbox({
                  id: nanoid(),
                  propertyName: 'showXAxisScale',
                  label: 'Show X Axis',
                  parentId: 'root',
                  defaultValue: true,
                })
                .addCheckbox({
                  id: nanoid(),
                  propertyName: 'showXAxisTitle',
                  label: 'Show X Axis Title',
                  parentId: 'root',
                  defaultValue: true,
                  hidden: {
                    _code: "return getSettingValue(data?.showXAxisScale) !== true",
                    _mode: "code",
                    _value: true
                  },
                })
                .addCheckbox({
                  id: nanoid(),
                  propertyName: 'showYAxisScale',
                  label: 'Show Y Axis',
                  parentId: 'root',
                  defaultValue: true,
                })
                .addCheckbox({
                  id: nanoid(),
                  propertyName: 'showYAxisTitle',
                  label: 'Show Y Axis Title',
                  parentId: 'root',
                  defaultValue: true,
                  hidden: {
                    _code: "return getSettingValue(data?.showYAxisScale) !== true",
                    _mode: "code",
                    _value: true
                  }
                })
                .addNumberField({
                  id: nanoid(),
                  propertyName: 'tension',
                  parentId: chartSettingsId,
                  label: 'Tension',
                  defaultValue: 0,
                  stepNumeric: 0.1,
                  min: 0,
                  hidden: {
                    _code: "return getSettingValue(data?.chartType) !== `line`",
                    _mode: "code",
                    _value: true
                  },
                })
                .addNumberField({
                  id: nanoid(),
                  propertyName: 'strokeWidth',
                  parentId: chartSettingsId,
                  label: 'Stroke width',
                  defaultValue: 0.0,
                  description: 'The width of the stroke for the elements (bars, lines, etc.) in the c in the chart. Default is 0.0',
                  stepNumeric: 0.1,
                  min: 0,
                  max: 10,
                })
                .addColorPicker({
                  id: nanoid(),
                  propertyName: 'strokeColor',
                  parentId: 'root',
                  label: 'Stroke Color',
                  allowClear: true,
                })
                .toJson()
              ]
          },

          {
            key: 'dataSettings',
            title: 'Data Settings',
            id: nanoid(),
            components: [
              ...new DesignerToolbarSettings()
              
                .addCollapsiblePanel({
                  id: dataSettingsForUrlId,
                  propertyName: 'dataSettingsForUrl',
                  parentId: 'root',
                  label: 'Data Settings (URL)',
                  labelAlign: "left",
                  expandIconPosition: "start",
                  ghost: true,
                  collapsible: 'header',
                  hidden: {
                    _code: "return getSettingValue(data?.dataMode) !== `url`",
                    _mode: "code",
                    _value: true
                  },
                  content: {
                    id: nanoid(),
                    components:
                      [...new DesignerToolbarSettings()
                        .addTextField({
                          id: nanoid(),
                          propertyName: 'url',
                          label: 'URL',
                          description: 'The URL you want to use for the chart',
                          labelAlign: 'right',
                          parentId: 'root',
                          hidden: false,
                          validate: { required: true },
                        })
                        .addTextField({
                          id: nanoid(),
                          propertyName: 'axisProperty',
                          label: 'Axis label',
                          labelAlign: 'right',
                          parentId: 'root',
                          isDynamic: false,
                          description: 'Label for the axis property',
                          validate: { required: false },
                          hidden: {
                            _code: "return getSettingValue(data?.chartType) === `pie` || getSettingValue(data?.chartType) === `polarArea`",
                            _mode: "code",
                            _value: true
                          },
                        })
                        .addTextField({
                          id: nanoid(),
                          propertyName: 'valueProperty',
                          label: 'Value axis label',
                          labelAlign: 'right',
                          parentId: 'root',
                          isDynamic: false,
                          description: 'Label for the value property',
                          validate: { required: false },
                          hidden: {
                            _code: "return getSettingValue(data?.chartType) === `pie` || getSettingValue(data?.chartType) === `polarArea`",
                            _mode: "code",
                            _value: true
                          },
                        })
                        .toJson()
                      ]
                  }
                })
                .addCollapsiblePanel({
                  id: dataSettingsId,
                  propertyName: 'dataSettings',
                  parentId: 'root',
                  label: 'Data Settings',
                  labelAlign: "left",
                  expandIconPosition: "start",
                  ghost: true,
                  collapsible: 'header',
                  hidden: {
                    _code: "return getSettingValue(data?.dataMode) === `url`",
                    _mode: "code",
                    _value: false
                  },
                  content: {
                    id: nanoid(),
                    components:
                      [...new DesignerToolbarSettings()
                        .addAutocomplete({
                          id: nanoid(),
                          propertyName: 'entityType',
                          label: 'Entity Type',
                          description: 'The entity type you want to use for the chart.',
                          labelAlign: 'right',
                          parentId: 'root',
                          hidden: false,
                          dataSourceType: 'url',
                          validate: { required: true },
                          dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
                          settingsValidationErrors: [],
                          useRawValues: true,
                          queryParams: null,
                        })
                        .addPropertyAutocomplete({
                          id: nanoid(),
                          propertyName: 'axisProperty',
                          label: 'Axis Property',
                          labelAlign: 'right',
                          parentId: 'root',
                          isDynamic: false,
                          description: 'The property to be used on the x-axis.',
                          validate: { required: true },
                          modelType: '{{data.entityType}}',
                          autoFillProps: false,
                          settingsValidationErrors: [],
                          hidden: {
                            _code: "return getSettingValue(data?.dataMode) === `url`",
                            _mode: "code",
                            _value: true
                          },
                        })
                        .addCheckbox({
                          id: nanoid(),
                          propertyName: 'isAxisTimeSeries',
                          label: 'Is Axis Property Time Series?',
                          description: 'If the x-axis is a time series, check this box.',
                          parentId: 'root',
                          defaultValue: false,
                          validate: { required: true },
                          
                        })
                        .addDropdown({
                          id: nanoid(),
                          propertyName: 'timeSeriesFormat',
                          parentId: 'root',
                          label: 'Time Series Format',
                          dataSourceType: 'values',
                          values: [
                            { id: nanoid(), label: 'Day', value: 'day' },
                            { id: nanoid(), label: 'Month', value: 'month' },
                            { id: nanoid(), label: 'Year', value: 'year' },
                            { id: nanoid(), label: 'Day-Month', value: 'day-month' },
                            { id: nanoid(), label: 'Day-Month-Year', value: 'day-month-year' },
                            { id: nanoid(), label: 'Month-Year', value: 'month-year' },
                          ],
                          validate: { required: true },
                          defaultValue: 'day-month-year',
                          hidden: {
                            _code: "return getSettingValue(data?.isAxisTimeSeries) !== true",
                            _mode: "code",
                            _value: true
                          },
                        })
                        .addPropertyAutocomplete({
                          id: nanoid(),
                          propertyName: 'valueProperty',
                          label: 'Value Property',
                          labelAlign: 'right',
                          parentId: 'root',
                          isDynamic: false,
                          description: 'This is the property that will be used to calculate the data and hence show on the depenedent y-axis.',
                          validate: { required: true },
                          modelType: '{{data.entityType}}',
                          autoFillProps: false,
                          settingsValidationErrors: [],
                          hidden: {
                            _code: "return getSettingValue(data?.dataMode) === `url`",
                            _mode: "code",
                            _value: true
                          },
                        })
                        .addPropertyAutocomplete({
                          id: nanoid(),
                          propertyName: 'legendProperty',
                          label: 'Legend Property',
                          labelAlign: 'right',
                          parentId: 'root',
                          hidden: {
                            _code: "return getSettingValue(data?.simpleOrPivot) === `simple`",
                            _mode: "code",
                            _value: false
                          },
                          isDynamic: false,
                          description: 'The properties you want to use on the Legend. This is the property that will be used to group the data for Pivot Charts.',
                          validate: { required: true },
                          modelType: '{{data.entityType}}',
                          autoFillProps: false,
                          settingsValidationErrors: [],
                        })
                        .addPropertyAutocomplete({
                          id: nanoid(),
                          propertyName: 'orderBy',
                          label: 'Order By',
                          labelAlign: 'right',
                          parentId: 'root',
                          hidden: false,
                          isDynamic: false,
                          description: 'The properties you want to order the data by. Use the propeties that you have selected for axis, value (and legend).',
                          modelType: '{{data.entityType}}',
                          autoFillProps: false,
                          settingsValidationErrors: [],
                        })
                        .addDropdown({
                          id: nanoid(),
                          propertyName: 'orderDirection',
                          parentId: 'root',
                          label: 'Order Direction',
                          dataSourceType: 'values',
                          values: [
                            { id: nanoid(), label: 'Ascending', value: 'asc' },
                            { id: nanoid(), label: 'Descending', value: 'desc' },
                          ],
                          validate: { required: true },
                          defaultValue: 'asc',
                          hidden: {
                            _code: "return !(getSettingValue(data?.orderBy))",
                            _mode: "code",
                            _value: true
                          },
                        })
                        .addCheckbox({
                          id: nanoid(),
                          propertyName: 'allowFilter',
                          label: 'Allow Chart Filter',
                          parentId: 'root',
                          description: 'Allow users to filter the chart data directly from the chart.',
                          defaultValue: false,
                        })
                        .addPropertyAutocomplete({
                          id: nanoid(),
                          propertyName: 'filterProperties',
                          label: 'Filter Property list',
                          labelAlign: 'right',
                          mode: "multiple",
                          parentId: 'root',
                          isDynamic: true,
                          description: 'The properties you want users to filter by. Use the propeties that you have selected for axis, value (and legend).',
                          modelType: '{{data.entityType}}',
                          autoFillProps: false,
                          settingsValidationErrors: [],
                          hidden: {
                            _code: "return !(getSettingValue(data?.allowFilter))",
                            _mode: "code",
                            _value: true
                          },
                        })
                        .addDropdown({
                          id: nanoid(),
                          propertyName: 'aggregationMethod',
                          parentId: 'root',
                          label: 'Aggregation Method',
                          dataSourceType: 'values',
                          values: [
                            { id: nanoid(), label: 'Sum', value: 'sum' },
                            { id: nanoid(), label: 'Count', value: 'count' },
                            { id: nanoid(), label: 'Average', value: 'average' },
                            { id: nanoid(), label: 'Min', value: 'min' },
                            { id: nanoid(), label: 'Max', value: 'max' },
                          ],
                          validate: { required: true },
                          defaultValue: 'count',
                        })
                        .addQueryBuilder({
                          id: 'n4enebtmhFgvkP5ukQK1f',
                          propertyName: 'filters',
                          label: 'Entity filter',
                          labelAlign: 'right',
                          parentId: 'root',
                          hidden: false,
                          isDynamic: false,
                          validate: {},
                          settingsValidationErrors: [],
                          modelType: '{{data.entityType}}',
                          fieldsUnavailableHint: 'Please select `Entity Type` to be able to configure this filter.',
                        })
                        .toJson()
                      ]
                  }
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