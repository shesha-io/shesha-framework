import { nanoid } from "@/utils/uuid";
import { FormLayout } from 'antd/lib/form/Form';
import { DesignerToolbarSettings } from "@/index";

export const getSettings = (data: any) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
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
                  required: true
                },
                styledLabel: true,
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
                    label: 'Hidden',
                    jsSetting: true,
                  }
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: commonTabId,
                inputs: [
                  {
                    type: 'dropdown',
                    id: nanoid(),
                    propertyName: 'overflow',
                    label: 'Overflow',
                    jsSetting: true,
                    dropdownOptions: [
                      { label: 'Dropdown', value: 'dropdown' },
                      { label: 'Menu', value: 'menu' },
                      { label: 'Scroll', value: 'scroll' }
                    ]
                  }
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: commonTabId,
                inputs: [
                  {
                    type: 'textField',
                    id: nanoid(),
                    propertyName: 'width',
                    label: 'Width',
                    jsSetting: true,
                    validate: { required: true }
                  }
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .toJson()
            ]
          },
          {
            key: 'appearance',
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
                    _mode: "code",
                    _code: "return contexts.canvasContext?.designerDevice || 'desktop';",
                    _value: ""
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
                          components: [...new DesignerToolbarSettings()
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: styleRouterId,
                              inputs: [
                                {
                                  type: 'numberField',
                                  id: nanoid(),
                                  propertyName: 'fontSize',
                                  label: 'Font Size',
                                  jsSetting: true,
                                  min: 1,
                                  max: 100,
                                  defaultValue: 14
                                },
                                {
                                  type: 'numberField',
                                  id: nanoid(),
                                  propertyName: 'height',
                                  label: 'Height',
                                  jsSetting: true,
                                  min: 1,
                                  max: 100,
                                  defaultValue: 6
                                }
                              ],
                              readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: styleRouterId,
                              inputs: [
                                {
                                  type: 'numberField',
                                  id: nanoid(),
                                  propertyName: 'gap',
                                  label: 'Gap',
                                  jsSetting: true,
                                  min: 1,
                                  max: 100,
                                  defaultValue: 12
                                }
                              ],
                              readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .toJson()
                          ]
                        }
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'pnlColors',
                        label: 'Colors',
                        parentId: styleRouterId,
                        labelAlign: 'right',
                        ghost: true,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [...new DesignerToolbarSettings()
                            .addSectionSeparator({
                              id: nanoid(),
                              parentId: styleRouterId,
                              label: 'Selected Item'
                            })
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: styleRouterId,
                              inputs: [
                                {
                                  type: 'colorPicker',
                                  id: nanoid(),
                                  propertyName: 'selectedItemColor',
                                  label: 'Selected Item Color',
                                  jsSetting: true,
                                  allowClear: true
                                },
                                {
                                  type: 'colorPicker',
                                  id: nanoid(),
                                  propertyName: 'selectedItemBackground',
                                  label: 'Selected Item Background',
                                  jsSetting: true,
                                  allowClear: true
                                }
                              ],
                              readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .addSectionSeparator({
                              id: nanoid(),
                              parentId: styleRouterId,
                              label: 'Default Item'
                            })
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: styleRouterId,
                              inputs: [
                                {
                                  type: 'colorPicker',
                                  id: nanoid(),
                                  propertyName: 'itemColor',
                                  label: 'Item Color',
                                  jsSetting: true,
                                  allowClear: true
                                },
                                {
                                  type: 'colorPicker',
                                  id: nanoid(),
                                  propertyName: 'itemBackground',
                                  label: 'Item Background',
                                  jsSetting: true,
                                  allowClear: true
                                }
                              ],
                              readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .addSectionSeparator({
                              id: nanoid(),
                              parentId: styleRouterId,
                              label: 'Hover Item'
                            })
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: styleRouterId,
                              inputs: [
                                {
                                  type: 'colorPicker',
                                  id: nanoid(),
                                  propertyName: 'hoverItemColor',
                                  label: 'Hover Item Color',
                                  jsSetting: true,
                                  allowClear: true
                                },
                                {
                                  type: 'colorPicker',
                                  id: nanoid(),
                                  propertyName: 'hoverItemBackground',
                                  label: 'Hover Background Color',
                                  jsSetting: true,
                                  allowClear: true
                                }
                              ],
                              readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .toJson()
                          ]
                        }
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'pnlCustomStyle',
                        label: 'Custom Style',
                        parentId: styleRouterId,
                        labelAlign: 'right',
                        ghost: true,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                              id: nanoid(),
                              inputType: 'codeEditor',
                              propertyName: 'style',
                              label: 'Style',
                              mode: 'dialog',
                              description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                              readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInput({
                              id: nanoid(),
                              inputType: 'codeEditor',
                              propertyName: 'styleOnHover',
                              label: 'Style On Hover',
                              mode: 'dialog',
                              description: 'A script that returns the hover style of the element as an object. This should conform to CSSProperties',
                              readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInput({
                              id: nanoid(),
                              inputType: 'codeEditor',
                              propertyName: 'styleOnSelected',
                              label: 'Style On Selected',
                              mode: 'dialog',
                              description: 'A script that returns the selected style of the element as an object. This should conform to CSSProperties',
                              readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInput({
                              id: nanoid(),
                              inputType: 'codeEditor',
                              propertyName: 'styleOnSubMenu',
                              label: 'Style On Sub Menu',
                              mode: 'dialog',
                              description: 'A script that returns the sub menu style of the element as an object. This should conform to CSSProperties',
                              readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .toJson()
                          ]
                        }
                      })
                      .toJson()
                  ]
                })
                .toJson()
            ]
          },
          {
            key: 'security',
            title: 'Security',
            id: securityTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                id: nanoid(),
                inputType: 'permissions',
                propertyName: 'permissions',
                label: 'Permissions',
                size: 'small',
                parentId: securityTabId
              })
              .toJson()
            ]
          }
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