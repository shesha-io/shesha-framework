import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { IRateProps } from '.';

export const getSettings = (data: IRateProps) => {
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
                  parentId: commonTabId,
                  styledLabel: true,
                  validate: { required: true },
                  size: 'small',
                  jsSetting: true
                })
                .addLabelConfigurator({
                  id: nanoid(),
                  propertyName: 'hideLabel',
                  label: 'Label',
                  parentId: commonTabId,
                  hideLabel: true,
                  defaultValue: true,
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
                  hidden: { _code: 'return  getSettingValue(data?.hideLabel);', _mode: 'code', _value: false } as any,
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'numberField',
                      id: nanoid(),
                      propertyName: 'count',
                      label: 'Max Rating',
                      jsSetting: true,
                    },
                    {
                      type: 'iconPicker',
                      id: nanoid(),
                      propertyName: 'icon',
                      label: 'Icon',
                      jsSetting: true,
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
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
                      defaultValue: 'inherit',
                      jsSetting: true,
                    }
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
                  id: nanoid(),
                  inputType: 'codeEditor',
                  propertyName: 'onChangeCustom',
                  label: 'On Change',
                  labelAlign: 'right',
                  tooltip: 'Enter custom eventhandler on changing of event.',
                  parentId: eventsTabId
                })
                .addSettingsInput({
                    id: '88c2d96c-b808-4316-8a36-701b09e5f6c7',
                    inputType: 'codeEditor',
                    propertyName: 'onFocusCustom',
                    label: 'On Focus',
                    labelAlign: 'right',
                    tooltip: 'Enter custom eventhandler on focus of event.',
                    parentId: 'Cc47W08MWrKdhoGqFKMI2'
                })
                .addSettingsInput({
                    id: '4a2b7329-1a89-45d1-a5b0-f66db21744b0',
                    inputType: 'codeEditor',
                    propertyName: 'onBlurCustom',
                    label: 'On Blur',
                    labelAlign: 'right',
                    tooltip: 'Enter custom eventhandler on blur of event.',
                    parentId: 'Cc47W08MWrKdhoGqFKMI2'
                })
                .addSettingsInput({
                  id: '1232d96c-b808-4316-8a36-701b09e5f6c7',
                  inputType: 'codeEditor',
                  propertyName: 'onClickCustom',
                  label: 'On Click',
                  labelAlign: 'right',
                  tooltip: 'Enter custom eventhandler on click of event.',
                  parentId: 'Cc47W08MWrKdhoGqFKMI2'
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
                  parentId: 'elgrlievlfwehhh848r8hsdnflsdnclurbd',
                  hidden: false,
                  propertyRouteName: {
                    _mode: "code",
                    _code: "    return contexts.canvasContext?.designerDevice || 'desktop';",
                    _value: ""
                  },
                  components: [
                    ...new DesignerToolbarSettings()
                      .addCollapsiblePanel({
                        id: 'customStyleCollapsiblePanel',
                        propertyName: 'customStyle',
                        label: 'Custom Styles',
                        labelAlign: 'right',
                        ghost: true,
                        parentId: 'styleRouter',
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                              id: nanoid(),
                              inputType: 'codeEditor',
                              propertyName: 'style',
                              hideLabel: false,
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
            key: 'security',
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
                .toJson()
            ]
          },
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