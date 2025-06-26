import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';
import { getBorderInputs, getCornerInputs } from '../_settings/utils/border/utils';
import {
  backgroundTypeOptions,
  positionOptions,
  repeatOptions,
  sizeOptions,
} from '../_settings/utils/background/utils';

export const getSettings = (data: any) => {
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
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: 'placeholder-tooltip-s4gmBg31azZC0UjZjpfTm',
                  parentId: 's4gmBg31azZC0UjZjpfTm',
                  inputType: 'textField',
                  propertyName: 'componentName',
                  label: 'Component Name',
                  size: 'large',
                  jsSetting: true,
                })
                .addSettingsInputRow({
                  id: 'headerTitle-row-s4gmBg31azZC0UjZjpfTm',
                  parentId: 's4gmBg31azZC0UjZjpfTm',
                  inputs: [
                    {
                      id: 'headerTitle-input-s4gmBg31azZC0UjZjpfTm',
                      type: 'textField',
                      propertyName: 'label',
                      label: 'Header Title',
                      size: 'large',
                      jsSetting: true,
                    },
                  ],
                  hidden: {
                    _code: 'return  !getSettingValue(data?.showHeader);',
                    _mode: 'code',
                    _value: false,
                  } as any,
                })
                .addCollapsiblePanel({
                  id: 'placement-panel-s4gmBg31azZC0UjZjpfTm',
                  propertyName: 'action',
                  label: 'Actions',
                  labelAlign: 'right',
                  ghost: true,
                  collapsible: 'header',
                  parentId: 's4gmBg31azZC0UjZjpfTm',
                  content: {
                    id: 'placement-content-s4gmBg31azZC0UjZjpfTm',
                    components: [
                      ...new DesignerToolbarSettings()
                        .addSettingsInputRow({
                          id: '12d700d6-ed4d-49d5-9cfd-fe8f00d6-ed4d-49d5-9cfd-fe8f00w0f3b6',
                          parentId: 'placement-content-s4gmBg31azZC0UjZjpfTm',
                          inputs: [
                            {
                              id: '12d700d6-ed4d-49d5-9cfd-fe8f00w0f3b6',
                              inputType: 'switch',
                              type: 'switch',
                              propertyName: 'showHeader',
                              label: 'Show Header',
                              size: 'small',
                              jsSetting: true,
                              defaultValue: false,
                            },
                            {
                              id: '12d700d6-ed4d-49d5-9cfd-fe8f0060f3b6',
                              inputType: 'switch',
                              type: 'switch',
                              propertyName: 'showFooter',
                              label: 'Show Action Buttons',
                              size: 'small',
                              jsSetting: true,
                              defaultValue: false,
                            },
                          ],
                        })
                        .addContainer({
                          id: 'ccc24bf6-f76d-4139-a850-c99bf06c8b69',
                          propertyName: 'containerComponents',
                          direction: 'vertical',
                          hidden: {
                            _code: 'return  !getSettingValue(data?.showFooter);',
                            _mode: 'code',
                            _value: false,
                          } as any,
                          parentId: 'placement-content-s4gmBg31azZC0UjZjpfTm',
                          components: new DesignerToolbarSettings()
                            .addCollapsiblePanel({
                              id: nanoid(),
                              propertyName: 'okButtonCollapsiblePanel',
                              label: 'Ok Button',
                              parentId: 'ccc24bf6-f76d-4139-a850-c99bf06c8b69',
                              content: {
                                id: nanoid(),
                                components: new DesignerToolbarSettings()
                                  .addConfigurableActionConfigurator({
                                    id: nanoid(),
                                    propertyName: 'onOkAction',
                                    parentId: nanoid(),
                                    label: 'Ok Action',
                                  })
                                  .addSettingsInput({
                                    id: nanoid(),
                                    propertyName: 'okText',
                                    parentId: nanoid(),
                                    label: 'Ok Text',
                                    description: 'The text that will be displayed on the Ok button',
                                  })
                                  .addSettingsInput({
                                    id: nanoid(),
                                    propertyName: 'okButtonCustomEnabled',
                                    parentId: nanoid(),
                                    label: 'Custom Enabled',
                                    inputType: 'codeEditor',
                                    description: 'Enter custom enabled of the Ok button',
                                  })
                                  .toJson(),
                              },
                            })
                            .addCollapsiblePanel({
                              id: nanoid(),
                              propertyName: 'cancelButtonCollapsiblePanel',
                              label: 'Cancel Button',
                              parentId: 'ccc24bf6-f76d-4139-a850-c99bf06c8b69',
                              content: {
                                id: nanoid(),
                                components: new DesignerToolbarSettings()
                                  .addConfigurableActionConfigurator({
                                    id: nanoid(),
                                    propertyName: 'onCancelAction',
                                    label: 'Ok Cancel',
                                    parentId: nanoid(),
                                  })
                                  .addSettingsInput({
                                    id: nanoid(),
                                    propertyName: 'cancelText',
                                    label: 'Cancel Text',
                                    description: 'The text that will be displayed on the Cancel button',
                                    parentId: nanoid(),
                                  })
                                  .addSettingsInput({
                                    id: nanoid(),
                                    propertyName: 'cancelButtonCustomEnabled',
                                    label: 'Custom Enabled',
                                    inputType: 'codeEditor',
                                    description: 'Enter custom enabled of the Cancel button',
                                    parentId: nanoid(),
                                  })
                                  .toJson(),
                              },
                            })
                            .toJson(),
                        })
                        .toJson(),
                    ],
                  },
                })
                .toJson(),
            ],
          },
          {
            key: '4',
            title: 'Appearance',
            id: 'elgrlievlfwehhh848r8hsdnflsdnclurbd',
            components: [
              ...new DesignerToolbarSettings()
                .addPropertyRouter({
                  id: 'styleRouter',
                  propertyName: 'propertyRouter1',
                  componentName: 'propertyRouter',
                  label: 'Property router1',
                  labelAlign: 'right',
                  parentId: 'elgrlievlfwehhh848r8hsdnflsdnclurbd',
                  hidden: false,
                  propertyRouteName: {
                    _mode: 'code',
                    _code: "    return contexts.canvasContext?.designerDevice || 'desktop';",
                    _value: '',
                  },
                  components: [
                    ...new DesignerToolbarSettings()
                      .addSettingsInput({
                        id: 'predefinedOrientation',
                        propertyName: 'placement',
                        label: 'Slide Direction',
                        inputType: 'dropdown',
                        hidden: false,
                        defaultValue: 'right',
                        dropdownOptions: [
                          { label: 'Top', value: 'top' },
                          { label: 'Right', value: 'right' },
                          { label: 'Bottom', value: 'bottom' },
                          { label: 'Left', value: 'left' },
                        ],
                        validate: { required: true },
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
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInputRow({
                                id: 'dimensionsStyleRowWidth',
                                parentId: 'dimensionsStylePnl',
                                inline: true,
                                inputs: [
                                  {
                                    type: 'textField',
                                    id: 'width-dimensions-s4gmBg31azZC0UjZjpfTm',
                                    label: 'Width',
                                    width: 85,
                                    propertyName: 'dimensions.width',
                                    icon: 'widthIcon',
                                    tooltip: 'You can use any unit (%, px, em, etc). px by default if without unit',
                                  },
                                  {
                                    type: 'textField',
                                    id: nanoid(),
                                    label: 'Min Width',
                                    width: 85,
                                    hideLabel: true,
                                    propertyName: 'dimensions.minWidth',
                                    icon: 'minWidthIcon',
                                  },
                                  {
                                    type: 'textField',
                                    id: nanoid(),
                                    label: 'Max Width',
                                    width: 85,
                                    hideLabel: true,
                                    propertyName: 'dimensions.maxWidth',
                                    icon: 'maxWidthIcon',
                                  },
                                ],
                              })
                              .addSettingsInputRow({
                                id: 'dimensionsStyleRowHeight',
                                parentId: 'dimensionsStylePnl',
                                inline: true,
                                inputs: [
                                  {
                                    type: 'textField',
                                    id: 'height-dimensions-s4gmBg31azZC0UjZjpfTm',
                                    label: 'Height',
                                    width: 85,
                                    propertyName: 'dimensions.height',
                                    icon: 'heightIcon',
                                    tooltip: 'You can use any unit (%, px, em, etc). px by default if without unit',
                                  },
                                  {
                                    type: 'textField',
                                    id: nanoid(),
                                    label: 'Min Height',
                                    width: 85,
                                    hideLabel: true,
                                    propertyName: 'dimensions.minHeight',
                                    icon: 'minHeightIcon',
                                  },
                                  {
                                    type: 'textField',
                                    id: nanoid(),
                                    label: 'Max Height',
                                    width: 85,
                                    hideLabel: true,
                                    propertyName: 'dimensions.maxHeight',
                                    icon: 'maxHeightIcon',
                                  },
                                ],
                              })
                              .toJson(),
                          ],
                        },
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
                          id: 'backgroundStylePnl-main',
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInput({
                                id: 'backgroundStyleRow-selectType-main',
                                parentId: 'backgroundStylePnl-main',
                                label: 'Type',
                                jsSetting: false,
                                propertyName: 'background.type',
                                inputType: 'radio',
                                tooltip: 'Select a type of background',
                                buttonGroupOptions: backgroundTypeOptions,
                              })
                              .addSettingsInputRow({
                                id: 'backgroundStyleRow-color-main',
                                parentId: 'backgroundStylePnl-main',
                                inputs: [
                                  {
                                    type: 'colorPicker',
                                    id: 'backgroundStyleRow-color-picker-main',
                                    label: 'Color',
                                    propertyName: 'background.color',
                                    hideLabel: true,
                                    jsSetting: false,
                                  },
                                ],
                                hidden: {
                                  _code:
                                    'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "color";',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                              })
                              .addSettingsInputRow({
                                id: 'backgroundStyle-gradientColors-row-main',
                                parentId: 'backgroundStylePnl-main',
                                inputs: [
                                  {
                                    type: 'multiColorPicker',
                                    id: 'backgroundStyle-gradientColors-picker-main',
                                    propertyName: 'background.gradient.colors',
                                    label: 'Colors',
                                    jsSetting: false,
                                  },
                                ],
                                hidden: {
                                  _code:
                                    'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "gradient";',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                hideLabel: true,
                              })
                              .addSettingsInputRow({
                                id: 'backgroundStyle-url-row-main',
                                parentId: 'backgroundStylePnl-main',
                                inputs: [
                                  {
                                    type: 'textField',
                                    id: 'backgroundStyle-url-field-main',
                                    propertyName: 'background.url',
                                    jsSetting: false,
                                    label: 'URL',
                                  },
                                ],
                                hidden: {
                                  _code:
                                    'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "url";',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                              })
                              .addSettingsInputRow({
                                id: 'backgroundStyle-image-row-main',
                                parentId: 'backgroundStylePnl-main',
                                inputs: [
                                  {
                                    type: 'imageUploader',
                                    id: 'backgroundStyle-image-uploader-main',
                                    propertyName: 'background.uploadFile',
                                    label: 'Image',
                                    jsSetting: false,
                                  },
                                ],
                                hidden: {
                                  _code:
                                    'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "image";',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                              })
                              .addSettingsInputRow({
                                id: 'backgroundStyleRow-storedFile-main',
                                parentId: 'backgroundStylePnl-main',
                                hidden: {
                                  _code:
                                    'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "storedFile";',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                inputs: [
                                  {
                                    type: 'textField',
                                    id: 'backgroundStyle-storedFile-main',
                                    jsSetting: false,
                                    propertyName: 'background.storedFile.id',
                                    label: 'File ID',
                                  },
                                ],
                              })
                              .addSettingsInputRow({
                                id: 'backgroundStyleRow-controls-main',
                                parentId: 'backgroundStylePnl-main',
                                inline: true,
                                hidden: {
                                  _code:
                                    'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                inputs: [
                                  {
                                    type: 'customDropdown',
                                    id: 'backgroundStyleRow-size-main',
                                    label: 'Size',
                                    hideLabel: true,
                                    propertyName: 'background.size',
                                    customTooltip:
                                      'Size of the background image, two space separated values with units e.g "100% 100px"',
                                    dropdownOptions: sizeOptions,
                                    hidden: {
                                      _code:
                                        'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";',
                                      _mode: 'code',
                                      _value: false,
                                    } as any,
                                  },
                                  {
                                    type: 'customDropdown',
                                    id: 'backgroundStyleRow-position-main',
                                    label: 'Position',
                                    hideLabel: true,
                                    customTooltip:
                                      'Position of the background image, two space separated values with units e.g "5em 100px"',
                                    propertyName: 'background.position',
                                    dropdownOptions: positionOptions,
                                  },
                                ],
                              })
                              .addSettingsInputRow({
                                id: 'backgroundStyleRow-repeat-main',
                                parentId: 'backgroundStylePnl-main',
                                inputs: [
                                  {
                                    type: 'radio',
                                    id: 'backgroundStyleRow-repeat-radio-main',
                                    label: 'Repeat',
                                    hideLabel: true,
                                    propertyName: 'background.repeat',
                                    inputType: 'radio',
                                    buttonGroupOptions: repeatOptions,
                                  },
                                ],
                                hidden: {
                                  _code:
                                    'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                              })
                              .toJson(),
                          ],
                        },
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
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInputRow({
                                id: `borderStyleRow-main`,
                                parentId: 'borderStylePnl',
                                hidden: {
                                  _code:
                                    'return  !getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.border?.hideBorder);',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                inputs: [
                                  {
                                    type: 'button',
                                    id: 'borderStyleRow-hideBorder-main',
                                    label: 'Border',
                                    hideLabel: true,
                                    propertyName: 'border.hideBorder',
                                    icon: 'EyeOutlined',
                                    iconAlt: 'EyeInvisibleOutlined',
                                  },
                                ],
                              })
                              .addContainer({
                                id: 'borderStyleRow-container',
                                parentId: 'borderStylePnl',
                                components: getBorderInputs() as any,
                              })
                              .addContainer({
                                id: 'borderRadiusStyleRow-container',
                                parentId: 'borderStylePnl',
                                components: getCornerInputs() as any,
                              })
                              .toJson(),
                          ],
                        },
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
                          id: 'shadowStylePnl-main',
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInputRow({
                                id: 'shadowStyleRow-main',
                                parentId: 'shadowStylePnl-main',
                                inline: true,
                                inputs: [
                                  {
                                    type: 'numberField',
                                    id: 'shadowStyleRow-offsetX-main',
                                    label: 'Offset X',
                                    hideLabel: true,
                                    width: 80,
                                    icon: 'offsetHorizontalIcon',
                                    propertyName: 'shadow.offsetX',
                                  },
                                  {
                                    type: 'numberField',
                                    id: 'shadowStyleRow-offsetY-main',
                                    label: 'Offset Y',
                                    hideLabel: true,
                                    width: 80,
                                    icon: 'offsetVerticalIcon',
                                    propertyName: 'shadow.offsetY',
                                  },
                                  {
                                    type: 'numberField',
                                    id: 'shadowStyleRow-blurRadius-main',
                                    label: 'Blur',
                                    hideLabel: true,
                                    width: 80,
                                    icon: 'blurIcon',
                                    propertyName: 'shadow.blurRadius',
                                  },
                                  {
                                    type: 'numberField',
                                    id: 'shadowStyleRow-spreadRadius-main',
                                    label: 'Spread',
                                    hideLabel: true,
                                    width: 80,
                                    icon: 'spreadIcon',
                                    propertyName: 'shadow.spreadRadius',
                                  },
                                  {
                                    type: 'colorPicker',
                                    id: 'shadowStyleRow-color-main',
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
                        id: 'styleCollapsiblePanel',
                        propertyName: 'stylingBox',
                        label: 'Margin & Padding',
                        labelAlign: 'right',
                        ghost: true,
                        collapsible: 'header',
                        content: {
                          id: 'stylePnl-M5-911',
                          components: [
                            ...new DesignerToolbarSettings()
                              .addStyleBox({
                                id: 'styleBoxPnl',
                                label: 'Margin Padding',
                                hideLabel: true,
                                propertyName: 'stylingBox',
                              })
                              .toJson(),
                          ],
                        },
                      })
                      .addCollapsiblePanel({
                        id: 'customStyleCollapsiblePanel',
                        propertyName: 'customStyle',
                        label: 'Custom Styles',
                        labelAlign: 'right',
                        ghost: true,
                        parentId: 'styleRouter',
                        collapsible: 'header',
                        content: {
                          id: 'stylePnl-custom-main',
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInput({
                                id: 'custom-css-main',
                                inputType: 'codeEditor',
                                propertyName: 'style',
                                hideLabel: false,
                                label: 'Style',
                                description:
                                  'A script that returns the style of the element as an object. This should conform to CSSProperties',
                              })
                              .toJson(),
                          ],
                        },
                      })
                      // Header Styles Section - Updated to use headerStyles namespace
                      .addCollapsiblePanel({
                        id: 'headerStyleCollapsiblePanel',
                        propertyName: 'headerStyles',
                        label: 'Header Styles',
                        collapsedByDefault: true,
                        labelAlign: 'right',
                        ghost: true,
                        parentId: 'styleRouter',
                        collapsible: 'header',
                        hidden: {
                          _code: 'return !getSettingValue(data?.showHeader);',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        content: {
                          id: 'stylePnl-header-main',
                          components: [
                            ...new DesignerToolbarSettings()
                              .addCollapsiblePanel({
                                id: 'headerbackgroundStyleCollapsiblePanel',
                                propertyName: 'pnlBackgroundStyle',
                                label: 'Background',
                                labelAlign: 'right',
                                ghost: true,
                                parentId: 'stylePnl-header-main',
                                collapsible: 'header',
                                content: {
                                  id: 'backgroundStylePnl-header',
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addSettingsInput({
                                        id: 'backgroundStyleRow-selectType-header',
                                        parentId: 'backgroundStylePnl-header',
                                        label: 'Type',
                                        jsSetting: false,
                                        propertyName: 'headerStyles.background.type',
                                        inputType: 'radio',
                                        tooltip: 'Select a type of background',
                                        buttonGroupOptions: [
                                          {
                                            value: 'color',
                                            icon: 'FormatPainterOutlined',
                                            title: 'Color',
                                          },
                                          {
                                            value: 'gradient',
                                            icon: 'BgColorsOutlined',
                                            title: 'Gradient',
                                          },
                                          {
                                            value: 'image',
                                            icon: 'PictureOutlined',
                                            title: 'Image',
                                          },
                                          {
                                            value: 'url',
                                            icon: 'LinkOutlined',
                                            title: 'URL',
                                          },
                                          {
                                            value: 'storedFile',
                                            icon: 'DatabaseOutlined',
                                            title: 'Stored File',
                                          },
                                        ],
                                      })
                                      .addSettingsInputRow({
                                        id: 'backgroundStyleRow-color-header',
                                        parentId: 'backgroundStylePnl-header',
                                        inputs: [
                                          {
                                            type: 'colorPicker',
                                            id: 'backgroundStyleRow-color-picker-header',
                                            label: 'Color',
                                            propertyName: 'headerStyles.background.color',
                                            hideLabel: true,
                                            jsSetting: false,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.headerStyles?.background?.type) !== "color";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .addSettingsInputRow({
                                        id: 'backgroundStyle-gradientColors-header',
                                        parentId: 'backgroundStylePnl-header',
                                        inputs: [
                                          {
                                            type: 'multiColorPicker',
                                            id: 'backgroundStyle-gradientColors-picker-header',
                                            propertyName: 'headerStyles.background.gradient.colors',
                                            label: 'Colors',
                                            jsSetting: false,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.headerStyles?.background?.type) !== "gradient";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        hideLabel: true,
                                      })
                                      .addSettingsInputRow({
                                        id: 'backgroundStyle-url-header',
                                        parentId: 'backgroundStylePnl-header',
                                        inputs: [
                                          {
                                            type: 'textField',
                                            id: 'backgroundStyle-url-field-header',
                                            propertyName: 'headerStyles.background.url',
                                            jsSetting: false,
                                            label: 'URL',
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.headerStyles?.background?.type) !== "url";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .addSettingsInputRow({
                                        id: 'backgroundStyle-image-header',
                                        parentId: 'backgroundStylePnl-header',
                                        inputs: [
                                          {
                                            type: 'imageUploader',
                                            id: 'backgroundStyle-image-uploader-header',
                                            propertyName: 'headerStyles.background.uploadFile',
                                            label: 'Image',
                                            jsSetting: false,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.headerStyles?.background?.type) !== "image";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .addSettingsInputRow({
                                        id: 'backgroundStyleRow-storedFile-header',
                                        parentId: 'backgroundStylePnl-header',
                                        hidden: {
                                          _code:
                                            'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.headerStyles?.background?.type) !== "storedFile";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        inputs: [
                                          {
                                            type: 'textField',
                                            id: 'backgroundStyle-storedFile-header',
                                            jsSetting: false,
                                            propertyName: 'headerStyles.background.storedFile.id',
                                            label: 'File ID',
                                          },
                                        ],
                                      })
                                      .addSettingsInputRow({
                                        id: 'headerBackgroundStyleRow-controls-header',
                                        parentId: 'backgroundStylePnl-header',
                                        hidden: {
                                          _code:
                                            'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.headerStyles?.background?.type) === "color";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        inline: true,
                                        inputs: [
                                          {
                                            type: 'customDropdown',
                                            id: 'headerBackgroundStyleRow-size-header',
                                            label: 'Size',
                                            hideLabel: true,
                                            propertyName: 'headerStyles.background.size',
                                            customTooltip:
                                              'Size of the background image, two space separated values with units e.g "100% 100px"',
                                            dropdownOptions: sizeOptions,
                                            hidden: {
                                              _code:
                                                'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.headerStyles?.background?.type) === "color";',
                                              _mode: 'code',
                                              _value: false,
                                            } as any,
                                          },
                                          {
                                            type: 'customDropdown',
                                            id: 'headerBackgroundStyleRow-position-header',
                                            label: 'Position',
                                            hideLabel: true,
                                            customTooltip:
                                              'Position of the background image, two space separated values with units e.g "5em 100px"',
                                            propertyName: 'headerStyles.background.position',
                                            dropdownOptions: positionOptions,
                                          },
                                        ],
                                      })
                                      .addSettingsInputRow({
                                        id: 'headerBackgroundStyleRow-repeat-header',
                                        parentId: 'backgroundStylePnl-header',
                                        inputs: [
                                          {
                                            type: 'radio',
                                            id: 'headerBackgroundStyleRow-repeat-radios-header',
                                            label: 'Repeat',
                                            hideLabel: true,
                                            propertyName: 'headerStyles.background.repeat',
                                            inputType: 'radio',
                                            buttonGroupOptions: repeatOptions,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.headerStyles?.background?.type) === "color";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .toJson(),
                                  ],
                                },
                              })
                              .addCollapsiblePanel({
                                id: 'headerShadowStyleCollapsiblePanel',
                                propertyName: 'pnlShadowStyle',
                                label: 'Shadow',
                                labelAlign: 'right',
                                ghost: true,
                                parentId: 'stylePnl-header-main',
                                collapsible: 'header',
                                content: {
                                  id: 'shadowStylePnl-header',
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addSettingsInputRow({
                                        id: 'shadowStyleRow-header',
                                        parentId: 'shadowStylePnl-header',
                                        inline: true,
                                        inputs: [
                                          {
                                            type: 'numberField',
                                            id: 'HeadershadowStyleRow-offsetX-header',
                                            label: 'Offset X',
                                            hideLabel: true,
                                            width: 80,
                                            icon: 'offsetHorizontalIcon',
                                            propertyName: 'headerStyles.shadow.offsetX',
                                          },
                                          {
                                            type: 'numberField',
                                            id: 'HeadershadowStyleRow-offsetY-header',
                                            label: 'Offset Y',
                                            hideLabel: true,
                                            width: 80,
                                            icon: 'offsetVerticalIcon',
                                            propertyName: 'headerStyles.shadow.offsetY',
                                          },
                                          {
                                            type: 'numberField',
                                            id: 'HeadershadowStyleRow-blurRadius-header',
                                            label: 'Blur',
                                            hideLabel: true,
                                            width: 80,
                                            icon: 'blurIcon',
                                            propertyName: 'headerStyles.shadow.blurRadius',
                                          },
                                          {
                                            type: 'numberField',
                                            id: 'HeadershadowStyleRow-spreadRadius-header',
                                            label: 'Spread',
                                            hideLabel: true,
                                            width: 80,
                                            icon: 'spreadIcon',
                                            propertyName: 'headerStyles.shadow.spreadRadius',
                                          },
                                          {
                                            type: 'colorPicker',
                                            id: 'HeadershadowStyleRow-color-header',
                                            label: 'Color',
                                            hideLabel: true,
                                            propertyName: 'headerStyles.shadow.color',
                                          },
                                        ],
                                      })
                                      .toJson(),
                                  ],
                                },
                              })
                              .addSettingsInput({
                                id: 'custom-css-header',
                                inputType: 'codeEditor',
                                propertyName: 'headerStyles.style',
                                hideLabel: false,
                                label: 'Style',
                                description:
                                  'A script that returns the style of the element as an object. This should conform to CSSProperties',
                              })
                              .toJson(),
                          ],
                        },
                      })
                      // Footer Styles Section - Updated to use footerStyles namespace
                      .addCollapsiblePanel({
                        id: 'footerStyleCollapsiblePanel',
                        propertyName: 'footerStyles',
                        label: 'Footer Styles',
                        collapsedByDefault: true,
                        labelAlign: 'right',
                        ghost: true,
                        parentId: 'styleRouter',
                        collapsible: 'header',
                        hidden: {
                          _code: 'return !getSettingValue(data?.showFooter);',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        content: {
                          id: 'stylePnl-footer-main',
                          components: [
                            ...new DesignerToolbarSettings()
                              .addCollapsiblePanel({
                                id: 'footerBackgroundStyleCollapsiblePanel',
                                propertyName: 'pnlBackgroundStyle',
                                label: 'Background',
                                labelAlign: 'right',
                                ghost: true,
                                parentId: 'stylePnl-footer-main',
                                collapsible: 'header',
                                content: {
                                  id: 'backgroundStylePnl-footer',
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addSettingsInput({
                                        id: 'backgroundStyleRow-selectType-footer',
                                        parentId: 'backgroundStylePnl-footer',
                                        label: 'Type',
                                        jsSetting: false,
                                        propertyName: 'footerStyles.background.type',
                                        inputType: 'radio',
                                        tooltip: 'Select a type of background',
                                        buttonGroupOptions: [
                                          {
                                            value: 'color',
                                            icon: 'FormatPainterOutlined',
                                            title: 'Color',
                                          },
                                          {
                                            value: 'gradient',
                                            icon: 'BgColorsOutlined',
                                            title: 'Gradient',
                                          },
                                          {
                                            value: 'image',
                                            icon: 'PictureOutlined',
                                            title: 'Image',
                                          },
                                          {
                                            value: 'url',
                                            icon: 'LinkOutlined',
                                            title: 'URL',
                                          },
                                          {
                                            value: 'storedFile',
                                            icon: 'DatabaseOutlined',
                                            title: 'Stored File',
                                          },
                                        ],
                                      })
                                      .addSettingsInputRow({
                                        id: 'footerbackgroundStyleRow-color',
                                        parentId: 'backgroundStylePnl-footer',
                                        inputs: [
                                          {
                                            type: 'colorPicker',
                                            id: 'backgroundStyleRow-color-footer',
                                            label: 'Color',
                                            propertyName: 'footerStyles.background.color',
                                            hideLabel: true,
                                            jsSetting: false,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.footerStyles?.background?.type) !== "color";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .addSettingsInputRow({
                                        id: 'backgroundStyle-gradientColors-footer',
                                        parentId: 'backgroundStylePnl-footer',
                                        inputs: [
                                          {
                                            type: 'multiColorPicker',
                                            id: 'backgroundStyle-gradientColors-footer',
                                            propertyName: 'footerStyles.background.gradient.colors',
                                            label: 'Colors',
                                            jsSetting: false,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.footerStyles?.background?.type) !== "gradient";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        hideLabel: true,
                                      })
                                      .addSettingsInputRow({
                                        id: 'footerBackgroundStyle-url',
                                        parentId: 'backgroundStylePnl-footer',
                                        inputs: [
                                          {
                                            type: 'textField',
                                            id: 'backgroundStyle-url-footer',
                                            propertyName: 'footerStyles.background.url',
                                            jsSetting: false,
                                            label: 'URL',
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.footerStyles?.background?.type) !== "url";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .addSettingsInputRow({
                                        id: 'footerbackgroundStyle-image',
                                        parentId: 'backgroundStylePnl-footer',
                                        inputs: [
                                          {
                                            type: 'imageUploader',
                                            id: 'backgroundStyle-image-footer',
                                            propertyName: 'footerStyles.background.uploadFile',
                                            label: 'Image',
                                            jsSetting: false,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.footerStyles?.background?.type) !== "image";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .addSettingsInputRow({
                                        id: 'footerbackgroundStyleRow-storedFile',
                                        parentId: 'backgroundStylePnl-footer',
                                        hidden: {
                                          _code:
                                            'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.footerStyles?.background?.type) !== "storedFile";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        inputs: [
                                          {
                                            type: 'textField',
                                            id: 'footerbackgroundStyle-storedFile',
                                            jsSetting: false,
                                            propertyName: 'footerStyles.background.storedFile.id',
                                            label: 'File ID',
                                          },
                                        ],
                                      })
                                      .addSettingsInputRow({
                                        id: 'footerBackgroundStyleRow-controls',
                                        parentId: 'backgroundStylePnl-footer',
                                        inline: true,
                                        hidden: {
                                          _code:
                                            'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.footerStyles?.background?.type) === "color";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        inputs: [
                                          {
                                            type: 'customDropdown',
                                            id: 'footerBackgroundStyleRow-size',
                                            label: 'Size',
                                            hideLabel: true,
                                            propertyName: 'footerStyles.background.size',
                                            customTooltip:
                                              'Size of the background image, two space separated values with units e.g "100% 100px"',
                                            dropdownOptions: sizeOptions,
                                            hidden: {
                                              _code:
                                                'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.footerStyles?.background?.type) === "color";',
                                              _mode: 'code',
                                              _value: false,
                                            } as any,
                                          },
                                          {
                                            type: 'customDropdown',
                                            id: 'footerBackgroundStyleRow-position',
                                            label: 'Position',
                                            hideLabel: true,
                                            customTooltip:
                                              'Position of the background image, two space separated values with units e.g "5em 100px"',
                                            propertyName: 'footerStyles.background.position',
                                            dropdownOptions: positionOptions,
                                          },
                                        ],
                                      })
                                      .addSettingsInputRow({
                                        id: 'footerBackgroundStyleRow-repeat',
                                        parentId: 'backgroundStylePnl-footer',
                                        inputs: [
                                          {
                                            type: 'radio',
                                            id: 'footer-backgroundStyleRow-repeat-radio',
                                            label: 'Repeat',
                                            hideLabel: true,
                                            propertyName: 'footerStyles.background.repeat',
                                            inputType: 'radio',
                                            buttonGroupOptions: repeatOptions,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.footerStyles?.background?.type) === "color";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .toJson(),
                                  ],
                                },
                              })
                              .addCollapsiblePanel({
                                id: 'footerShadowStyleCollapsiblePanel',
                                propertyName: 'footerpnlShadowStyle',
                                label: 'Shadow',
                                labelAlign: 'right',
                                ghost: true,
                                parentId: 'stylePnl-footer-main',
                                collapsible: 'header',
                                content: {
                                  id: 'footershadowStylePnl',
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addSettingsInputRow({
                                        id: 'footershadowStyleRow',
                                        parentId: 'footershadowStylePnl',
                                        inline: true,
                                        inputs: [
                                          {
                                            type: 'numberField',
                                            id: 'footerShadowStyleRow-offsetX',
                                            label: 'Offset X',
                                            hideLabel: true,
                                            width: 80,
                                            icon: 'offsetHorizontalIcon',
                                            propertyName: 'footerStyles.shadow.offsetX',
                                          },
                                          {
                                            type: 'numberField',
                                            id: 'footerShadowStyleRow-offsetY',
                                            label: 'Offset Y',
                                            hideLabel: true,
                                            width: 80,
                                            icon: 'offsetVerticalIcon',
                                            propertyName: 'footerStyles.shadow.offsetY',
                                          },
                                          {
                                            type: 'numberField',
                                            id: 'footerShadowStyleRow-blurRadius',
                                            label: 'Blur',
                                            hideLabel: true,
                                            width: 80,
                                            icon: 'blurIcon',
                                            propertyName: 'footerStyles.shadow.blurRadius',
                                          },
                                          {
                                            type: 'numberField',
                                            id: 'footerShadowStyleRow-spreadRadius',
                                            label: 'Spread',
                                            hideLabel: true,
                                            width: 80,
                                            icon: 'spreadIcon',
                                            propertyName: 'footerStyles.shadow.spreadRadius',
                                          },
                                          {
                                            type: 'colorPicker',
                                            id: 'footerShadowStyleRow-color',
                                            label: 'Color',
                                            hideLabel: true,
                                            propertyName: 'footerStyles.shadow.color',
                                          },
                                        ],
                                      })
                                      .toJson(),
                                  ],
                                },
                              })
                              .addSettingsInput({
                                id: 'custom-css-footer',
                                inputType: 'codeEditor',
                                propertyName: 'footerStyles.style',
                                hideLabel: false,
                                label: 'Style',
                                description:
                                  'A script that returns the style of the element as an object. This should conform to CSSProperties',
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
