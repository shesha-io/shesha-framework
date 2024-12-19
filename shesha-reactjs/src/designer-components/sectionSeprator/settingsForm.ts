import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { fontTypes, fontWeights } from '../_settings/utils/font/utils';

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
                  id: 'component-s4gmBg31azZC0UjZjpfTm',
                  parentId: 's4gmBg31azZC0UjZjpfTm',
                  propertyName: 'componentName',
                  label: 'Component Name',
                  jsSetting: true,
                })
                .addSettingsInput({
                  id: 'orientation-s4gmBg31azZC0UjZjpfTm',
                  parentId: 's4gmBg31azZC0UjZjpfTm',
                  inputType: 'dropdown',
                  propertyName: 'orientation',
                  label: 'Orientation',
                  jsSetting: true,
                  dropdownOptions: [
                    {
                      label: 'horizontal',
                      value: 'horizontal',
                    },
                    {
                      label: 'vertical',
                      value: 'vertical',
                    },
                  ],
                })
                .addLabelConfigurator({
                  id: '46d07439-4c18-468c-89e1-60c002ce96c5',
                  propertyName: 'hideLabel',
                  label: 'label',
                  parentId: 's4gmBg31azZC0UjZjpfTm',
                  hideLabel: true,
                })
                .addSettingsInput({
                  id: 'palceholder-tooltip-s4gmBg31azZC0UjZjpfTm',
                  parentId: 's4gmBg31azZC0UjZjpfTm',
                  inputType: 'textArea',
                  propertyName: 'description',
                  label: 'Tooltip',
                  jsSetting: true,
                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                })
                .addSettingsInputRow({
                  id: '12d700d6-ed4d-49d5-9cfd-fe8f0060f3b6',
                  parentId: 's4gmBg31azZC0UjZjpfTm',
                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  inputs: [
                    {
                      type: 'switch',
                      id: 'hidden-s4gmBg31azZC0UjZjpfTm',
                      propertyName: 'hidden',
                      label: 'Hide',
                      jsSetting: true,
                      layout: 'horizontal',
                    },
                    {
                      type: 'switch',
                      id: 'inline-s4gmBg31azZC0UjZjpfTm',
                      propertyName: 'inline',
                      label: 'Inline',
                      size: 'small',
                      jsSetting: true,
                    },
                  ],
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
                      .addCollapsiblePanel({
                        id: 'lineStyleCollapsiblePanel',
                        propertyName: 'lineStyle',
                        label: 'Line Style',
                        labelAlign: 'right',
                        ghost: true,
                        parentId: 'styleRouter',
                        collapsible: 'header',
                        content: {
                          id: 'stylePnl-M500-911MFR',
                          components: [
                            ...new DesignerToolbarSettings()
                              .addCollapsiblePanel({
                                id: 'linefontStyleCollapsiblePanel',
                                propertyName: 'linepnlFontStyle',
                                label: 'Font',
                                labelAlign: 'right',
                                parentId: 'styleRouter',
                                ghost: true,
                                collapsible: 'header',
                                content: {
                                  id: 'fontStylePnlline',
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addSettingsInputRow({
                                        id: 'trye26vo0xhs-HxJ5k5ngYE',
                                        parentId: 'fontStylePnlline',
                                        inline: true,
                                        propertyName: 'lineFont',
                                        readOnly: {
                                          _code: 'return  getSettingValue(data?.readOnly);',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        inputs: [
                                          {
                                            type: 'number',
                                            id: 'fontSize-s04gmBg31azZC0UjZjpfTm',
                                            label: 'Size',
                                            propertyName: 'lineFont.size',
                                            hideLabel: true,
                                            width: 50,
                                          },
                                          {
                                            type: 'color',
                                            id: 'fontColor-s40gmBg31azZC0UjZjpfTm',
                                            label: 'Color',
                                            hideLabel: true,
                                            propertyName: 'lineFont.color',
                                          },
                                        ],
                                      })
                                      .toJson(),
                                  ],
                                },
                              })
                              .addSettingsInputRow({
                                id: `lineStyleRow`,
                                parentId: 'lineStylePnl',
                                inline: true,
                                hidden: false,
                                readOnly: {
                                  _code: 'return getSettingValue(data?.readOnly);',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                inputs: [
                                  {
                                    type: 'switch',
                                    id: 'dashed',
                                    label: 'Dashed',
                                    hideLabel: false,
                                    propertyName: 'dashed',
                                    layout: 'horizontal',
                                  },
                                ],
                              })
                              .toJson(),
                          ],
                        },
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
                                hidden: {
                                  _code: 'return  getSettingValue(data?.orientation) === "vertical";',
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
                                    type: 'text',
                                    id: 'width-s4gmBg31azZC0UjZjpfTm',
                                    label: 'Width',
                                    width: 85,
                                    propertyName: 'lineWidth',
                                    icon: 'widthIcon',
                                    tooltip: 'You can use any unit (%, px, em, etc). px by default if without unit',
                                  },
                                ],
                              })
                              .addSettingsInputRow({
                                id: 'dimensionsStyleRowHeight',
                                parentId: 'dimensionsStylePnl',
                                inline: true,
                                hidden: {
                                  _code: 'return  getSettingValue(data?.orientation) === "horizontal";',
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
                                    type: 'text',
                                    id: 'height-s4gmBg31azZC0UjZjpfTm',
                                    label: 'Height',
                                    width: 85,
                                    propertyName: 'lineHeight',
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
                        id: 'titleStyleCollapsiblePanel',
                        propertyName: 'titleStyle',
                        label: 'Title Style',
                        labelAlign: 'right',
                        ghost: true,
                        collapsedByDefault: true,
                        parentId: 'styleRouter',
                        collapsible: 'header',
                        content: {
                          id: 'stylePnl-M500-911MFR',
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
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addSettingsInputRow({
                                        id: 'trye26voxhs-HxJ5k5ngYE',
                                        parentId: 'fontStylePnl',
                                        inline: true,
                                        propertyName: 'font',
                                        readOnly: {
                                          _code: 'return  getSettingValue(data?.readOnly);',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
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
                                            type: 'number',
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
                                            tooltip: 'Controls text thickness (light, normal, bold, etc.)',
                                            dropdownOptions: fontWeights,
                                            width: 100,
                                          },
                                          {
                                            type: 'color',
                                            id: 'fontColor-s4gmBg31azZC0UjZjpfTm',
                                            label: 'Color',
                                            hideLabel: true,
                                            propertyName: 'font.color',
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
                              .addSettingsInput({
                                readOnly: {
                                  _code: 'return  getSettingValue(data?.readOnly);',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                id: 'title-css-412c-8461-4c8d55e5c073',
                                inputType: 'codeEditor',
                                propertyName: 'containerStyle',
                                hideLabel: true,
                                label: 'Style',
                                description:
                                  'A script that returns the style of the element as an object. This should conform to CSSProperties',
                              })
                              .toJson(),
                          ],
                        },
                      })
                      .addCollapsiblePanel({
                        id: 'customStyleCollapsiblePanel',
                        propertyName: 'customStyle',
                        label: 'Container Style',
                        labelAlign: 'right',
                        ghost: true,
                        collapsedByDefault: true,
                        parentId: 'styleRouter',
                        collapsible: 'header',
                        content: {
                          id: 'stylePnl-M500-911MFR',
                          components: [
                            ...new DesignerToolbarSettings()
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
                                        id: 'stylecontainerBoxPnl',
                                        label: 'Margin Padding',
                                        hideLabel: true,
                                        propertyName: 'stylingBox',
                                      })
                                      .toJson(),
                                  ],
                                },
                              })
                              .addSettingsInput({
                                readOnly: {
                                  _code: 'return  getSettingValue(data?.readOnly);',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                id: 'custom-css-412c-8461-4c8d55e5c073',
                                inputType: 'codeEditor',
                                propertyName: 'containerStyle',
                                hideLabel: true,
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
          {
            key: '5',
            title: 'Security',
            id: '6Vw9iiDw9d0MD_Rh5cbIn',
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  id: '1adea529-1f0c-4def-bd41-ee166a5dfcd7',
                  inputType: 'permissions',
                  propertyName: 'permissions',
                  label: 'Permissions',
                  size: 'small',
                  parentId: '6Vw9iiDw9d0MD_Rh5cbIn',
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
