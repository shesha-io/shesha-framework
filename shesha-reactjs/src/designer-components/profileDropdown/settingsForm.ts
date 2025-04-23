import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';
import { fontTypes, fontWeights, textAlign } from '../_settings/utils/font/utils';

export const getSettings = (data: any) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const styleTabId = nanoid();
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
                propertyName: 'propertyName',
                parentId: commonTabId,
                label: '',
                styledLabel: true,
                size: 'small',
                validate: {
                  required: true,
                },
                jsSetting: true,
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'textField',
                propertyName: 'subText',
                label: 'Sub Text',
                parentId: commonTabId,
                jsSetting: true,
              })
              .addSettingsInputRow({
                id: nanoid(),
                propertyName: 'items',
                label: 'Configure Menu Buttons',
                parentId: commonTabId,
                jsSetting: true,
                inputs: [
                  {
                    id: nanoid(),
                    type: 'buttonGroupConfigurator',
                    propertyName: 'items',
                    label: 'Configure Menu Buttons',
                    parentId: commonTabId,
                    jsSetting: true,
                  },
                  {
                    id: nanoid(),
                    type: 'textField',
                    propertyName: 'popOverTitle',
                    label: 'Popover Title',
                    parentId: commonTabId,
                    hidden: { _code: 'return data?.showUserInfo != true', _mode: 'code', _value: false } as any,
                    jsSetting: true,
                  }
                ]
              })
              .addSettingsInputRow({
                id: nanoid(),
                propertyName: 'showUserInfo',
                label: 'Show User Info',
                parentId: commonTabId,
                jsSetting: true,
                inputs: [
                  {
                    id: nanoid(),
                    type: 'switch',
                    propertyName: 'showUserInfo',
                    label: 'Show User Info',
                    parentId: commonTabId,
                    jsSetting: true,
                  },
                  {
                    id: nanoid(),
                    type: 'formAutocomplete',
                    propertyName: 'popOverFormId',
                    label: 'Popover Form',
                    parentId: commonTabId,
                    hidden: { _code: 'return data?.showUserInfo != true', _mode: 'code', _value: false } as any,
                    jsSetting: true,
                  }
                ]
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'switch',
                propertyName: 'hidden',
                label: 'Hide',
                parentId: commonTabId,
                jsSetting: true,
              })
              .toJson()
            ]
          },
          {
            key: 'appearance',
            title: 'Appearance',
            id: styleTabId,
            components: [...new DesignerToolbarSettings()
              .addPropertyRouter({
                id: styleRouterId,
                propertyName: 'propertyRouter1',
                componentName: 'propertyRouter',
                label: 'Property router1',
                labelAlign: 'right',
                parentId: styleTabId,
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
                      propertyName: 'subTextStyle',
                      label: 'Sub Text Style',
                      labelAlign: 'right',
                      ghost: true,
                      parentId: styleRouterId,
                      collapsible: 'header',
                      content: {
                        id: nanoid(),
                        components: [...new DesignerToolbarSettings()
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
                              components: [...new DesignerToolbarSettings()
                                .addSettingsInputRow({
                                  id: 'try26voxhs-HxJ5k5ngYE',
                                  parentId: 'fontStylePnl',
                                  inline: true,
                                  propertyName: 'font',
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
                                      type: 'numberField',
                                      id: 'fontSize-s4gmBg31azZC0UjZjpfTm',
                                      label: 'Size',
                                      propertyName: 'subTextFontSize',
                                      hideLabel: true,
                                      width: 50,
                                    },
                                    {
                                      type: 'dropdown',
                                      id: 'fontWeight-s4gmBg31azZC0UjZjpfTm',
                                      label: 'Weight',
                                      propertyName: 'font.weight',
                                      hideLabel: true,
                                      tooltip: "Controls text thickness (light, normal, bold, etc.)",
                                      dropdownOptions: fontWeights,
                                      width: 100,
                                    },
                                    {
                                      type: 'colorPicker',
                                      id: 'fontColor-s4gmBg31azZC0UjZjpfTm',
                                      label: 'Color',
                                      hideLabel: true,
                                      propertyName: 'subTextColor',
                                    },
                                    {
                                      type: 'dropdown',
                                      id: 'fontAlign-s4gmBg31azZC0UjZjpfTm',
                                      label: 'Align',
                                      propertyName: 'font.align',
                                      hideLabel: true,
                                      width: 60,
                                      dropdownOptions: textAlign,
                                      hidden: { _code: 'return  getSettingValue(data?.mode) === "multiple";', _mode: 'code', _value: false } as any,
                                    },
                                  ],
                                })
                                .toJson()
                              ]
                            }
                          })
                          .addSettingsInput({
                            readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            id: nanoid(),
                            inputType: 'codeEditor',
                            propertyName: 'subTextStyle',
                            hideLabel: false,
                            label: 'Custom Style',
                            description: 'A script that returns the style of the sub text as an object. This should conform to CSSProperties',
                          })
                          .toJson()
                        ]
                      }
                    })
                    .addCollapsiblePanel({
                      id: nanoid(),
                      propertyName: 'popOverStyle',
                      label: 'Popover Style',
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
                            propertyName: 'popOverContentStyle',
                            label: 'Content Style',
                            description: 'A script that returns the style of the popover content as an object. This should conform to CSSProperties',
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