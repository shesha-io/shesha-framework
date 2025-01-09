import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { fontTypes, fontWeights, textAlign } from '../_settings/utils/font/utils';
import { FormLayout } from 'antd/es/form/Form';

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
                .addContextPropertyAutocomplete({
                  id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
                  propertyName: 'propertyName',
                  label: 'Property Name',
                  parentId: 's4gmBg31azZC0UjZjpfTm',
                  styledLabel: true,
                  size: 'small',
                  validate: {
                    required: true,
                  },
                  jsSetting: true,
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
                  propertyName: 'content',
                  label: 'Content',
                  size: 'small',
                  jsSetting: true,
                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                })
                .addSettingsInput({
                  id: 'href-s4gmBg31azZC0UjZjpfTm',
                  parentId: 's4gmBg31azZC0UjZjpfTm',
                  inputType: 'text',
                  propertyName: 'href',
                  label: 'Href',
                  size: 'small',
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
                      id: 'hasChildren-s4gmBg31azZC0UjZjpfTm',
                      propertyName: 'hasChildren',
                      label: 'Has Children',
                      size: 'small',
                      jsSetting: true,
                    },
                    {
                      type: 'switch',
                      id: 'hidden-s4gmBg31azZC0UjZjpfTm',
                      propertyName: 'hidden',
                      label: 'Hide',
                      jsSetting: true,
                      layout: 'horizontal',
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: '12d700d6-ed4d-49d5-9cfd-fe8f0060f3b6',
                  parentId: 's4gmBg31azZC0UjZjpfTm',
                  hidden: {
                    _code: 'return  !getSettingValue(data?.hasChildren);',
                    _mode: 'code',
                    _value: false,
                  } as any,
                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  inputs: [
                    {
                      type: 'dropdown',
                      id: 'direction-s4gmBg31azZC0UjZjpfTm',
                      propertyName: 'direction',
                      label: 'Direction',
                      jsSetting: true,
                      layout: 'horizontal',
                      dropdownOptions: [
                        {
                          label: 'Horizontal',
                          value: 'horizontal',
                        },
                        {
                          label: 'Vertical',
                          value: 'vertical',
                        },
                      ],
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: 'type-default-value-s4gmBg31azZC0UjZjpfTm',
                  parentId: 's4gmBg31azZC0UjZjpfTm',
                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  inputs: [
                    {
                      type: 'dropdown',
                      id: 'type-s4gmBg31azZC0UjZjpfTm',
                      propertyName: 'target',
                      label: 'Target',
                      size: 'small',
                      validate: {
                        required: true,
                      },
                      jsSetting: true,
                      dropdownOptions: [
                        {
                          label: '_blank',
                          value: '_blank',
                        },
                        {
                          label: '_parent',
                          value: '_parent',
                        },
                        {
                          label: '_self',
                          value: '_self',
                        },
                        {
                          label: '_top',
                          value: '_top',
                        },
                      ],
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
                        id: 'fontStyleCollapsiblePanel',
                        propertyName: 'pnlFontStyle',
                        label: 'Font',
                        hidden: {
                          _code: 'return  getSettingValue(data?.hasChildren);',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        labelAlign: 'right',
                        parentId: 'styleRouter',
                        ghost: true,
                        collapsible: 'header',
                        content: {
                          id: 'fontStylePnl',
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInputRow({
                                id: 'try26voxhs-HxJ5k5ngYE',
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
                                  {
                                    type: 'dropdown',
                                    id: 'fontAlign-s4gmBg31azZC0UjZjpfTm',
                                    label: 'Align',
                                    propertyName: 'font.align',
                                    hideLabel: true,
                                    width: 60,
                                    dropdownOptions: textAlign,
                                  },
                                ],
                              })
                              .toJson(),
                          ],
                        },
                      })
                      .addSettingsInputRow({
                        id: '12d700d6-ed4d-49d5-9cfd-fe8f0060f3b6',
                        parentId: 's4gmBg31azZC0UjZjpfTm',
                        hidden: {
                          _code:
                            'return  getSettingValue(data?.direction) !== "horizontal" || !getSettingValue(data?.hasChildren);',
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
                            type: 'dropdown',
                            id: 'justifyContent-s4gmBg31azZC0UjZjpfTm',
                            propertyName: 'justifyContent',
                            label: 'Justify Content',
                            jsSetting: true,
                            layout: 'horizontal',
                            dropdownOptions: [
                              {
                                label: 'center',
                                value: 'center',
                              },
                              {
                                label: 'flex-start',
                                value: 'flex-start',
                              },
                              {
                                label: 'flex-end',
                                value: 'flex-end',
                              },
                              {
                                label: 'left',
                                value: 'left',
                              },
                              {
                                label: 'right',
                                value: 'right',
                              },
                              {
                                label: 'space-between',
                                value: 'space-between',
                              },
                              {
                                label: 'space-around',
                                value: 'space-around',
                              },
                              {
                                label: 'space-evenly',
                                value: 'space-evenly',
                              },
                              {
                                label: 'stretch',
                                value: 'stretch',
                              },
                            ],
                          },
                          {
                            type: 'dropdown',
                            id: 'alignItems-s4gmBg31azZC0UjZjpfTm',
                            propertyName: 'alignItems',
                            label: 'Align Items',
                            jsSetting: true,
                            layout: 'horizontal',
                            dropdownOptions: [
                              {
                                label: 'baseline',
                                value: 'baseline',
                              },
                              {
                                label: 'center',
                                value: 'center',
                              },
                              {
                                label: 'end',
                                value: 'end',
                              },
                              {
                                label: 'flex-end',
                                value: 'flex-end',
                              },
                              {
                                label: 'flex-start',
                                value: 'flex-start',
                              },
                              {
                                label: 'inherit',
                                value: 'inherit',
                              },
                              {
                                label: 'initial',
                                value: 'initial',
                              },
                              {
                                label: 'normal',
                                value: 'normal',
                              },
                              {
                                label: 'revert',
                                value: 'revert',
                              },
                              {
                                label: 'self-end',
                                value: 'self-end',
                              },
                              {
                                label: 'self-start',
                                value: 'self-start',
                              },
                              {
                                label: 'start',
                                value: 'start',
                              },
                              {
                                label: 'stretch',
                                value: 'stretch',
                              },
                              {
                                label: 'unset',
                                value: 'unset',
                              },
                            ],
                          },
                          {
                            type: 'dropdown',
                            id: 'justifyItems-s4gmBg31azZC0UjZjpfTm',
                            propertyName: 'justifyItems',
                            label: 'Justify Items',
                            jsSetting: true,
                            layout: 'horizontal',
                            dropdownOptions: [
                              {
                                label: 'baseline',
                                value: 'baseline',
                              },
                              {
                                label: 'center',
                                value: 'center',
                              },
                              {
                                label: 'end',
                                value: 'end',
                              },
                              {
                                label: 'flex-end',
                                value: 'flex-end',
                              },
                              {
                                label: 'flex-start',
                                value: 'flex-start',
                              },
                              {
                                label: 'inherit',
                                value: 'inherit',
                              },
                              {
                                label: 'initial',
                                value: 'initial',
                              },
                              {
                                label: 'left',
                                value: 'left',
                              },
                              {
                                label: 'legacy',
                                value: 'legacy',
                              },
                              {
                                label: 'normal',
                                value: 'normal',
                              },
                              {
                                label: 'revert',
                                value: 'revert',
                              },
                              {
                                label: 'right',
                                value: 'right',
                              },
                              {
                                label: 'self-end',
                                value: 'self-end',
                              },
                              {
                                label: 'self-start',
                                value: 'self-start',
                              },
                              {
                                label: 'start',
                                value: 'start',
                              },
                              {
                                label: 'stretch',
                                value: 'stretch',
                              },
                              {
                                label: 'unset',
                                value: 'unset',
                              },
                            ],
                          },
                        ],
                      })
                      .addSettingsInputRow({
                        id: 'type-default-value-s4gmBg31azZC0UjZjpfTm',
                        parentId: 's4gmBg31azZC0UjZjpfTm',
                        hidden: {
                          _code: 'return  !getSettingValue(data?.hasChildren);',
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
                            id: 'customCss-s4gmBg31azZC0UjZjpfTm',
                            propertyName: 'className',
                            label: 'Custom CSS Class',
                            jsSetting: true,
                          },
                        ],
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
                          id: 'stylePnl-M500-911MFR',
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInput({
                                readOnly: {
                                  _code: 'return  getSettingValue(data?.readOnly);',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                id: 'custom-css-412c-8461-4c8d55e5c073',
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
