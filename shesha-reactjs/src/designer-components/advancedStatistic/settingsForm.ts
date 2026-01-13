import { nanoid } from "@/utils/uuid";
import { FormLayout } from "antd/lib/form/Form";
import { getBorderInputs, getCornerInputs } from "../_settings/utils/border/utils";
import { fontTypes, fontWeightsOptions, textAlignOptions } from "../_settings/utils/font/utils";
import { repeatOptions, positionOptions, sizeOptions } from "../_settings/utils/background/utils";
import { SettingsFormMarkupFactory } from "@/interfaces";

export const getSettings: SettingsFormMarkupFactory = ({ fbf }) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const appearanceId = nanoid();
  const securityId = nanoid();
  const eventsId = nanoid();
  const styleRouterId = nanoid();

  return {
    components: fbf()
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
            components: [...fbf()
              .addContextPropertyAutocomplete({
                id: nanoid(),
                propertyName: "propertyName",
                parentId: commonTabId,
                label: "Property Name",
                size: "small",
                validate: {
                  required: true,
                },
                jsSetting: true,
                styledLabel: true,
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
                    description: 'The value to display. Will be overridden by property binding.',
                  },
                  {
                    type: 'numberField',
                    id: nanoid(),
                    propertyName: 'precision',
                    label: 'Precision',
                    jsSetting: true,
                    min: 0,
                  },
                ],
              })
              .addSettingsInput({
                inputType: 'switch',
                id: nanoid(),
                propertyName: 'hidden',
                label: 'Hide',
                jsSetting: true,
                parentId: commonTabId,
              })
              .addCollapsiblePanel({
                id: nanoid(),
                propertyName: 'titlePanel',
                label: 'Title',
                labelAlign: 'right',
                ghost: true,
                parentId: commonTabId,
                collapsible: 'header',
                collapsedByDefault: true,
                content: {
                  id: nanoid(),
                  components: [...fbf()
                    .addSettingsInput({
                      id: nanoid(),
                      inputType: 'textField',
                      propertyName: 'titleText',
                      label: 'Text',
                      jsSetting: true,
                      parentId: 'titlePanel',
                    })
                    .addSettingsInputRow({
                      id: nanoid(),
                      parentId: 'titlePanel',
                      inputs: [
                        {
                          type: 'dropdown',
                          id: nanoid(),
                          propertyName: 'titlePosition',
                          label: 'Position',
                          dropdownOptions: [
                            { value: 'top', label: 'Top' },
                            { value: 'bottom', label: 'Bottom' },
                          ],
                        },
                        {
                          type: 'dropdown',
                          id: nanoid(),
                          propertyName: 'titleAlign',
                          label: 'Alignment',
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
                propertyName: 'prefixPanel',
                label: 'Prefix',
                labelAlign: 'right',
                ghost: true,
                parentId: commonTabId,
                collapsible: 'header',
                collapsedByDefault: true,
                content: {
                  id: nanoid(),
                  components: [...fbf()
                    .addSettingsInputRow({
                      id: nanoid(),
                      parentId: 'prefixPanel',
                      inputs: [
                        {
                          type: 'textField',
                          id: nanoid(),
                          propertyName: 'valuePrefix.text',
                          label: 'Text',
                          jsSetting: true,
                        },
                        {
                          type: 'iconPicker',
                          id: nanoid(),
                          propertyName: 'valuePrefix.icon',
                          label: 'Icon',
                          jsSetting: true,
                        },
                      ],
                    })
                    .addSettingsInputRow({
                      id: nanoid(),
                      parentId: 'prefixPanel',
                      inputs: [
                        {
                          type: 'colorPicker',
                          id: nanoid(),
                          propertyName: 'valuePrefix.color',
                          label: 'Color',
                        },
                        {
                          type: 'numberField',
                          id: nanoid(),
                          propertyName: 'valuePrefix.iconSize',
                          label: 'Icon Size',
                          min: 8,
                          max: 64,
                        },
                      ],
                    })
                    .toJson(),
                  ],
                },
              })
              .addCollapsiblePanel({
                id: nanoid(),
                propertyName: 'suffixPanel',
                label: 'Suffix',
                labelAlign: 'right',
                ghost: true,
                parentId: commonTabId,
                collapsible: 'header',
                collapsedByDefault: true,
                content: {
                  id: nanoid(),
                  components: [...fbf()
                    .addSettingsInputRow({
                      id: nanoid(),
                      parentId: 'suffixPanel',
                      inputs: [
                        {
                          type: 'textField',
                          id: nanoid(),
                          propertyName: 'suffix.text',
                          label: 'Text',
                          jsSetting: true,
                        },
                        {
                          type: 'iconPicker',
                          id: nanoid(),
                          propertyName: 'suffix.icon',
                          label: 'Icon',
                          jsSetting: true,
                        },
                      ],
                    })
                    .addSettingsInputRow({
                      id: nanoid(),
                      parentId: 'suffixPanel',
                      inputs: [
                        {
                          type: 'colorPicker',
                          id: nanoid(),
                          propertyName: 'suffix.color',
                          label: 'Color',
                        },
                        {
                          type: 'numberField',
                          id: nanoid(),
                          propertyName: 'suffix.iconSize',
                          label: 'Icon Size',
                          min: 8,
                          max: 64,
                        },
                      ],
                    })
                    .toJson(),
                  ],
                },
              })
              .addCollapsiblePanel({
                id: nanoid(),
                propertyName: 'leftIconPanel',
                label: 'Left Side Icon',
                labelAlign: 'right',
                ghost: true,
                parentId: commonTabId,
                collapsible: 'header',
                collapsedByDefault: true,
                content: {
                  id: nanoid(),
                  components: [...fbf()
                    .addSettingsInputRow({
                      id: nanoid(),
                      parentId: 'leftIconPanel',
                      inputs: [
                        {
                          type: 'iconPicker',
                          id: nanoid(),
                          propertyName: 'leftIcon.icon',
                          label: 'Icon',
                          jsSetting: true,
                        },
                        {
                          type: 'colorPicker',
                          id: nanoid(),
                          propertyName: 'leftIcon.color',
                          label: 'Color',
                        },
                      ],
                    })
                    .addSettingsInput({
                      id: nanoid(),
                      inputType: 'numberField',
                      propertyName: 'leftIcon.size',
                      label: 'Size',
                      min: 16,
                      max: 128,
                      parentId: 'leftIconPanel',
                    })
                    .toJson(),
                  ],
                },
              })
              .addCollapsiblePanel({
                id: nanoid(),
                propertyName: 'rightIconPanel',
                label: 'Right Side Icon',
                labelAlign: 'right',
                ghost: true,
                parentId: commonTabId,
                collapsible: 'header',
                collapsedByDefault: true,
                content: {
                  id: nanoid(),
                  components: [...fbf()
                    .addSettingsInputRow({
                      id: nanoid(),
                      parentId: 'rightIconPanel',
                      inputs: [
                        {
                          type: 'iconPicker',
                          id: nanoid(),
                          propertyName: 'rightIcon.icon',
                          label: 'Icon',
                          jsSetting: true,
                        },
                        {
                          type: 'colorPicker',
                          id: nanoid(),
                          propertyName: 'rightIcon.color',
                          label: 'Color',
                        },
                      ],
                    })
                    .addSettingsInput({
                      id: nanoid(),
                      inputType: 'numberField',
                      propertyName: 'rightIcon.size',
                      label: 'Size',
                      min: 16,
                      max: 128,
                      parentId: 'rightIconPanel',
                    })
                    .toJson(),
                  ],
                },
              })
              .toJson(),
            ],
          },
          {
            key: 'events',
            title: 'Events',
            id: eventsId,
            components: [...fbf()
              .addSettingsInput({
                id: nanoid(),
                inputType: 'codeEditor',
                propertyName: 'onClickCustom',
                label: 'On Click',
                labelAlign: 'right',
                tooltip: 'Enter custom event handler on click.',
                parentId: eventsId,
              })
              .toJson(),
            ],
          },
          {
            key: 'appearance',
            title: 'Appearance',
            id: appearanceId,
            components: [
              ...fbf()
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
                    _value: "",
                  } as any,
                  components: [
                    ...fbf()
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
                          components: [...fbf()
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: 'titleStyle',
                              inline: true,
                              propertyName: 'titleFont',
                              inputs: [
                                {
                                  type: 'dropdown',
                                  id: nanoid(),
                                  label: 'Family',
                                  propertyName: 'titleFont.type',
                                  hideLabel: true,
                                  dropdownOptions: fontTypes,
                                },
                                {
                                  type: 'numberField',
                                  id: nanoid(),
                                  label: 'Size',
                                  propertyName: 'titleFont.size',
                                  hideLabel: true,
                                  width: 50,
                                },
                                {
                                  type: 'dropdown',
                                  id: nanoid(),
                                  label: 'Weight',
                                  propertyName: 'titleFont.weight',
                                  hideLabel: true,
                                  dropdownOptions: fontWeightsOptions,
                                  width: 100,
                                },
                                {
                                  type: 'colorPicker',
                                  id: nanoid(),
                                  label: 'Color',
                                  hideLabel: true,
                                  propertyName: 'titleFont.color',
                                },
                              ],
                            })
                            .addSettingsInput({
                              id: nanoid(),
                              inputType: 'codeEditor',
                              propertyName: 'titleStyle',
                              hideLabel: false,
                              label: 'Custom Styles',
                              description: 'A script that returns the style as an object (CSSProperties)',
                            })
                            .toJson(),
                          ],
                        },
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
                          components: [...fbf()
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: 'valueStyle',
                              inline: true,
                              propertyName: 'valueFont',
                              inputs: [
                                {
                                  type: 'dropdown',
                                  id: nanoid(),
                                  label: 'Family',
                                  propertyName: 'valueFont.type',
                                  hideLabel: true,
                                  dropdownOptions: fontTypes,
                                },
                                {
                                  type: 'numberField',
                                  id: nanoid(),
                                  label: 'Size',
                                  propertyName: 'valueFont.size',
                                  hideLabel: true,
                                  width: 50,
                                },
                                {
                                  type: 'dropdown',
                                  id: nanoid(),
                                  label: 'Weight',
                                  propertyName: 'valueFont.weight',
                                  hideLabel: true,
                                  dropdownOptions: fontWeightsOptions,
                                  width: 100,
                                },
                                {
                                  type: 'colorPicker',
                                  id: nanoid(),
                                  label: 'Color',
                                  hideLabel: true,
                                  propertyName: 'valueFont.color',
                                },
                              ],
                            })
                            .addSettingsInput({
                              id: nanoid(),
                              inputType: 'codeEditor',
                              propertyName: 'valueStyle',
                              hideLabel: false,
                              label: 'Custom Styles',
                              description: 'A script that returns the style as an object (CSSProperties)',
                            })
                            .toJson(),
                          ],
                        },
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'prefixStylePanel',
                        label: 'Prefix Styles',
                        labelAlign: 'right',
                        ghost: true,
                        parentId: styleRouterId,
                        collapsible: 'header',
                        collapsedByDefault: true,
                        content: {
                          id: nanoid(),
                          components: [...fbf()
                            .addSettingsInput({
                              id: nanoid(),
                              inputType: 'codeEditor',
                              propertyName: 'valuePrefixStyle',
                              hideLabel: false,
                              label: 'Custom Styles',
                              description: 'A script that returns the style as an object (CSSProperties)',
                            })
                            .toJson(),
                          ],
                        },
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'suffixStylePanel',
                        label: 'Suffix Styles',
                        labelAlign: 'right',
                        ghost: true,
                        parentId: styleRouterId,
                        collapsible: 'header',
                        collapsedByDefault: true,
                        content: {
                          id: nanoid(),
                          components: [...fbf()
                            .addSettingsInput({
                              id: nanoid(),
                              inputType: 'codeEditor',
                              propertyName: 'suffixStyle',
                              hideLabel: false,
                              label: 'Custom Styles',
                              description: 'A script that returns the style as an object (CSSProperties)',
                            })
                            .toJson(),
                          ],
                        },
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'leftIconStylePanel',
                        label: 'Left Icon Styles',
                        labelAlign: 'right',
                        ghost: true,
                        parentId: styleRouterId,
                        collapsible: 'header',
                        collapsedByDefault: true,
                        content: {
                          id: nanoid(),
                          components: [...fbf()
                            .addSettingsInput({
                              id: nanoid(),
                              inputType: 'codeEditor',
                              propertyName: 'leftIconStyle',
                              hideLabel: false,
                              label: 'Custom Styles',
                              description: 'A script that returns the style as an object (CSSProperties)',
                            })
                            .toJson(),
                          ],
                        },
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'rightIconStylePanel',
                        label: 'Right Icon Styles',
                        labelAlign: 'right',
                        ghost: true,
                        parentId: styleRouterId,
                        collapsible: 'header',
                        collapsedByDefault: true,
                        content: {
                          id: nanoid(),
                          components: [...fbf()
                            .addSettingsInput({
                              id: nanoid(),
                              inputType: 'codeEditor',
                              propertyName: 'rightIconStyle',
                              hideLabel: false,
                              label: 'Custom Styles',
                              description: 'A script that returns the style as an object (CSSProperties)',
                            })
                            .toJson(),
                          ],
                        },
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
                          id: 'dimensionsStylePnl',
                          components: [...fbf()
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: 'dimensionsStylePnl',
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
                              parentId: 'dimensionsStylePnl',
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
                        hidden: false,
                        collapsedByDefault: true,
                        content: {
                          id: 'borderStylePnl',
                          components: [...fbf()
                            .addContainer({
                              id: 'borderStyleRow',
                              parentId: 'borderStylePnl',
                              components: getBorderInputs(fbf),
                            })
                            .addContainer({
                              id: 'borderRadiusStyleRow',
                              parentId: 'borderStylePnl',
                              components: getCornerInputs(fbf),
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
                        collapsedByDefault: true,
                        content: {
                          id: 'backgroundStylePnl',
                          components: [
                            ...fbf()
                              .addSettingsInput({
                                id: 'backgroundStylePnl-type',
                                parentId: 'backgroundStylePnl',
                                label: "Type",
                                jsSetting: false,
                                propertyName: "background.type",
                                inputType: "radio",
                                tooltip: "Select a type of background",
                                buttonGroupOptions: [
                                  {
                                    value: "color",
                                    icon: "FormatPainterOutlined",
                                    title: "Color",
                                  },
                                  {
                                    value: "gradient",
                                    icon: "BgColorsOutlined",
                                    title: "Gradient",
                                  },
                                  {
                                    value: "image",
                                    icon: "PictureOutlined",
                                    title: "Image",
                                  },
                                  {
                                    value: "url",
                                    icon: "LinkOutlined",
                                    title: "URL",
                                  },
                                  {
                                    value: "storedFile",
                                    icon: "DatabaseOutlined",
                                    title: "Stored File",
                                  },
                                ],
                              })
                              .addSettingsInputRow({
                                id: 'backgroundStylePnl-color',
                                parentId: 'backgroundStylePnl',
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
                                id: 'backgroundStylePnl-gradient',
                                parentId: 'backgroundStylePnl',
                                inputs: [{
                                  type: 'multiColorPicker',
                                  id: nanoid(),
                                  propertyName: "background.gradient.colors",
                                  label: "Colors",
                                  jsSetting: false,
                                },
                                ],
                                hidden: { _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "gradient";', _mode: 'code', _value: false } as any,
                                hideLabel: true,
                              })
                              .addSettingsInputRow({
                                id: 'backgroundStylePnl-url',
                                parentId: 'backgroundStylePnl',
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
                                id: 'backgroundStylePnl-image',
                                parentId: 'backgroundStylePnl',
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
                                id: 'backgroundStylePnl-storedFile',
                                parentId: 'backgroundStylePnl',
                                hidden: { _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "storedFile";', _mode: 'code', _value: false } as any,
                                inputs: [
                                  {
                                    type: 'textField',
                                    id: 'backgroundStyle-storedFile',
                                    jsSetting: false,
                                    propertyName: "background.storedFile.id",
                                    label: "File ID",
                                  },
                                ],
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
                                  },
                                ],
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
                                  buttonGroupOptions: repeatOptions,
                                }],
                                hidden: { _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
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
                        collapsedByDefault: true,
                        content: {
                          id: 'shadowStylePnl',
                          components: [...fbf()
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: 'shadowStylePnl',
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
                                },
                                {
                                  type: 'numberField',
                                  id: nanoid(),
                                  label: 'V-Offset',
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
                        collapsedByDefault: true,
                        content: {
                          id: nanoid(),
                          components: [...fbf()
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
                        propertyName: 'containerStyle',
                        label: 'Container Custom Styles',
                        labelAlign: 'right',
                        ghost: true,
                        parentId: styleRouterId,
                        collapsible: 'header',
                        collapsedByDefault: true,
                        content: {
                          id: nanoid(),
                          components: [...fbf()
                            .addSettingsInput({
                              id: nanoid(),
                              inputType: 'codeEditor',
                              propertyName: 'containerStyle',
                              hideLabel: false,
                              label: 'Style',
                              description: 'A script that returns the style as an object (CSSProperties)',
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
            id: securityId,
            components: [...fbf()
              .addSettingsInput({
                id: nanoid(),
                inputType: 'permissions',
                propertyName: 'permissions',
                label: 'Permissions',
                size: 'small',
                jsSetting: true,
                parentId: securityId,
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
