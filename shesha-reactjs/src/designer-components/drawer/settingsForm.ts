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
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const appearanceTabId = nanoid();
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
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputType: 'textField',
                  propertyName: 'componentName',
                  label: 'Component Name',
                  size: 'large',
                  jsSetting: true,
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      id: nanoid(),
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
                  id: nanoid(),
                  propertyName: 'action',
                  label: 'Actions',
                  labelAlign: 'right',
                  ghost: true,
                  collapsible: 'header',
                  parentId: commonTabId,
                  content: {
                    id: nanoid(),
                    components: [
                      ...new DesignerToolbarSettings()
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: commonTabId,
                          inputs: [
                            {
                              id: nanoid(),
                              inputType: 'switch',
                              type: 'switch',
                              propertyName: 'showHeader',
                              label: 'Show Header',
                              size: 'small',
                              jsSetting: true,
                              defaultValue: false,
                            },
                            {
                              id: nanoid(),
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
                          id: nanoid(),
                          propertyName: 'containerComponents',
                          direction: 'vertical',
                          hidden: {
                            _code: 'return  !getSettingValue(data?.showFooter);',
                            _mode: 'code',
                            _value: false,
                          } as any,
                          parentId: nanoid(),
                          components: new DesignerToolbarSettings()
                            .addCollapsiblePanel({
                              id: nanoid(),
                              propertyName: 'okButtonCollapsiblePanel',
                              label: 'Ok Button',
                              parentId: nanoid(),
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
                              parentId: nanoid(),
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
                    _mode: 'code',
                    _code: "    return contexts.canvasContext?.designerDevice || 'desktop';",
                    _value: '',
                  },
                  components: [
                    ...new DesignerToolbarSettings()
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
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInput({
                                id: nanoid(),
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
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: nanoid(),
                                inline: true,
                                hidden: {
                                  _code:
                                    'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.placement) !== "right" && getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.placement) !== "left";',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                inputs: [
                                  {
                                    type: 'textField',
                                    id: nanoid(),
                                    label: 'Width',
                                    width: 85,
                                    defaultValue: '100%',
                                    propertyName: 'width',
                                    icon: 'widthIcon',
                                    tooltip: 'You can use any unit (%, px, em, etc). px by default if without unit',
                                  },
                                ],
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: nanoid(),
                                inline: true,
                                hidden: {
                                  _code:
                                    'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.placement) !== "top" && getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.placement) !== "bottom";',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                inputs: [
                                  {
                                    type: 'textField',
                                    id: nanoid(),
                                    label: 'Height',
                                    width: 85,
                                    defaultValue: '100%',
                                    propertyName: 'dimensions.height',
                                    icon: 'heightIcon',
                                    tooltip: 'You can use any unit (%, px, em, etc). px by default if without unit',
                                  },
                                ],
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
                                parentId: nanoid(),
                                label: 'Type',
                                jsSetting: false,
                                propertyName: 'background.type',
                                inputType: 'radio',
                                tooltip: 'Select a type of background',
                                buttonGroupOptions: backgroundTypeOptions,
                                readOnly: {
                                  _code: 'return  getSettingValue(data?.readOnly);',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: nanoid(),
                                inputs: [
                                  {
                                    type: 'colorPicker',
                                    id: nanoid(),
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
                                id: nanoid(),
                                parentId: nanoid(),
                                inputs: [
                                  {
                                    type: 'multiColorPicker',
                                    id: nanoid(),
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
                                id: nanoid(),
                                parentId: nanoid(),
                                inputs: [
                                  {
                                    type: 'textField',
                                    id: nanoid(),
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
                                id: nanoid(),
                                parentId: nanoid(),
                                inputs: [
                                  {
                                    type: 'imageUploader',
                                    id: nanoid(),
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
                                id: nanoid(),
                                parentId: nanoid(),
                                hidden: {
                                  _code:
                                    'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "storedFile";',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                inputs: [
                                  {
                                    type: 'textField',
                                    id: nanoid(),
                                    jsSetting: false,
                                    propertyName: 'background.storedFile.id',
                                    label: 'File ID',
                                  },
                                ],
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: nanoid(),
                                inline: true,
                                hidden: {
                                  _code:
                                    'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                readOnly: {
                                  _code: 'return  getSettingValue(data?.readOnly);',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                inputs: [
                                  {
                                    type: 'customDropdown',
                                    id: nanoid(),
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
                                    id: nanoid(),
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
                                id: nanoid(),
                                parentId: nanoid(),
                                readOnly: {
                                  _code: 'return  getSettingValue(data?.readOnly);',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                inputs: [
                                  {
                                    type: 'radio',
                                    id: nanoid(),
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
                        id: nanoid(),
                        propertyName: 'pnlBorderStyle',
                        label: 'Border',
                        labelAlign: 'right',
                        ghost: true,
                        parentId: styleRouterId,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addContainer({
                                id: nanoid(),
                                parentId: nanoid(),
                                components: getBorderInputs() as any,
                              })
                              .addContainer({
                                id: nanoid(),
                                parentId: nanoid(),
                                components: getCornerInputs() as any,
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
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: nanoid(),
                                inline: true,
                                inputs: [
                                  {
                                    type: 'numberField',
                                    id: nanoid(),
                                    label: 'Offset X',
                                    hideLabel: true,
                                    width: 80,
                                    icon: 'offsetHorizontalIcon',
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
                          components: [
                            ...new DesignerToolbarSettings()
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
                        propertyName: 'style',
                        label: 'Custom Styles',
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
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'headerStyle',
                        label: 'Header Styles',
                        collapsedByDefault: true,
                        labelAlign: 'right',
                        ghost: true,
                        parentId: styleRouterId,
                        collapsible: 'header',
                        hidden: {
                          _code: 'return  !getSettingValue(data?.showHeader);',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
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
                                        parentId: nanoid(),
                                        label: 'Type',
                                        jsSetting: false,
                                        propertyName: 'headerBackground.type',
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
                                        id: nanoid(),
                                        parentId: nanoid(),
                                        inputs: [
                                          {
                                            type: 'colorPicker',
                                            id: nanoid(),
                                            label: 'Color',
                                            propertyName: 'headerBackground.color',
                                            hideLabel: true,
                                            jsSetting: false,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.headerBackground?.type) !== "color";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: nanoid(),
                                        inputs: [
                                          {
                                            type: 'multiColorPicker',
                                            id: nanoid(),
                                            propertyName: 'headerBackground.gradient.colors',
                                            label: 'Colors',
                                            jsSetting: false,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.headerBackground?.type) !== "gradient";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        hideLabel: true,
                                      })
                                      .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: nanoid(),
                                        inputs: [
                                          {
                                            type: 'textField',
                                            id: nanoid(),
                                            propertyName: 'headerBackground.url',
                                            jsSetting: false,
                                            label: 'URL',
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.headerBackground?.type) !== "url";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: nanoid(),
                                        inputs: [
                                          {
                                            type: 'imageUploader',
                                            id: nanoid(),
                                            propertyName: 'headerBackground.uploadFile',
                                            label: 'Image',
                                            jsSetting: false,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.headerBackground?.type) !== "image";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: nanoid(),
                                        hidden: {
                                          _code:
                                            'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.headerBackground?.type) !== "storedFile";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        inputs: [
                                          {
                                            type: 'textField',
                                            id: nanoid(),
                                            jsSetting: false,
                                            propertyName: 'headerBackground.storedFile.id',
                                            label: 'File ID',
                                          },
                                        ],
                                      })
                                      .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: nanoid(),
                                        hidden: {
                                          _code:
                                            'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        inline: true,
                                        inputs: [
                                          {
                                            type: 'customDropdown',
                                            id: nanoid(),
                                            label: 'Size',
                                            hideLabel: true,
                                            propertyName: 'headerBackground.size',
                                            dropdownOptions: [
                                              {
                                                value: 'cover',
                                                label: 'Cover',
                                              },
                                              {
                                                value: 'contain',
                                                label: 'Contain',
                                              },
                                              {
                                                value: 'auto',
                                                label: 'Auto',
                                              },
                                            ],
                                          },
                                          {
                                            type: 'customDropdown',
                                            id: nanoid(),
                                            label: 'Position',
                                            hideLabel: true,
                                            propertyName: 'headerBackground.position',
                                            dropdownOptions: [
                                              {
                                                value: 'center',
                                                label: 'Center',
                                              },
                                              {
                                                value: 'top',
                                                label: 'Top',
                                              },
                                              {
                                                value: 'left',
                                                label: 'Left',
                                              },
                                              {
                                                value: 'right',
                                                label: 'Right',
                                              },
                                              {
                                                value: 'bottom',
                                                label: 'Bottom',
                                              },
                                              {
                                                value: 'top left',
                                                label: 'Top Left',
                                              },
                                              {
                                                value: 'top right',
                                                label: 'Top Right',
                                              },
                                              {
                                                value: 'bottom left',
                                                label: 'Bottom Left',
                                              },
                                              {
                                                value: 'bottom right',
                                                label: 'Bottom Right',
                                              },
                                            ],
                                          },
                                          {
                                            type: 'radio',
                                            id: nanoid(),
                                            label: 'Repeat',
                                            hideLabel: true,
                                            propertyName: 'headerBackground.repeat',
                                            buttonGroupOptions: repeatOptions,
                                          },
                                        ],
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
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: nanoid(),
                                        inline: true,
                                        inputs: [
                                          {
                                            type: 'numberField',
                                            id: nanoid(),
                                            label: 'Offset X',
                                            hideLabel: true,
                                            width: 80,
                                            icon: 'offsetHorizontalIcon',
                                            propertyName: 'headerShadow.offsetX',
                                          },
                                          {
                                            type: 'numberField',
                                            id: nanoid(),
                                            label: 'Offset Y',
                                            hideLabel: true,
                                            width: 80,
                                            icon: 'offsetVerticalIcon',
                                            propertyName: 'headerShadow.offsetY',
                                          },
                                          {
                                            type: 'numberField',
                                            id: nanoid(),
                                            label: 'Blur',
                                            hideLabel: true,
                                            width: 80,
                                            icon: 'blurIcon',
                                            propertyName: 'headerShadow.blurRadius',
                                          },
                                          {
                                            type: 'numberField',
                                            id: nanoid(),
                                            label: 'Spread',
                                            hideLabel: true,
                                            width: 80,
                                            icon: 'spreadIcon',
                                            propertyName: 'headerShadow.spreadRadius',
                                          },
                                          {
                                            type: 'colorPicker',
                                            id: nanoid(),
                                            label: 'Color',
                                            hideLabel: true,
                                            propertyName: 'headerShadow.color',
                                          },
                                        ],
                                      })
                                      .toJson(),
                                  ],
                                },
                              })
                              .addSettingsInput({
                                id: nanoid(),
                                inputType: 'codeEditor',
                                propertyName: 'headerStyle',
                                hideLabel: false,
                                label: 'Style',
                                description:
                                  'A script that returns the style of the element as an object. This should conform to CSSProperties',
                              })
                              .toJson(),
                          ],
                        },
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'footerStyle',
                        label: 'Footer Styles',
                        collapsedByDefault: true,
                        labelAlign: 'right',
                        ghost: true,
                        parentId: styleRouterId,
                        collapsible: 'header',
                        hidden: {
                          _code: 'return  !getSettingValue(data?.showFooter);',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
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
                                        parentId: nanoid(),
                                        label: 'Type',
                                        jsSetting: false,
                                        propertyName: 'footerBackground.type',
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
                                        id: nanoid(),
                                        parentId: nanoid(),
                                        inputs: [
                                          {
                                            type: 'colorPicker',
                                            id: nanoid(),
                                            label: 'Color',
                                            propertyName: 'footerBackground.color',
                                            hideLabel: true,
                                            jsSetting: false,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.footerBackground?.type) !== "color";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: nanoid(),
                                        inputs: [
                                          {
                                            type: 'multiColorPicker',
                                            id: nanoid(),
                                            propertyName: 'footerBackground.gradient.colors',
                                            label: 'Colors',
                                            jsSetting: false,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.footerBackground?.type) !== "gradient";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        hideLabel: true,
                                      })
                                      .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: nanoid(),
                                        inputs: [
                                          {
                                            type: 'textField',
                                            id: nanoid(),
                                            propertyName: 'footerBackground.url',
                                            jsSetting: false,
                                            label: 'URL',
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.footerBackground?.type) !== "url";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: nanoid(),
                                        inputs: [
                                          {
                                            type: 'imageUploader',
                                            id: nanoid(),
                                            propertyName: 'footerBackground.uploadFile',
                                            label: 'Image',
                                            jsSetting: false,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.footerBackground?.type) !== "image";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: nanoid(),
                                        hidden: {
                                          _code:
                                            'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.footerBackground?.type) !== "storedFile";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        inputs: [
                                          {
                                            type: 'textField',
                                            id: nanoid(),
                                            jsSetting: false,
                                            propertyName: 'footerBackground.storedFile.id',
                                            label: 'File ID',
                                          },
                                        ],
                                      })
                                      .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: nanoid(),
                                        hidden: {
                                          _code:
                                            'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.footerBackground?.type) === "color";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        inline: true,
                                        inputs: [
                                          {
                                            type: 'customDropdown',
                                            id: nanoid(),
                                            label: 'Size',
                                            hideLabel: true,
                                            propertyName: 'footerBackground.size',
                                            dropdownOptions: [
                                              {
                                                value: 'cover',
                                                label: 'Cover',
                                              },
                                              {
                                                value: 'contain',
                                                label: 'Contain',
                                              },
                                              {
                                                value: 'auto',
                                                label: 'Auto',
                                              },
                                            ],
                                          },
                                          {
                                            type: 'customDropdown',
                                            id: nanoid(),
                                            label: 'Position',
                                            hideLabel: true,
                                            propertyName: 'footerBackground.position',
                                            dropdownOptions: [
                                              {
                                                value: 'center',
                                                label: 'Center',
                                              },
                                              {
                                                value: 'top',
                                                label: 'Top',
                                              },
                                              {
                                                value: 'left',
                                                label: 'Left',
                                              },
                                              {
                                                value: 'right',
                                                label: 'Right',
                                              },
                                              {
                                                value: 'bottom',
                                                label: 'Bottom',
                                              },
                                              {
                                                value: 'top left',
                                                label: 'Top Left',
                                              },
                                              {
                                                value: 'top right',
                                                label: 'Top Right',
                                              },
                                              {
                                                value: 'bottom left',
                                                label: 'Bottom Left',
                                              },
                                              {
                                                value: 'bottom right',
                                                label: 'Bottom Right',
                                              },
                                            ],
                                          },
                                          {
                                            type: 'radio',
                                            id: nanoid(),
                                            label: 'Repeat',
                                            hideLabel: true,
                                            propertyName: 'footerBackground.repeat',
                                            buttonGroupOptions: repeatOptions,
                                          },
                                        ],
                                      })
                                      .toJson(),
                                  ],
                                },
                              })
                              .addCollapsiblePanel({
                                id: nanoid(),
                                propertyName: 'footerpnlShadowStyle',
                                label: 'Shadow',
                                labelAlign: 'right',
                                ghost: true,
                                parentId: styleRouterId,
                                collapsible: 'header',
                                content: {
                                  id: nanoid(),
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: nanoid(),
                                        inline: true,
                                        inputs: [
                                          {
                                            type: 'numberField',
                                            id: nanoid(),
                                            label: 'Offset X',
                                            hideLabel: true,
                                            width: 80,
                                            icon: 'offsetHorizontalIcon',
                                            propertyName: 'footerShadow.offsetX',
                                          },
                                          {
                                            type: 'numberField',
                                            id: nanoid(),
                                            label: 'Offset Y',
                                            hideLabel: true,
                                            width: 80,
                                            icon: 'offsetVerticalIcon',
                                            propertyName: 'footerShadow.offsetY',
                                          },
                                          {
                                            type: 'numberField',
                                            id: nanoid(),
                                            label: 'Blur',
                                            hideLabel: true,
                                            width: 80,
                                            icon: 'blurIcon',
                                            propertyName: 'footerShadow.blurRadius',
                                          },
                                          {
                                            type: 'numberField',
                                            id: nanoid(),
                                            label: 'Spread',
                                            hideLabel: true,
                                            width: 80,
                                            icon: 'spreadIcon',
                                            propertyName: 'footerShadow.spreadRadius',
                                          },
                                          {
                                            type: 'colorPicker',
                                            id: nanoid(),
                                            label: 'Color',
                                            hideLabel: true,
                                            propertyName: 'footerShadow.color',
                                          },
                                        ],
                                      })
                                      .toJson(),
                                  ],
                                },
                              })
                              .addSettingsInput({
                                id: nanoid(),
                                inputType: 'codeEditor',
                                propertyName: 'footerStyle',
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