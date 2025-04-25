import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { fontTypes, fontWeights } from '../_settings/utils/font/utils';
import { nanoid } from '@/utils/uuid';

export const getSettings = (data: any) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const appearanceTabId = nanoid();
  const securityTabId = nanoid();
  const styleRouterId = nanoid();
  const fontStylePnlId = nanoid();
  const dimensionsStylePnlId = nanoid();

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
                  propertyName: 'componentName',
                  label: 'Component Name',
                  jsSetting: true,
                })
                .addContainer({
                  id: nanoid(),
                  parentId: commonTabId,
                  hidden: { _code: 'return  getSettingValue(data?.orientation) === "vertical";', _mode: 'code', _value: false } as any,
                  components: [
                    ...new DesignerToolbarSettings()
                      .addLabelConfigurator({
                        id: nanoid(),
                        propertyName: 'hideLabel',
                        label: 'Label',
                        parentId: commonTabId,
                        hideLabel: true,
                        labelAlignOptions: [
                          { value: 'left', icon: 'AlignLeftOutlined', title: 'Left' },
                          { value: 'center', icon: 'AlignCenterOutlined', title: 'Center' },
                          { value: 'right', icon: 'AlignRightOutlined', title: 'Right' },
                        ],
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: commonTabId,
                        inputs: [
                          {
                            id: nanoid(),
                            parentId: commonTabId,
                            type: 'textArea',
                            propertyName: 'description',
                            label: 'Tooltip',
                            jsSetting: true,
                            hidden: { _code: 'return  getSettingValue(data?.orientation) === "vertical";', _mode: 'code', _value: false } as any,
                          },
                        ],
                      }).toJson(),
                  ]
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      id: nanoid(),
                      parentId: commonTabId,
                      type: 'dropdown',
                      propertyName: 'orientation',
                      label: 'Orientation',
                      jsSetting: true,
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
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'inline',
                      label: 'Inline',
                      size: 'small',
                      hidden: { _code: 'return  getSettingValue(data?.orientation) === "vertical";', _mode: 'code', _value: false } as any,
                      jsSetting: true,
                    }
                  ]
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
                    }
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
                        propertyName: 'lineStyle',
                        label: 'Line Style',
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
                                parentId: 'fontStylePnlline',
                                inline: true,
                                propertyName: 'lineFont',
                                inputs: [
                                  {
                                    type: 'numberField',
                                    id: nanoid(),
                                    label: 'Thickness',
                                    propertyName: 'lineFont.size',
                                    hideLabel: false,
                                    width: 50,
                                  },
                                  {
                                    type: 'colorPicker',
                                    id: nanoid(),
                                    label: 'Color',
                                    hideLabel: false,
                                    propertyName: 'lineFont.color',
                                  },
                                  {
                                    type: 'dropdown',
                                    id: nanoid(),
                                    label: 'Type',
                                    propertyName: 'lineType',
                                    hideLabel: false,
                                    defaultValue: 'solid',
                                    dropdownOptions: [
                                      {
                                        label: 'Solid',
                                        value: 'solid',
                                      },
                                      {
                                        label: 'Dashed',
                                        value: 'dashed',
                                      },
                                      {
                                        label: 'Dotted',
                                        value: 'dotted',
                                      }
                                    ],
                                  }
                                ],
                              })
                              .toJson(),
                          ],
                        },
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
                          id: dimensionsStylePnlId,
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: dimensionsStylePnlId,
                                inline: true,
                                hidden: {
                                  _code: 'return  getSettingValue(data?.orientation) === "vertical";',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                inputs: [
                                  {
                                    type: 'textField',
                                    id: nanoid(),
                                    label: 'Width',
                                    width: 85,
                                    propertyName: 'lineWidth',
                                    icon: 'widthIcon',
                                    tooltip: 'You can use any unit (%, px, em, etc). px by default if without unit',
                                  },
                                ],
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: dimensionsStylePnlId,
                                inline: true,
                                hidden: {
                                  _code: 'return  getSettingValue(data?.orientation) === "horizontal";',
                                  _mode: 'code',
                                  _value: false,
                                } as any,

                                inputs: [
                                  {
                                    type: 'textField',
                                    id: nanoid(),
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
                        id: nanoid(),
                        propertyName: 'titleStyle',
                        label: 'Title Style',
                        labelAlign: 'right',
                        ghost: true,
                        collapsedByDefault: true,
                        parentId: styleRouterId,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
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
                                        ],
                                      })
                                      .toJson(),
                                  ],
                                },
                              })
                              .addCollapsiblePanel({
                                id: nanoid(),
                                propertyName: 'customStyle',
                                label: 'Custom Styles',
                                labelAlign: 'right',
                                ghost: true,
                                content: {
                                  id: nanoid(),
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addSettingsInput({
                                        id: nanoid(),
                                        inputType: 'codeEditor',
                                        propertyName: 'titleStyle',
                                        hideLabel: false,
                                        label: 'Style',
                                        description:
                                          'A script that returns the style of the element as an object. This should conform to CSSProperties',
                                      })
                                      .toJson()
                                  ]
                                }
                              })
                              .toJson(),
                          ],
                        },
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'customStyle',
                        label: 'Container Style',
                        labelAlign: 'right',
                        ghost: true,
                        collapsedByDefault: true,
                        parentId: styleRouterId,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
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
                                        propertyName: 'containerStylingBox',
                                      })
                                      .toJson(),
                                  ],
                                },
                              })
                              .addCollapsiblePanel({
                                id: nanoid(),
                                propertyName: 'customStyle',
                                label: 'Custom Styles',
                                labelAlign: 'right',
                                ghost: true,
                                content: {
                                  id: nanoid(),
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addSettingsInput({
                                        id: nanoid(),
                                        inputType: 'codeEditor',
                                        propertyName: 'containerStyle',
                                        hideLabel: false,
                                        label: 'Style',
                                        description:
                                          'A script that returns the style of the element as an object. This should conform to CSSProperties',
                                      })
                                      .toJson()
                                  ]
                                }
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
