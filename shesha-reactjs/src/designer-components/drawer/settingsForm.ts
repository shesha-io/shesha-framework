import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';
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
                .addSettingsInputRow({
                  id: 'palceholder-tooltip-s4gmBg31azZC0UjZjpfTm',
                  parentId: 's4gmBg31azZC0UjZjpfTm',
                  inputs: [
                    {
                      id: 'palceholder-tooltip-s4gmBg31azZC0UjZjpfTm',
                      type: 'text',
                      propertyName: 'componentName',
                      label: 'Component Name',
                      size: 'large',
                      jsSetting: true,
                    },
                  ],
                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                })
                .addCollapsiblePanel({
                  id: 'placement-s4gmBg31azZC0UjZjpfTm',
                  propertyName: 'action',
                  label: 'Actions',
                  labelAlign: 'right',
                  ghost: true,
                  collapsible: 'header',
                  parentId: 's4gmBg31azZC0UjZjpfTm',
                  content: {
                    id: 'placement-s4gmBg31azZC0UjZjpfTm',
                    components: [
                      ...new DesignerToolbarSettings()
                        .addSettingsInputRow({
                          id: '12d700d6-ed4d-49d5-9cfd-fe8f0060f3b6',
                          parentId: 's4gmBg31azZC0UjZjpfTm',
                          readOnly: {
                            _code: 'return  getSettingValue(data?.readOnly);',
                            _mode: 'code',
                            _value: false,
                          } as any,
                          inputs: [
                            {
                              id: '12d700d6-ed4d-49d5-9cfd-fe8f0060f3b6',
                              inputType: 'switch',
                              type: 'switch',
                              propertyName: 'showFooter',
                              label: 'Show Action Buttons',
                              size: 'small',
                              jsSetting: true,
                              defaultValue: true,
                            },
                          ],
                        })
                        .addContainer({
                          id: 'ccc24bf6-f76d-4139-a850-c99bf06c8b69',
                          propertyName: 'containerComponents',
                          direction: 'vertical',
                          hidden: { _code: 'return  !getSettingValue(data?.showFooter);', _mode: 'code', _value: false } as any,
                          parentId: 'pnl24bf6-f76d-4139-a850-c99bf06c8b69',
                          components: new DesignerToolbarSettings()
                            .addSectionSeparator({ id: nanoid(), propertyName: 'okButtonSeparator', label: 'Ok button' })
                            .addConfigurableActionConfigurator({
                              id: nanoid(),
                              propertyName: 'onOkAction',
                              parentId: 'ccc24bf6-f76d-4139-a850-c99bf06c8b69',
                              label: 'Ok Action',
                            })
                            .addSettingsInput(
                              {
                                id: nanoid(),
                                propertyName: 'okText',
                                parentId: 'ccc24bf6-f76d-4139-a850-c99bf06c8b69',
                                label: 'Ok Text',
                                description: 'The text that will be displayed on the Ok button',
                              },
                            )
                            .addSettingsInput({
                              id: nanoid(),
                              propertyName: 'okButtonCustomEnabled',
                              parentId: 'ccc24bf6-f76d-4139-a850-c99bf06c8b69',
                              label: 'Custom Enabled',
                              inputType: 'codeEditor',
                              description: 'Enter custom enabled of the Ok button',
                            })
                            .addSectionSeparator({
                              id: nanoid(),
                              propertyName: 'cancelButtonSeparator',
                              label: 'Cancel button',
                              parentId: 'ccc24bf6-f76d-4139-a850-c99bf06c8b69',
                            })
                            .addConfigurableActionConfigurator({
                              id: nanoid(),
                              propertyName: 'onCancelAction',
                              label: 'Ok Cancel',
                              parentId: 'ccc24bf6-f76d-4139-a850-c99bf06c8b69',
                            })
                            .addSettingsInput({
                              id: nanoid(),
                              propertyName: 'cancelText',
                              label: 'Cancel Text',
                              description: 'The text that will be displayed on the Cancel button',
                              parentId: 'ccc24bf6-f76d-4139-a850-c99bf06c8b69',
                            })
                            .addSettingsInput({
                              id: nanoid(),
                              propertyName: 'cancelButtonCustomEnabled',
                              label: 'Custom Enabled',
                              inputType: 'codeEditor',
                              description: 'Enter custom enabled of the Cancel button',
                              parentId: 'ccc24bf6-f76d-4139-a850-c99bf06c8b69',
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
                              .addSettingsInput({
                                id: 'predefinedOrientation',
                                propertyName: 'placement',
                                label: 'Slide Direction',
                                inputType: 'dropdown',
                                hidden: false,
                                defaultValue: 'right',
                                dropdownOptions: [
                                  { label: 'top', value: 'top' },
                                  { label: 'right', value: 'right' },
                                  { label: 'bottom', value: 'bottom' },
                                  { label: 'left', value: 'left' },
                                ],
                                validate: { required: true },
                              })
                              .addSettingsInputRow({
                                id: 'dimensionsStyleRowWidth',
                                parentId: 'dimensionsStylePnl',
                                inline: true,
                                readOnly: {
                                  _code: 'return  getSettingValue(data?.readOnly);',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                hidden: {
                                  _code:
                                    'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.placement) !== "right" && getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.placement) !== "left";',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                inputs: [
                                  {
                                    type: 'text',
                                    id: 'width-s4gmBg31azZC0UjZjpfTm',
                                    label: 'Width',
                                    width: 85,
                                    propertyName: 'width',
                                    icon: 'width',
                                    tooltip: 'You can use any unit (%, px, em, etc). px by default if without unit',
                                  },
                                ],
                              })
                              .addSettingsInputRow({
                                id: 'dimensionsStyleRowHeight',
                                parentId: 'dimensionsStylePnl',
                                inline: true,
                                readOnly: {
                                  _code: 'return getSettingValue(data?.readOnly);',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                hidden: {
                                  _code:
                                    'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.placement) !== "top" && getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.placement) !== "bottom";',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                inputs: [
                                  {
                                    type: 'text',
                                    id: 'height-s4gmBg31azZC0UjZjpfTm',
                                    label: 'height',
                                    width: 85,
                                    propertyName: 'dimensions.height',
                                    icon: 'height',
                                    tooltip: 'You can use any unit (%, px, em, etc). px by default if without unit',
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
                        propertyName: 'style',
                        label: 'Custom Style',
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
