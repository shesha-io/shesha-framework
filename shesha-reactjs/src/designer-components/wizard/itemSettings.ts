import { DesignerToolbarSettings } from '@/interfaces';
import { nanoid } from '@/utils/uuid';

export const getItemSettings = () => {
  return new DesignerToolbarSettings()
    .addSearchableTabs({
      id: nanoid(),
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
          id: nanoid(),
          components: [...new DesignerToolbarSettings()
            .addSettingsInputRow({
              id: nanoid(),
              readOnly: false,
              inputs: [
                {
                  id: nanoid(),
                  type: 'textField',
                  propertyName: 'name',
                  label: 'Component Name',
                  parentId: 'root',
                  size: 'small',
                  validate: {
                    required: true,
                  },
                },
                {
                  id: '02deeaa2-1dc7-439f-8f1a-1f8bec6e8425',
                  propertyName: 'title',
                  type: 'textField',
                  label: 'Title',
                  labelAlign: 'right',
                  parentId: 'root',
                  jsSetting: true,
                }
              ]
            })
            .addSettingsInputRow({
              id: nanoid(),
              readOnly: false,
              inputs: [
                {
                  id: nanoid(),
                  type: 'textField',
                  propertyName: 'subTitle',
                  label: 'Sub Title',
                  labelAlign: 'right',
                  parentId: 'root',
                  jsSetting: true,
                },
                {
                  id: '4dca96b4-095d-4d92-aad8-2135e07c04a6',
                  propertyName: 'description',
                  type: 'textArea',
                  label: 'Description',
                  labelAlign: 'right',
                  parentId: 'root',
                  jsSetting: true,
                }
              ]
            })
            .addSettingsInputRow({
              id: nanoid(),
              readOnly: false,
              inputs: [
                {
                  id: nanoid(),
                  type: 'textField',
                  propertyName: 'key',
                  label: 'Key',
                  labelAlign: 'right',
                  parentId: 'root',
                  jsSetting: true,
                },
                {
                  id: nanoid(),
                  type: 'dropdown',
                  propertyName: 'status',
                  label: 'Status',
                  labelAlign: 'right',
                  parentId: 'root',
                  hidden: true,
                  dropdownOptions: [
                    { label: 'Wait', value: 'wait' },
                    { label: 'Process', value: 'process' },
                    { label: 'Finish', value: 'finish' },
                    { label: 'Error', value: 'error' },
                  ],
                  validate: { required: true },
                },
              ]
            })
            .addSettingsInputRow({
              id: nanoid(),
              readOnly: false,
              inputs: [
                {
                  id: nanoid(),
                  type: 'iconPicker',
                  propertyName: 'icon',
                  label: 'Icon',
                  labelAlign: 'right',
                  parentId: 'root',
                  hidden: false,
                  settingsValidationErrors: [],
                },
                {
                  id: 'f5b9b8c6-1a3d-4e0d-9b5d-9a8f7f4e4f9c',
                  type: 'switch',
                  propertyName: 'allowCancel',
                  label: 'Allow Cancel',
                  labelAlign: 'right',
                  parentId: 'root',
                  hidden: false,
                  defaultValue: false,
                  validate: {},
                  jsSetting: true,
                }]
            })
            .addSettingsInput({
              inputType: 'switch',
              id: 'd5a6f5a9-8b0c-4c6d-8f7e-6a3f7b1b2b4d',
              propertyName: 'canSkipTo',
              label: 'Can Skip To',
              labelAlign: 'right',
              parentId: 'root',
              hidden: false,
              defaultValue: false,
              validate: {},
              jsSetting: true,
            })
            .addCollapsiblePanel({
              id: 'nextButtonCollapsiblePanel',
              propertyName: 'nextButtonCollapsiblePanel',
              label: 'Next Button',
              labelAlign: 'right',
              parentId: 'root',
              ghost: true,
              collapsible: 'header',
              content: {
                id: 'nextButtonContent',
                components: [...new DesignerToolbarSettings()
                  .addSettingsInputRow({
                    id: nanoid(),
                    readOnly: false,
                    inputs: [
                      {
                        id: nanoid(),
                        type: 'textField',
                        propertyName: 'nextButtonText',
                        label: 'Text',
                        labelAlign: 'right',
                        parentId: 'nextButtonContent',
                        jsSetting: true,
                      },
                      {
                        id: nanoid(),
                        type: 'codeEditor',
                        propertyName: 'nextButtonCustomEnabled',
                        label: 'Custom Enabled',
                        description: 'Write the code that returns whether this button is enabled',
                        labelAlign: 'right',
                        parentId: 'root',
                      }]
                  })
                  .addSettingsInputRow({
                    id: nanoid(),
                    readOnly: false,
                    inputs: [
                      {
                        id: 'F3B46A95-703F-4465-96CA-A58496A5F78C',
                        type: 'configurableActionConfigurator',
                        propertyName: 'beforeNextActionConfiguration',
                        label: 'Before Next Action',
                        hidden: false,
                        hideLabel: true,
                        validate: {},
                        jsSetting: false,
                        settingsValidationErrors: [],
                      },
                      {
                        id: 'ac7c19c4-f75a-4ce0-b96a-1698b6bdb289',
                        type: 'configurableActionConfigurator',
                        propertyName: 'afterNextActionConfiguration',
                        hideLabel: true,
                        label: 'After Next Action',
                        hidden: false,
                        customVisibility: '',
                        validate: {},
                        jsSetting: false,
                        settingsValidationErrors: [],
                      }]
                  })
                  .toJson()]
              }
            })
            .addCollapsiblePanel({
              id: 'backButtonCollapsiblePanel',
              propertyName: 'backButtonCollapsiblePanel',
              label: 'Back Button',
              labelAlign: 'right',
              parentId: 'root',
              ghost: true,
              collapsible: 'header',
              content: {
                id: 'backButtonContent',
                components: [...new DesignerToolbarSettings()
                  .addSettingsInputRow({
                    id: nanoid(),
                    readOnly: false,
                    inputs: [
                      {
                        id: 'backButtonText',
                        type: 'textField',
                        propertyName: 'backButtonText',
                        label: 'Text',
                        labelAlign: 'right',
                        parentId: 'backButtonContent',
                        jsSetting: true,
                      },
                      {
                        id: 'f39e604f-b2c9-4e6a-9101-fc12d32b7b3a',
                        type: 'codeEditor',
                        propertyName: 'backButtonCustomEnabled',
                        label: 'Custom Enabled',
                        description: 'Write the code that returns whether this button is enabled',
                        labelAlign: 'right',
                        parentId: 'root',
                      }]
                  })
                  .addSettingsInputRow({
                    id: nanoid(),
                    readOnly: false,
                    inputs: [
                      {
                        id: '39a6c902-2d58-4e92-a139-20b6c85f5cbb',
                        type: 'configurableActionConfigurator',
                        propertyName: 'beforeBackActionConfiguration',
                        label: 'Before Back Action',
                        hidden: false,
                        hideLabel: true,
                        jsSetting: false,
                      },
                      {
                        id: '59bb6f37-55b9-496e-8eff-dc20f610baee',
                        type: 'configurableActionConfigurator',
                        propertyName: 'afterBackActionConfiguration',
                        label: 'After Back Action',
                        hidden: false,
                        hideLabel: true,
                        jsSetting: false,
                        customVisibility: '',
                      }
                    ]
                  })
                  .toJson()]
              }
            })
            .addCollapsiblePanel({
              id: 'doneButtonCollapsiblePanel',
              propertyName: 'doneButtonCollapsiblePanel',
              label: 'Done Button',
              labelAlign: 'right',
              parentId: 'root',
              ghost: true,
              collapsible: 'header',
              content: {
                id: 'doneButtonContent',
                components: [...new DesignerToolbarSettings()
                  .addSettingsInputRow({
                    id: nanoid(),
                    readOnly: false,
                    inputs: [
                      {
                        id: 'doneButtonText',
                        type: 'textField',
                        propertyName: 'doneButtonText',
                        label: 'Text',
                        labelAlign: 'right',
                        parentId: 'doneButtonContent',
                        jsSetting: true,
                      },
                      {
                        id: 'f39e604f-b2c9-4e6a-9101-fc12d32b7b3a',
                        type: 'codeEditor',
                        propertyName: 'doneButtonCustomEnabled',
                        label: 'Custom Enabled',
                        description: 'Write the code that returns whether this button is enabled',
                        labelAlign: 'right',
                        parentId: 'root',
                      }
                    ]
                  })
                  .addSettingsInputRow({
                    id: nanoid(),
                    readOnly: false,
                    inputs: [
                      {
                        id: 'D5133335-4349-459A-8E9E-4371C814CE1A',
                        type: 'configurableActionConfigurator',
                        propertyName: 'beforeDoneActionConfiguration',
                        label: 'Before Done Action',
                        hidden: false,
                        hideLabel: true,
                        jsSetting: false,
                      },
                      {
                        id: 'D5133335-4349-459A-8E9E-4371C814C111',
                        type: 'configurableActionConfigurator',
                        propertyName: 'afterDoneActionConfiguration',
                        label: 'After Done Action',
                        hidden: false,
                        hideLabel: true,
                        jsSetting: false,
                        customVisibility: '',
                      }
                    ]
                  })
                  .toJson()]
              }
            })
            .addCollapsiblePanel({
              id: 'onCancelCollapsiblePanel',
              propertyName: 'onCancelCollapsiblePanel',
              label: 'Cancel Button',
              labelAlign: 'right',
              parentId: 'root',
              ghost: true,
              collapsible: 'header',
              content: {
                id: 'onCancelContent',
                components: [...new DesignerToolbarSettings()
                  .addSettingsInputRow({
                    id: nanoid(),
                    readOnly: false,
                    inputs: [
                      {
                        id: 'onCancelText',
                        type: 'textField',
                        propertyName: 'cancelButtonText',
                        label: 'Text',
                        labelAlign: 'right',
                        parentId: 'onCancelContent',
                        jsSetting: true,
                      },
                      {
                        id: 'f39e604f-b2c9-4e6a-9101-fc12d32b7b3a',
                        type: 'codeEditor',
                        propertyName: 'cancelButtonCustomEnabled',
                        label: 'Custom Enabled',
                        description: 'Write the code that returns whether this button is enabled',
                        labelAlign: 'right',
                        parentId: 'root',
                      }
                    ]
                  })
                  .addSettingsInputRow({
                    id: nanoid(),
                    readOnly: false,
                    inputs: [
                      {
                        id: 'D5133335-4349-459A-8E9E-4371C814CE1A',
                        type: 'configurableActionConfigurator',
                        propertyName: 'beforeCancelActionConfiguration',
                        label: 'Before Cancel Action',
                        hidden: false,
                        hideLabel: true,
                        jsSetting: false,
                      },
                      {
                        id: 'D5133335-4349-459A-8E9E-4371C814C111',
                        type: 'configurableActionConfigurator',
                        propertyName: 'afterCancelActionConfiguration',
                        label: 'After Cancel Action',
                        hidden: false,
                        hideLabel: true,
                        jsSetting: false,
                        customVisibility: '',
                      }
                    ]
                  })
                  .toJson()]
              }
            })
            .addCollapsiblePanel({
              id: 'onBeforeRenderCollapsiblePanel',
              propertyName: 'onBeforeRenderCollapsiblePanel',
              label: 'On Before Render',
              labelAlign: 'right',
              parentId: 'root',
              ghost: true,
              collapsible: 'header',
              content: {
                id: 'onBeforeRenderContent',
                components: [...new DesignerToolbarSettings()
                  .addConfigurableActionConfigurator({
                    id: 'D5133335-4349-459A-8E9E-4371C814CE1A',
                    propertyName: 'onBeforeRenderActionConfiguration',
                    label: 'Action configuration',
                    hideLabel: true,
                    hidden: false,
                  })
                  .toJson()]
              }
            })
            .addCollapsiblePanel({
              id: 'otherSettingsCollapsiblePanel',
              propertyName: 'otherSettingsCollapsiblePanel',
              label: 'Other',
              labelAlign: 'right',
              parentId: 'root',
              ghost: true,
              collapsible: 'header',
              content: {
                id: 'otherSettingsContent',
                components: [...new DesignerToolbarSettings()
                  .addSettingsInputRow({
                    id: nanoid(),
                    readOnly: false,
                    inputs: [
                      {
                        id: 'f9f25102-bdc7-41bc-b4bc-87eea6a86fc5',
                        type: 'textField',
                        propertyName: 'className',
                        label: 'Class Name',
                        labelAlign: 'right',
                        parentId: 'root',
                      },
                      {
                        type: 'codeEditor',
                        id: 'd2f01684-31e5-41a3-b32a-c23abc20e700',
                        propertyName: 'style',
                        label: 'Style',
                        parentId: 'root',
                        validate: {},
                        settingsValidationErrors: [],
                        description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                      }
                    ]
                  })
                  .addSettingsInputRow({
                    id: nanoid(),
                    readOnly: false,
                    inputs: [
                      {
                        id: '78f2f5ee-9826-4567-a938-d7bc03ba90ac',
                        type: 'codeEditor',
                        propertyName: 'customVisibility',
                        label: 'Custom Visibility',
                        labelAlign: 'right',
                        parentId: 'root',
                        hidden: false,
                        description:
                          'Enter custom visibility code.  You must return true to show the component. ' +
                          'The global variable data is provided, and allows you to access the data of any form component, by using its API key.',
                      },
                      {
                        type: 'codeEditor',
                        id: '377bbbee-d7f6-42bf-8f08-fc9303424518',
                        propertyName: 'customEnabled',
                        label: 'Custom Enabled',
                        labelAlign: 'right',
                        parentId: 'root',
                        hidden: false,
                        description:
                          'Enter custom enabled code.  You must return true to enable the component. ' +
                          'The global variable data is provided, and allows you to access the data of any form component, by using its API key.',
                      }
                    ]
                  })
                  .toJson()]
              }
            })
            .toJson()
          ]
        },
        {
          key: '2',
          title: 'Security',
          id: nanoid(),
          components: [...new DesignerToolbarSettings()
            .addSettingsInput({
              id: nanoid(),
              propertyName: 'permissions',
              label: 'Permissions',
              parentId: 'root',
              inputType: 'permissions',
              tooltip: 'Enter a list of permissions that should be associated with this component',
              jsSetting: true
            })
            .toJson()
          ]
        }
      ]
    }).toJson();
};
