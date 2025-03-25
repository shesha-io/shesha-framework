import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { ISwitchComponentProps } from './interfaces';
import { nanoid } from '@/utils/uuid';

export const getSettings = (data: ISwitchComponentProps) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();
  const securityTabId = nanoid();

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
            components: [
              ...new DesignerToolbarSettings()
                .addContextPropertyAutocomplete({
                  id: nanoid(),
                  propertyName: 'propertyName',
                  label: 'Property name',
                  styledLabel: true,
                  parentId: commonTabId,
                  validate: { required: true },
                  jsSetting: true,
                  size: 'small',
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
                  inputs: [
                    {
                      type: 'textArea',
                      id: nanoid(),
                      propertyName: 'description',
                      label: 'Tooltip',
                      jsSetting: true,
                    },
                  ],
                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  readOnly: { _code: `return getSettingValue(data.readOnly)`, _mode: 'code', _value: false } as any,
                  inputs: [
                    {
                      type: 'editModeSelector',
                      id: nanoid(),
                      propertyName: 'editMode',
                      label: 'Edit Mode',
                      size: 'small',
                      defaultValue: 'inherited',
                      jsSetting: true,
                    },
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'hidden',
                      label: 'Hide',
                      size: 'small',
                      jsSetting: true,
                    }
                  ]
                })
                .toJson()
            ]
          },
          {
            key: 'security',
            title: 'Security',
            id: securityTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  id: nanoid(),
                  inputType: 'permissions',
                  propertyName: 'permissions',
                  label: 'Permissions',
                  size: 'small',
                  parentId: securityTabId,
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
                  id: 'styleRouter',
                  propertyName: 'propertyRouter1',
                  componentName: 'propertyRouter',
                  label: 'Property router1',
                  labelAlign: 'right',
                  parentId: appearanceTabId,
                  hidden: false,
                  propertyRouteName: {
                    _mode: "code",
                    _code: "    return contexts.canvasContext?.designerDevice || 'desktop';",
                    _value: ""
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
                          components: [...new DesignerToolbarSettings()
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: 'dimensionsStylePnl',
                              inline: true,
                              readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                              inputs: [
                                {
                                  type: 'dropdown',
                                  id: nanoid(),
                                  label: "Size",
                                  propertyName: "size",
                                  defaultValue: 'default',
                                  dropdownOptions: [
                                    { value: 'small', label: 'Small' },
                                    { value: 'default', label: 'Default' },
                                  ]
                                },
                              ]
                            })
                            .toJson()
                          ]
                        }
                      })
                      .addCollapsiblePanel({
                        id: 'customStyleCollapsiblePanel',
                        propertyName: 'customStyle',
                        label: 'Custom Style',
                        labelAlign: 'right',
                        ghost: true,
                        parentId: 'styleRouter',
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                              readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                              id: nanoid(),
                              inputType: 'codeEditor',
                              propertyName: 'style',
                              label: 'Style',
                              description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
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
            key: 'events',
            title: 'Events',
            id: eventsTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  id: nanoid(),
                  inputType: 'codeEditor',
                  propertyName: 'onChangeCustom',
                  label: 'On Change',
                  labelAlign: 'right',
                  tooltip: 'Enter custom eventhandler on changing of event. (form, event) are exposed',
                  parentId: eventsTabId
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