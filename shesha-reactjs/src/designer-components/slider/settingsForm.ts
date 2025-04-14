import { nanoid } from '@/utils/uuid';
import { DesignerToolbarSettings } from '@/interfaces';
import { FormLayout } from 'antd/lib/form/Form';
 
export const getSettings = (data: any) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const dataTabId = nanoid();
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
                propertyName: 'propertyName',
                parentId: commonTabId,
                label: 'Property name',
                size: 'small',
                validate: {
                  required: true
                },
                styledLabel: true,
                jsSetting: true,
              })
              .addLabelConfigurator({
                id: '46d07439-4c18-468c-89e1-60c002ce96c5',
                propertyName: 'hideLabel',
                label: 'Label',
                parentId: 's4gmBg31azZC0UjZjpfTm',
                hideLabel: true,
            })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: commonTabId,
                inputs: [
                  {
                    type:'editModeSelector',
                    id: nanoid(),
                    propertyName: 'editMode',
                    label: 'Edit Mode',
                    defaultValue: 'inherited',
                    jsSetting: true,
                  },
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'hidden',
                    label: 'Hide',
                    jsSetting: true,
                  },
                ]
              })
              .toJson()
            ]
          },
          {
            key: 'data',
            title: 'Data',
            id: dataTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInputRow({
                id: nanoid(),
                parentId: dataTabId,
                inputs: [
                  {
                    type: 'numberField',
                    id: nanoid(),
                    propertyName: 'defaultValue',
                    label: 'Default Value',
                    jsSetting: true,
                  }
                ]
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: dataTabId,
                inputs: [
                  {
                    type: 'numberField',
                    id: nanoid(),
                    propertyName: 'min',
                    label: 'Minimum',
                    jsSetting: true,
                  },
                  {
                    type: 'numberField',
                    id: nanoid(),
                    propertyName: 'max',
                    label: 'Maximum',
                    jsSetting: true,
                  }
                ]
              })
              .toJson()
            ]
          },
          {
            key: 'appearance',
            title: 'Appearance',
            id: appearanceTabId,
            components: [...new DesignerToolbarSettings()
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
                      parentId: styleRouterId,
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
                            parentId: 'root',
                            mode: 'dialog',
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
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                id: nanoid(),
                inputType: 'permissions',
                propertyName: 'permissions',
                label: 'Permissions',
                size: 'small',
                parentId: securityTabId,
                tooltip: 'Enter a list of permissions that should be associated with this component',
                jsSetting: true,
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