import { DesignerToolbarSettings } from "@/index";
import { nanoid } from "@/utils/uuid";
import { FormLayout } from "antd/lib/form/Form";

export const getSettings = (data: any) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const dataTabId = nanoid();
  const mainStylesTabId = nanoid();
  const eventsTabId = nanoid();
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
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  inputs: [
                    {
                      type: 'textField',
                      id: nanoid(),
                      propertyName: 'componentName',
                      label: 'Component Name',
                      jsSetting: false,
                      validate: {
                        required: true
                      }
                    }
                  ]
                })
                    .addSettingsInputRow({
                      id: nanoid(),
                      parentId: commonTabId,
                      readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                      inputs: [
                        {
                          id: nanoid(),
                          type: 'editModeSelector',
                          propertyName: 'editMode',
                          label: 'Edit Mode',
                          parentId: commonTabId,
                          defaultValue: 'inherited',
                          jsSetting: true,
                        },
                        {
                          type: 'switch',
                          id: nanoid(),
                          propertyName: 'autoSize',
                          label: 'Auto Size',
                          jsSetting: true
                        },
                        {
                          type: 'switch',
                          id: nanoid(),
                          propertyName: 'hidden',
                          label: 'Hide',
                          jsSetting: true
                        }
                      ]
                    })
                .toJson()
            ]
          },
          {
            key: 'mainsettings',
            title: 'Main Settings',
            id: mainStylesTabId,
            components: [
              ...new DesignerToolbarSettings()
              .addSettingsInputRow({
                id: nanoid(),
                parentId: commonTabId,
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                inputs: [
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'allowDelete',
                    label: 'Allow Delete',
                    jsSetting: true
                  }
                ]
              })
            .toJson()
            ]
          },
          {
            key: 'data',
            title: 'Data',
            id: dataTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: dataTabId,
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  inputs: [
                    {
                      type: 'textField',
                      id: nanoid(),
                      propertyName: 'ownerId',
                      label: 'Owner Id',
                      jsSetting: true
                    }
                  ]
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: dataTabId,
                  readOnly: false,
                  inputs: [
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'hidden',
                      label: 'hide'
                    },
                    {
                      id: nanoid(),
                      propertyName: 'ownerType',
                      type: 'autocomplete',
                      parentId: nanoid(),
                      label: 'Owner Type',
                      labelAlign: 'right',
                      dataSourceType: 'url',
                      dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
                      mode: 'single',
                      jsSetting: true
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
                  propertyName: 'onCreated',
                  label: 'On Created',
                  labelAlign: 'right',
                  parentId: eventsTabId,
                  tooltip: 'Triggered after successfully creating a new note',
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  // wrapInTemplate: true,
                  // templateSettings: {
                  //   functionName: 'onCreated'
                  // }
                })
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'codeEditor',
                  propertyName: 'onUpdated',
                  label: 'On Updated',
                  labelAlign: 'right',
                  parentId: eventsTabId,
                  tooltip: 'Triggered after successfully updating a note',
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  // wrapInTemplate: true,
                  // templateSettings: {
                  //   functionName: 'onUpdated'
                  // }
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
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: appearanceTabId,
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  inputs: [
                    {
                      type: 'dropdown',
                      id: nanoid(),
                      propertyName: 'savePlacement',
                      label: 'Buttons Layout',
                      tooltip: 'This is used to place the save button (Left, Right).',
                      defaultValue: 'left',
                      jsSetting: true,
                      dropdownOptions: [
                        { value: 'left', label: 'Left' },
                        { value: 'right', label: 'Right' }
                      ]
                    }
                  ]
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
                    _mode: "code",
                    _code: "return contexts.canvasContext?.designerDevice || 'desktop';",
                    _value: ""
                  },
                  components: [
                    ...new DesignerToolbarSettings()
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
                          components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                              readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                              id: nanoid(),
                              inputType: 'codeEditor',
                              propertyName: 'style',
                              hideLabel: false,
                              label: 'Style',
                              description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                              jsSetting: true
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
                  parentId: securityTabId,
                  validate: {},
                  jsSetting: true
                })
                .toJson()
            ]
          }
        ]
      })
      .toJson(),
    formSettings: {
      layout: 'vertical' as FormLayout,
      colon: false,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 }
    }
  };
};