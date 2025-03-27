import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';

export const getSettings = (data: any) => {
  return {
    components: new DesignerToolbarSettings(data)
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
            key: 'common',
            title: 'Common',
            id: nanoid(),
            components: [
              ...new DesignerToolbarSettings()
                .addContextPropertyAutocomplete({
                  id: nanoid(),
                  propertyName: 'propertyName',
                  parentId: 'root',
                  label: 'Property Name',
                  size: 'small',
                  validate: { required: true },
                  jsSetting: true,
                })
                .addLabelConfigurator({
                  id: nanoid(),
                  propertyName: 'hideLabel',
                  label: 'Label',
                  parentId: 'root',
                  hideLabel: true,
                  defaultValue: false,
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: 'root',
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  inputs: [
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'hidden',
                      label: 'Hide',
                      jsSetting: true,
                    },
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'showInfo',
                      label: 'Show Info',
                      tooltip: 'Whether to display the progress info',
                      defaultValue: true,
                      jsSetting: true,
                    }
                  ]
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: 'root',
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  inputs: [
                    {
                      type: 'dropdown',
                      id: nanoid(),
                      propertyName: 'progressType',
                      label: 'Type',
                      tooltip: 'To specify the type of progress bar',
                      dropdownOptions: [
                        { label: 'Line', value: 'line' },
                        { label: 'Circle', value: 'circle' },
                        { label: 'Dashboard', value: 'dashboard' },
                      ],
                      jsSetting: true,
                    },
                    {
                      type: 'dropdown',
                      id: nanoid(),
                      propertyName: 'status',
                      label: 'Status',
                      tooltip: 'To set the status of the Progress',
                      dropdownOptions: [
                        { label: 'Success', value: 'success' },
                        { label: 'Exception', value: 'exception' },
                        { label: 'Normal', value: 'normal' },
                        { label: 'Active', value: 'active' },
                      ],
                      jsSetting: true,
                    }
                  ]
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: 'root',
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  inputs: [
                    {
                      type: 'number',
                      id: nanoid(),
                      propertyName: 'defaultValue',
                      label: 'Default Value',
                      tooltip: 'Sets the default value for the progress bar',
                      jsSetting: true,
                    },
                    {
                      type: 'number',
                      id: nanoid(),
                      propertyName: 'percent',
                      label: 'Percent',
                      tooltip: 'To set the completion percentage',
                      min: 0,
                      max: 100,
                      jsSetting: true,
                    }
                  ]
                })
                .toJson(),
            ],
          },
          {
            key: 'appearance',
            title: 'Appearance',
            id: nanoid(),
            components: [
              ...new DesignerToolbarSettings()
                .addPropertyRouter({
                  id: nanoid(),
                  propertyName: 'propertyRouter1',
                  componentName: 'propertyRouter',
                  label: 'Property router',
                  labelAlign: 'right',
                  parentId: 'root',
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
                        propertyName: 'progressStyle',
                        label: 'Progress Style',
                        labelAlign: 'right',
                        ghost: true,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: 'root',
                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                inputs: [
                                  {
                                    type: 'color',
                                    id: nanoid(),
                                    propertyName: 'strokeColor',
                                    label: 'Stroke Color',
                                    tooltip: "The color of progress bar. This will be overridden by the strokeColor property of 'line' and 'circle' types",
                                    jsSetting: true,
                                  },
                                  {
                                    type: 'color',
                                    id: nanoid(),
                                    propertyName: 'trailColor',
                                    label: 'Trail Color',
                                    tooltip: "The color of progress bar background",
                                    jsSetting: true,
                                  }
                                ]
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: 'root',
                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                inputs: [
                                  {
                                    type: 'dropdown',
                                    id: nanoid(),
                                    propertyName: 'strokeLinecap',
                                    label: 'Stroke Linecap',
                                    tooltip: 'To set the style of the progress linecap',
                                    dropdownOptions: [
                                      { label: 'Round', value: 'round' },
                                      { label: 'Butt', value: 'butt' },
                                      { label: 'Square', value: 'square' },
                                    ],
                                    defaultValue: 'round',
                                    jsSetting: true,
                                  },
                                  {
                                    type: 'number',
                                    id: nanoid(),
                                    propertyName: 'strokeWidth',
                                    label: 'Stroke Width',
                                    tooltip: 'The width of the progress bar, unit: percentage of the canvas width',
                                    defaultValue: 6,
                                    jsSetting: true,
                                  }
                                ]
                              })
                              .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'width',
                                label: 'Width',
                                inputType: 'number',
                                tooltip: 'The canvas width of the circular progress, unit: px',
                                hidden: { _code: 'return !["circle", "dashboard"].includes(getSettingValue(data?.progressType));', _mode: 'code', _value: false },
                                jsSetting: true,
                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                              })
                              .toJson()
                          ]
                        }
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'typeSpecificSettings',
                        label: 'Type Specific Settings',
                        labelAlign: 'right',
                        ghost: true,
                        hideWhenEmpty: true,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'steps',
                                label: 'Steps',
                                inputType: 'number',
                                tooltip: 'The total step count',
                                hidden: { _code: 'return getSettingValue(data?.progressType) !== "line";', _mode: 'code', _value: false },
                                jsSetting: true,
                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: 'root',
                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                hidden: { _code: 'return getSettingValue(data?.progressType) !== "line";', _mode: 'code', _value: false },
                                inputs: [
                                  {
                                    type: 'color',
                                    id: nanoid(),
                                    propertyName: 'lineStrokeColor',
                                    label: 'Line Stroke Color',
                                    tooltip: 'The color of line progress bar',
                                    jsSetting: true,
                                  }
                                ]
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: 'root',
                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                hidden: { _code: 'return getSettingValue(data?.progressType) !== "circle";', _mode: 'code', _value: false },
                                inputs: [
                                  {
                                    type: 'color',
                                    id: nanoid(),
                                    propertyName: 'circleStrokeColor',
                                    label: 'Circle Stroke Color',
                                    tooltip: 'The color of circular progress',
                                    jsSetting: true,
                                  }
                                ]
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: 'root',
                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                hidden: { _code: 'return getSettingValue(data?.progressType) !== "dashboard";', _mode: 'code', _value: false },
                                inputs: [
                                  {
                                    type: 'number',
                                    id: nanoid(),
                                    propertyName: 'gapDegree',
                                    label: 'Gap Degree',
                                    tooltip: 'The gap degree of half circle, 0 ~ 295',
                                    min: 0,
                                    max: 295,
                                    jsSetting: true,
                                  },
                                  {
                                    type: 'dropdown',
                                    id: nanoid(),
                                    propertyName: 'gapPosition',
                                    label: 'Gap Position',
                                    tooltip: 'The gap position of dashboard progress',
                                    dropdownOptions: [
                                      { label: 'Top', value: 'top' },
                                      { label: 'Bottom', value: 'bottom' },
                                      { label: 'Left', value: 'left' },
                                      { label: 'Right', value: 'right' },
                                    ],
                                    jsSetting: true,
                                  }
                                ]
                              })
                              .toJson()
                          ]
                        }
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'formatPanel',
                        label: 'Format & Success',
                        labelAlign: 'right',
                        ghost: true,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'format',
                                label: 'Format',
                                inputType: 'codeEditor',
                                tooltip: 'The template function of the content. This function should return string or number',
                                description: 'The template function of the content. This function should return string or number',
                                mode: 'dialog',
                                exposedVariables: [
                                  `{ name: 'percent', description: 'Progress percentage', type: 'number' }`,
                                  `{ name: 'successPercent', description: 'Success percentage', type: 'number' }`
                                ],
                                // wrapInTemplate: true,
                                // templateSettings: {
                                //   functionName: 'format'
                                // },
                                jsSetting: true,
                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                              })
                              .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'success',
                                label: 'Success',
                                inputType: 'codeEditor',
                                tooltip: 'Configs of successfully progress bar. Returns an object: { percent: number, strokeColor: string }',
                                description: 'Configs of successfully progress bar. Returns an object of this format: { percent: number, strokeColor: string }',
                                mode: 'dialog',
                                // wrapInTemplate: true,
                                // templateSettings: {
                                //   functionName: 'success'
                                // },
                                jsSetting: true,
                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                              })
                              .toJson()
                          ]
                        }
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'stylePanel',
                        label: 'Custom Styles',
                        labelAlign: 'right',
                        ghost: true,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'style',
                                label: 'Style',
                                inputType: 'codeEditor',
                                tooltip: 'Custom CSS style object for the progress component',
                                description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                                mode: 'dialog',
                                exposedVariables: [
                                  `{ name: 'data', description: 'Form values', type: 'object' }`
                                ],
                                // wrapInTemplate: true,
                                // templateSettings: {
                                //   functionName: 'getStyle'
                                // },
                                jsSetting: true,
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
            id: nanoid(),
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'permissions',
                  label: 'Permissions',
                  inputType: 'permissions',
                  tooltip: 'Enter a list of permissions that should be associated with this component',
                  labelAlign: 'right',
                  validate: {},
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
      wrapperCol: { span: 24 },
    },
  };
};