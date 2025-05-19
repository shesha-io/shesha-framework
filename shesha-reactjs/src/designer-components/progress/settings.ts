import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';

export const getSettings = (data: any) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const appearanceTabId = nanoid();
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
                .addContextPropertyAutocomplete({
                  id: nanoid(),
                  propertyName: 'propertyName',
                  label: 'Property Name',
                  parentId: commonTabId,
                  styledLabel: true,
                  size: 'small',
                  validate: {
                    required: true,
                  },
                  jsSetting: true,
                })
                .addLabelConfigurator({
                  id: nanoid(),
                  propertyName: 'hideLabel',
                  label: 'Label',
                  parentId: commonTabId,
                  hideLabel: true,
                  defaultValue: false,
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'description',
                      label: 'Tooltip',
                      type: 'textArea',
                      jsSetting: true
                    },
                    {
                      type: 'numberField',
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
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'dropdown',
                      id: nanoid(),
                      propertyName: 'progressType',
                      label: 'Type',
                      tooltip: 'To specify the type of progress bar',
                      defaultValue: 'line',
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
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'showInfo',
                      label: 'Show Info',
                      tooltip: 'Whether to display the progress info',
                      defaultValue: true,
                      jsSetting: true,
                    },
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'hidden',
                      label: 'Hide',
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
            id: appearanceTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addPropertyRouter({
                  id: styleRouterId,
                  propertyName: 'propertyRouter1',
                  componentName: 'propertyRouter',
                  label: 'Property router',
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
                        propertyName: 'progressStyle',
                        label: 'Progress Style',
                        labelAlign: 'right',
                        ghost: true,
                        parentId: styleRouterId,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: styleRouterId,
                                inputs: [
                                  {
                                    type: 'colorPicker',
                                    id: nanoid(),
                                    propertyName: 'strokeColor',
                                    label: 'Stroke Color',
                                    tooltip: "The color of progress bar. This will be overridden by the strokeColor property of 'line' and 'circle' types",
                                    jsSetting: true,
                                  },
                                  {
                                    type: 'colorPicker',
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
                                parentId: styleRouterId,
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
                                    type: 'numberField',
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
                                inputType: 'numberField',
                                tooltip: 'The canvas width of the circular progress, unit: px',
                                hidden: { _code: 'return !["circle", "dashboard"].includes(getSettingValue(data?.progressType));', _mode: 'code', _value: false },
                                jsSetting: true,
                                parentId: styleRouterId,
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
                        parentId: styleRouterId,
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
                                inputType: 'numberField',
                                tooltip: 'The total step count',
                                hidden: { _code: 'return getSettingValue(data?.progressType) !== "line";', _mode: 'code', _value: false },
                                jsSetting: true,
                                parentId: styleRouterId,
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: styleRouterId,
                                hidden: { _code: 'return getSettingValue(data?.progressType) !== "line";', _mode: 'code', _value: false },
                                inputs: [
                                  {
                                    type: 'colorPicker',
                                    id: nanoid(),
                                    propertyName: 'lineStrokeColor',
                                    label: 'Stroke Color',
                                    tooltip: "The color of progress bar",
                                    jsSetting: true,
                                  }
                                ]
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: styleRouterId,
                                hidden: { _code: 'return getSettingValue(data?.progressType) !== "dashboard";', _mode: 'code', _value: false },
                                inputs: [
                                  {
                                    type: 'numberField',
                                    id: nanoid(),
                                    propertyName: 'gapDegree',
                                    label: 'Gap Degree',
                                    tooltip: "The gap degree of half circle, 0 ~ 295",
                                    jsSetting: true,
                                  },
                                  {
                                    type: 'dropdown',
                                    id: nanoid(),
                                    propertyName: 'gapPosition',
                                    label: 'Gap Position',
                                    tooltip: "The gap position",
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
                        propertyName: 'stylingBox',
                        label: 'Margin & Padding',
                        labelAlign: 'right',
                        ghost: true,
                        parentId: styleRouterId,
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
                      .toJson(),
                  ],
                })
                .toJson(),
            ],
          }
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