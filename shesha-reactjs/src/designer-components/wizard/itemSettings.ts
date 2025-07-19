import { DesignerToolbarSettings } from '@/interfaces';
import { nanoid } from '@/utils/uuid';
import { backgroundTypeOptions, positionOptions, repeatOptions, sizeOptions } from '../_settings/utils/background/utils';
import { getBorderInputs, getCornerInputs } from '../_settings/utils/border/utils';
import { fontWeights, fontTypes } from '../_settings/utils/font/utils';
export const getItemSettings = () => {
  // Generate unique IDs for major components
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const appearanceTabId = nanoid();
  const securityTabId = nanoid();

  // Style IDs
  const fontStylePnlId = nanoid();
  const borderStylePnlId = nanoid();
  const backgroundStylePnlId = nanoid();
  const shadowStylePnlId = nanoid();
  const customStylePnlId = nanoid();

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
              parentId: commonTabId,
              inputs: [
                {
                  id: nanoid(),
                  type: 'textField',
                  propertyName: 'name',
                  label: 'Name',
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
                  jsSetting: true
                }
              ]
            })
            .addSettingsInputRow({
              id: nanoid(),
              parentId: commonTabId,
              inputs: [
                {
                  id: nanoid(),
                  type: 'textField',
                  propertyName: 'subTitle',
                  label: 'Sub Title',
                  labelAlign: 'right',
                  jsSetting: true,
                },
                {
                  id: nanoid(),
                  propertyName: 'description',
                  type: 'textArea',
                  label: 'Description',
                  labelAlign: 'right',
                  jsSetting: true,
                }
              ]
            })
            .addSettingsInputRow({
              id: nanoid(),
              parentId: commonTabId,
              inputs: [
                {
                  id: nanoid(),
                  type: 'textField',
                  propertyName: 'key',
                  label: 'Key',
                  labelAlign: 'right',
                  jsSetting: true,
                },
                {
                  id: nanoid(),
                  type: 'dropdown',
                  propertyName: 'status',
                  label: 'Status',
                  labelAlign: 'right',
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
              parentId: commonTabId,
              inputs: [
                {
                  id: nanoid(),
                  type: 'iconPicker',
                  propertyName: 'icon',
                  label: 'Icon',
                  labelAlign: 'right',
                  hidden: false,
                  jsSetting: true,
                  settingsValidationErrors: [],
                },
                {
                  id: nanoid(),
                  type: 'switch',
                  propertyName: 'allowCancel',
                  label: 'Allow Cancel',
                  labelAlign: 'right',
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
              parentId: commonTabId,
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
              parentId: commonTabId,
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
                        parentId: nextButtonContentId,
                      }]
                  })
                  .addSettingsInputRow({
                    id: nanoid(),
                    parentId: commonTabId,
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
              parentId: commonTabId,
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
                        parentId: backButtonContentId,
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
              parentId: commonTabId,
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
                        parentId: doneButtonContentId,
                      }
                    ]
                  })
                  .addSettingsInputRow({
                    id: nanoid(),
                    parentId: commonTabId,
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
              parentId: commonTabId,
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
                        parentId: cancelButtonContentId,
                      }
                    ]
                  })
                  .addSettingsInputRow({
                    id: nanoid(),
                    parentId: commonTabId,
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
              parentId: commonTabId,
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
                    parentId: beforeRenderContentId,
                  })
                  .toJson()]
              }
            })
            .addCollapsiblePanel({
              id: nanoid(),
              propertyName: 'otherSettingsCollapsiblePanel',
              label: 'Other',
              labelAlign: 'right',
              parentId: commonTabId,
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
                        type: 'codeEditor',
                        propertyName: 'customVisibility',
                        label: 'Custom Visibility',
                        labelAlign: 'right',
                        parentId: otherSettingsContentId,
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
                        parentId: otherSettingsContentId,
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
          title: 'Appearance',
          id: appearanceTabId,
          components: [
            ...new DesignerToolbarSettings()
              .addCollapsiblePanel({
                id: nanoid(),
                propertyName: 'pnlFontStyle',
                label: 'Font',
                labelAlign: 'right',
                parentId: appearanceTabId,
                ghost: true,
                collapsible: 'header',
                content: {
                  id: fontStylePnlId,
                  components: [...new DesignerToolbarSettings()
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
                          placeholder: 'Segoe UI',
                          dropdownOptions: fontTypes,
                        },
                        {
                          type: 'numberField',
                          id: nanoid(),
                          label: 'Size',
                          propertyName: 'font.size',
                          hideLabel: true,
                          placeholder: '14',
                          width: 50,
                        },
                        {
                          type: 'dropdown',
                          id: nanoid(),
                          label: 'Weight',
                          propertyName: 'font.weight',
                          hideLabel: true,
                          placeholder: '400',
                          tooltip: "Controls text thickness (light, normal, bold, etc.)",
                          dropdownOptions: fontWeights,
                          width: 100,
                        },
                        {
                          type: 'colorPicker',
                          id: nanoid(),
                          label: 'Color',
                          propertyName: 'font.color',
                          hideLabel: true,
                        }
                      ],
                    })
                    .toJson()
                  ]
                }
              })
              .addCollapsiblePanel({
                id: nanoid(),
                propertyName: 'pnlBorderStyle',
                label: 'Border',
                labelAlign: 'right',
                ghost: true,
                hidden: { _code: 'return  ["dashed","text", "link", "ghost"].includes(getSettingValue(data?.buttonType));', _mode: 'code', _value: false } as any,
                parentId: appearanceTabId,
                collapsible: 'header',
                content: {
                  id: borderStylePnlId,
                  components: [...new DesignerToolbarSettings()
                    .addContainer({
                      id: nanoid(),
                      parentId: borderStylePnlId,
                      components: getBorderInputs("", false) as any
                    })
                    .addContainer({
                      id: nanoid(),
                      parentId: borderStylePnlId,
                      components: getCornerInputs("", false) as any
                    })
                    .toJson()
                  ]
                }
              })
              .addCollapsiblePanel({
                id: nanoid(),
                propertyName: 'pnlBackgroundStyle',
                label: 'Background',
                labelAlign: 'right',
                ghost: true,
                parentId: appearanceTabId,
                collapsible: 'header',
                hidden: { _code: 'return  ["text", "link", "ghost", "primary"].includes(getSettingValue(data?.buttonType));', _mode: 'code', _value: false } as any,
                content: {
                  id: backgroundStylePnlId,
                  components: [
                    ...new DesignerToolbarSettings()
                      .addSettingsInput({
                        id: nanoid(),
                        parentId: backgroundStylePnlId,
                        label: "Type",
                        jsSetting: false,
                        propertyName: "background.type",
                        inputType: "radio",
                        defaultValue: "color",
                        tooltip: "Select a type of background",
                        buttonGroupOptions: backgroundTypeOptions,
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: backgroundStylePnlId,
                        inputs: [{
                          type: 'colorPicker',
                          id: nanoid(),
                          label: "Color",
                          propertyName: "background.color",
                          hideLabel: true,
                          jsSetting: false,
                        }],
                        hidden: { _code: 'return  getSettingValue(data?.background?.type) !== "color";', _mode: 'code', _value: false } as any,
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: backgroundStylePnlId,
                        inputs: [{
                          type: 'multiColorPicker',
                          id: nanoid(),
                          propertyName: "background.gradient.colors",
                          label: "Colors",
                          jsSetting: false,
                        }
                        ],
                        hidden: { _code: 'return  getSettingValue(data?.background?.type) !== "gradient";', _mode: 'code', _value: false } as any,
                        hideLabel: true,
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: backgroundStylePnlId,
                        inputs: [{
                          type: 'textField',
                          id: nanoid(),
                          propertyName: "background.url",
                          jsSetting: false,
                          label: "URL",
                        }],
                        hidden: { _code: 'return  getSettingValue(data?.background?.type) !== "url";', _mode: 'code', _value: false } as any,
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: backgroundStylePnlId,
                        inputs: [{
                          type: 'imageUploader',
                          id: nanoid(),
                          propertyName: 'background.uploadFile',
                          label: "Image",
                          jsSetting: false,
                        }],
                        hidden: { _code: 'return  getSettingValue(data?.background?.type) !== "image";', _mode: 'code', _value: false } as any,
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: backgroundStylePnlId,
                        hidden: { _code: 'return  getSettingValue(data?.background?.type) !== "storedFile";', _mode: 'code', _value: false } as any,
                        inputs: [
                          {
                            type: 'textField',
                            id: nanoid(),
                            jsSetting: false,
                            propertyName: "background.storedFile.id",
                            label: "File ID"
                          }
                        ]
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: backgroundStylePnlId,
                        inline: true,
                        hidden: { _code: 'return  getSettingValue(data?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                        inputs: [
                          {
                            type: 'customDropdown',
                            id: nanoid(),
                            label: "Size",
                            customTooltip: 'Size of the background image, two space separated values with units e.g "100% 100px"',
                            hideLabel: true,
                            placeholder: 'Cover',
                            propertyName: "background.size",
                            dropdownOptions: sizeOptions,
                          },
                          {
                            type: 'customDropdown',
                            id: nanoid(),
                            label: "Position",
                            hideLabel: true,
                            placeholder: 'Center',
                            customTooltip: 'Position of the background image, two space separated values with units e.g "5em 100px"',
                            propertyName: "background.position",
                            dropdownOptions: positionOptions,
                          },
                        ]
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: backgroundStylePnlId,
                        inputs: [{
                          type: 'radio',
                          id: nanoid(),
                          label: 'Repeat',
                          hideLabel: true,
                          propertyName: 'background.repeat',
                          inputType: 'radio',
                          buttonGroupOptions: repeatOptions,
                        }],
                        hidden: { _code: 'return  getSettingValue(data?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                      })
                      .toJson()
                  ],
                }
              })
              .addCollapsiblePanel({
                id: nanoid(),
                propertyName: 'pnlShadowStyle',
                label: 'Shadow',
                labelAlign: 'right',
                ghost: true,
                hidden: { _code: 'return  ["text", "link", "ghost"].includes(getSettingValue(data?.buttonType));', _mode: 'code', _value: false } as any,
                parentId: appearanceTabId,
                collapsible: 'header',
                content: {
                  id: shadowStylePnlId,
                  components: [...new DesignerToolbarSettings()
                    .addSettingsInputRow({
                      id: nanoid(),
                      parentId: shadowStylePnlId,
                      inline: true,
                      inputs: [
                        {
                          type: 'numberField',
                          id: nanoid(),
                          label: 'Offset X',
                          hideLabel: true,
                          width: 80,
                          placeholder: '0',
                          inputType: 'numberField',
                          icon: "offsetHorizontalIcon",
                          propertyName: 'shadow.offsetX',
                        },
                        {
                          type: 'numberField',
                          id: nanoid(),
                          label: 'Offset Y',
                          hideLabel: true,
                          width: 80,
                          placeholder: '0',
                          inputType: 'numberField',
                          icon: 'offsetVerticalIcon',
                          propertyName: 'shadow.offsetY',
                        },
                        {
                          type: 'numberField',
                          id: nanoid(),
                          label: 'Blur',
                          hideLabel: true,
                          width: 80,
                          placeholder: '0',
                          inputType: 'numberField',
                          icon: 'blurIcon',
                          propertyName: 'shadow.blurRadius',
                        },
                        {
                          type: 'numberField',
                          id: nanoid(),
                          label: 'Spread',
                          hideLabel: true,
                          width: 80,
                          placeholder: '0',
                          inputType: 'numberField',
                          icon: 'spreadIcon',
                          propertyName: 'shadow.spreadRadius',
                        },
                        {
                          type: 'colorPicker',
                          id: nanoid(),
                          label: 'Color',
                          hideLabel: true,
                          propertyName: 'shadow.color',
                        },
                      ],
                    })
                    .toJson()
                  ]
                }
              })
              .addCollapsiblePanel({
                id: nanoid(),
                propertyName: 'stylingBox',
                label: 'Margin & Padding',
                labelAlign: 'right',
                ghost: true,
                collapsible: 'header',
                content: {
                  id: nanoid(),
                  components: [...new DesignerToolbarSettings()
                    .addStyleBox({
                      id: nanoid(),
                      label: 'Margin Padding',
                      hideLabel: true,
                      propertyName: 'stylingBox',
                    })
                    .toJson()
                  ]
                }
              })
              .addCollapsiblePanel({
                id: 'customStyleCollapsiblePanel',
                propertyName: 'customStyle',
                label: 'Custom Styles',
                labelAlign: 'right',
                ghost: true,
                parentId: appearanceTabId,
                collapsible: 'header',
                content: {
                  id: customStylePnlId,
                  components: [...new DesignerToolbarSettings()
                    .addSettingsInputRow({
                      id: nanoid(),
                      parentId: customStylePnlId,
                      inputs: [
                        {
                          id: nanoid(),
                          type: 'textField',
                          propertyName: 'className',
                          label: 'Class Name',
                          labelAlign: 'right',
                        },
                        {
                          id: nanoid(),
                          type: 'codeEditor',
                          propertyName: 'style',
                          hideLabel: false,
                          label: 'Style',
                          description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                        }
                      ]
                    })
                    .toJson()
                  ]
                }
              })
              .toJson()]
        },
        {
          key: '3',
          title: 'Security',
          id: securityTabId,
          components: [...new DesignerToolbarSettings()
            .addSettingsInput({
              id: nanoid(),
              propertyName: 'permissions',
              label: 'Permissions',
              parentId: securityTabId,
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