import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { fontTypes, fontWeights, textAlign } from '../_settings/utils/font/utils';
import { FormLayout } from 'antd/es/form/Form';
import { nanoid } from '@/utils/uuid';

export const getSettings = (data: any) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const appearanceTabId = nanoid();
  const securityTabId = nanoid();
  const styleRouterId = nanoid();
  const fontStylePnlId = nanoid();

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
                .addLabelConfigurator({
                  id: nanoid(),
                  propertyName: 'hideLabel',
                  label: 'Label',
                  parentId: commonTabId,
                  hideLabel: true,
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  hidden: { _code: 'return  getSettingValue(data?.hasChildren);', _mode: 'code', _value: false } as any,
                  inputs: [
                    {
                      id: nanoid(),
                      type: 'textArea',
                      propertyName: 'content',
                      label: 'Content',
                      size: 'small',
                      jsSetting: true,
                    },
                  ],
                })
                .addSettingsInput({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputType: 'textField',
                  propertyName: 'href',
                  label: 'Href',
                  size: 'small',
                  jsSetting: true,
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,

                  inputs: [
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'hasChildren',
                      label: 'Has Children',
                      size: 'small',
                      jsSetting: true,
                    },
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
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  hidden: {
                    _code: 'return  !getSettingValue(data?.hasChildren);',
                    _mode: 'code',
                    _value: false,
                  } as any,
                  inputs: [
                    {
                      type: 'dropdown',
                      id: nanoid(),
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
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'dropdown',
                      id: nanoid(),

                      propertyName: 'target',
                      label: 'Target',
                      size: 'small',
                      validate: {
                        required: true,
                      },
                      jsSetting: true,
                      dropdownOptions: [
                        {
                          label: 'Blank',
                          value: '_blank',
                        },
                        {
                          label: 'Parent',
                          value: '_parent',
                        },
                        {
                          label: 'Self',
                          value: '_self',
                        },
                        {
                          label: 'Top',
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
            id: appearanceTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInputRow({
                  id: 'direction-options-row',
                  parentId: 'styleRouter',
                  hidden: {
                    _code: 'return  !getSettingValue(data?.hasChildren);',
                    _mode: 'code',
                    _value: false,
                  } as any,
                  inputs: [
                    {
                      type: 'dropdown',
                      id: 'direction-s4gmBg31azZC0UjZjpfTm',
                      propertyName: 'direction',
                      label: 'Direction',
                      jsSetting: true,
                      layout: 'horizontal',
                      defaultValue: 'vertical',
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
                        propertyName: 'pnlFontStyle',
                        label: 'Font',
                        hidden: {
                          _code: 'return  getSettingValue(data?.hasChildren);',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        labelAlign: 'right',
                        parentId: styleRouterId,
                        ghost: true,
                        collapsible: 'header',
                        content: {
                          id: fontStylePnlId,
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: fontStylePnlId,
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
                                    tooltip: 'Controls text thickness (light, normal, bold, etc.)',
                                    dropdownOptions: fontWeights,
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
                        id: nanoid(),
                        parentId: styleRouterId,

                        hidden: {
                          _code:
                            'return  getSettingValue(data?.direction) !== "horizontal"',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        inputs: [
                          {
                            type: 'dropdown',
                            id: nanoid(),
                            propertyName: 'justifyContent',
                            label: 'Justify Content',
                            jsSetting: true,
                            layout: 'horizontal',
                            dropdownOptions: [
                              {
                                label: 'Center',
                                value: 'center',
                              },
                              {
                                label: 'Flex Start',
                                value: 'flex-start',
                              },
                              {
                                label: 'Flex End',
                                value: 'flex-end',
                              },
                              {
                                label: 'Left',
                                value: 'left',
                              },
                              {
                                label: 'Right',
                                value: 'right',
                              },
                              {
                                label: 'Space Between',
                                value: 'space-between',
                              },
                              {
                                label: 'Space Around',
                                value: 'space-around',
                              },
                              {
                                label: 'Space Evenly',
                                value: 'space-evenly',
                              },
                              {
                                label: 'Stretch',
                                value: 'stretch',
                              },
                            ],
                          },
                          {
                            type: 'dropdown',
                            id: nanoid(),
                            propertyName: 'alignItems',
                            label: 'Align Items',
                            jsSetting: true,
                            layout: 'horizontal',
                            dropdownOptions: [
                              {
                                label: 'Baseline',
                                value: 'baseline',
                              },
                              {
                                label: 'Center',
                                value: 'center',
                              },
                              {
                                label: 'End',
                                value: 'end',
                              },
                              {
                                label: 'Flex End',
                                value: 'flex-end',
                              },
                              {
                                label: 'Flex Start',
                                value: 'flex-start',
                              },
                              {
                                label: 'Inherit',
                                value: 'inherit',
                              },
                              {
                                label: 'Initial',
                                value: 'initial',
                              },
                              {
                                label: 'Normal',
                                value: 'normal',
                              },
                              {
                                label: 'Revert',
                                value: 'revert',
                              },
                              {
                                label: 'Self End',
                                value: 'self-end',
                              },
                              {
                                label: 'Self Start',
                                value: 'self-start',
                              },
                              {
                                label: 'Start',
                                value: 'start',
                              },
                              {
                                label: 'Stretch',
                                value: 'stretch',
                              },
                              {
                                label: 'Unset',
                                value: 'unset',
                              },
                            ],
                          },
                        ],
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: styleRouterId,

                        hidden: {
                          _code: 'return  !getSettingValue(data?.hasChildren);',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        inputs: [
                          {
                            type: 'dropdown',
                            id: nanoid(),
                            propertyName: 'justifyItems',
                            label: 'Justify Items',
                            hidden: {
                              _code:
                                'return  getSettingValue(data?.direction) !== "horizontal"',
                              _mode: 'code',
                              _value: false,
                            } as any,
                            jsSetting: true,
                            layout: 'horizontal',
                            dropdownOptions: [
                              {
                                label: 'Baseline',
                                value: 'baseline',
                              },
                              {
                                label: 'Center',
                                value: 'center',
                              },
                              {
                                label: 'End',
                                value: 'end',
                              },
                              {
                                label: 'Flex End',
                                value: 'flex-end',
                              },
                              {
                                label: 'Flex Start',
                                value: 'flex-start',
                              },
                              {
                                label: 'inherit',
                                value: 'inherit',
                              },
                              {
                                label: 'Initial',
                                value: 'initial',
                              },
                              {
                                label: 'Left',
                                value: 'left',
                              },
                              {
                                label: 'Legacy',
                                value: 'legacy',
                              },
                              {
                                label: 'Normal',
                                value: 'normal',
                              },
                              {
                                label: 'Revert',
                                value: 'revert',
                              },
                              {
                                label: 'Right',
                                value: 'right',
                              },
                              {
                                label: 'Self End',
                                value: 'self-end',
                              },
                              {
                                label: 'Self Start',
                                value: 'self-start',
                              },
                              {
                                label: 'Start',
                                value: 'start',
                              },
                              {
                                label: 'Stretch',
                                value: 'stretch',
                              },
                              {
                                label: 'Unset',
                                value: 'unset',
                              },
                            ],
                          },
                          {
                            type: 'textField',
                            id: nanoid(),
                            propertyName: 'className',
                            label: 'Custom CSS Class',
                            jsSetting: true,
                          },
                        ],
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
                      .toJson(),
                  ],
                })
                .toJson(),
            ],
          },
          {
            key: '5',
            title: 'Security',
            id: securityTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'permissions',
                  propertyName: 'permissions',
                  label: 'Permissions',
                  size: 'small',
                  parentId: securityTabId,
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
