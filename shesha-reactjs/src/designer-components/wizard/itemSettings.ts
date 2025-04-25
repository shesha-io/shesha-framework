import { DesignerToolbarSettings } from '@/interfaces';
import { nanoid } from '@/utils/uuid';

export const getItemSettings = () => {
  // Generate unique IDs for major components
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const securityTabId = nanoid();

  // Button content IDs
  const nextButtonContentId = nanoid();
  const backButtonContentId = nanoid();
  const doneButtonContentId = nanoid();
  const cancelButtonContentId = nanoid();
  const beforeRenderContentId = nanoid();
  const otherSettingsContentId = nanoid();

  return new DesignerToolbarSettings()
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
          components: [...new DesignerToolbarSettings()
            .addSettingsInputRow({
              id: nanoid(),
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
                  id: nanoid(),
                  type: 'textField',
                  propertyName: 'title',
                  label: 'Title',
                  labelAlign: 'right',
                  parentId: 'root',
                  jsSetting: true
                }
              ]
            })
            .addSettingsInputRow({
              id: nanoid(),
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
                  id: nanoid(),
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
                  id: nanoid(),
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
              id: nanoid(),
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
              id: nanoid(),
              propertyName: 'nextButtonCollapsiblePanel',
              label: 'Next Button',
              labelAlign: 'right',
              parentId: 'root',
              ghost: true,
              collapsible: 'header',
              content: {
                id: nextButtonContentId,
                components: [...new DesignerToolbarSettings()
                  .addSettingsInputRow({
                    id: nanoid(),
                    inputs: [
                      {
                        id: nanoid(),
                        type: 'textField',
                        propertyName: 'nextButtonText',
                        label: 'Text',
                        labelAlign: 'right',
                        parentId: nextButtonContentId,
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
                    inputs: [
                      {
                        id: nanoid(),
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
                        id: nanoid(),
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
              id: nanoid(),
              propertyName: 'backButtonCollapsiblePanel',
              label: 'Back Button',
              labelAlign: 'right',
              parentId: 'root',
              ghost: true,
              collapsible: 'header',
              content: {
                id: backButtonContentId,
                components: [...new DesignerToolbarSettings()
                  .addSettingsInputRow({
                    id: nanoid(),
                    inputs: [
                      {
                        id: nanoid(),
                        type: 'textField',
                        propertyName: 'backButtonText',
                        label: 'Text',
                        labelAlign: 'right',
                        parentId: backButtonContentId,
                        jsSetting: true,
                      },
                      {
                        id: nanoid(),
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
                    inputs: [
                      {
                        id: nanoid(),
                        type: 'configurableActionConfigurator',
                        propertyName: 'beforeBackActionConfiguration',
                        label: 'Before Back Action',
                        hidden: false,
                        hideLabel: true,
                        jsSetting: false,
                      },
                      {
                        id: nanoid(),
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
              id: nanoid(),
              propertyName: 'doneButtonCollapsiblePanel',
              label: 'Done Button',
              labelAlign: 'right',
              parentId: 'root',
              ghost: true,
              collapsible: 'header',
              content: {
                id: doneButtonContentId,
                components: [...new DesignerToolbarSettings()
                  .addSettingsInputRow({
                    id: nanoid(),
                    inputs: [
                      {
                        id: nanoid(),
                        type: 'textField',
                        propertyName: 'doneButtonText',
                        label: 'Text',
                        labelAlign: 'right',
                        parentId: doneButtonContentId,
                        jsSetting: true,
                      },
                      {
                        id: nanoid(),
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
                    inputs: [
                      {
                        id: nanoid(),
                        type: 'configurableActionConfigurator',
                        propertyName: 'beforeDoneActionConfiguration',
                        label: 'Before Done Action',
                        hidden: false,
                        hideLabel: true,
                        jsSetting: false,
                      },
                      {
                        id: nanoid(),
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
              id: nanoid(),
              propertyName: 'onCancelCollapsiblePanel',
              label: 'Cancel Button',
              labelAlign: 'right',
              parentId: 'root',
              ghost: true,
              collapsible: 'header',
              content: {
                id: cancelButtonContentId,
                components: [...new DesignerToolbarSettings()
                  .addSettingsInputRow({
                    id: nanoid(),
                    inputs: [
                      {
                        id: nanoid(),
                        type: 'textField',
                        propertyName: 'cancelButtonText',
                        label: 'Text',
                        labelAlign: 'right',
                        parentId: cancelButtonContentId,
                        jsSetting: true,
                      },
                      {
                        id: nanoid(),
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
                    inputs: [
                      {
                        id: nanoid(),
                        type: 'configurableActionConfigurator',
                        propertyName: 'beforeCancelActionConfiguration',
                        label: 'Before Cancel Action',
                        hidden: false,
                        hideLabel: true,
                        jsSetting: false,
                      },
                      {
                        id: nanoid(),
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
              id: nanoid(),
              propertyName: 'onBeforeRenderCollapsiblePanel',
              label: 'On Before Render',
              labelAlign: 'right',
              parentId: 'root',
              ghost: true,
              collapsible: 'header',
              content: {
                id: beforeRenderContentId,
                components: [...new DesignerToolbarSettings()
                  .addConfigurableActionConfigurator({
                    id: nanoid(),
                    propertyName: 'onBeforeRenderActionConfiguration',
                    label: 'Action Configuration',
                    hideLabel: true,
                    hidden: false,
                  })
                  .toJson()]
              }
            })
            .addCollapsiblePanel({
              id: nanoid(),
              propertyName: 'otherSettingsCollapsiblePanel',
              label: 'Other',
              labelAlign: 'right',
              parentId: 'root',
              ghost: true,
              collapsible: 'header',
              content: {
                id: otherSettingsContentId,
                components: [...new DesignerToolbarSettings()
                  .addSettingsInputRow({
                    id: nanoid(),
                    inputs: [
                      {
                        id: nanoid(),
                        type: 'textField',
                        propertyName: 'className',
                        label: 'Class Name',
                        labelAlign: 'right',
                        parentId: 'root',
                      },
                      {
                        type: 'codeEditor',
                        id: nanoid(),
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
                    inputs: [
                      {
                        id: nanoid(),
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
                        id: nanoid(),
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
          id: securityTabId,
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