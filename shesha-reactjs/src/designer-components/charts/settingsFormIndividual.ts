import { DesignerToolbarSettings } from '@/index';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';
import { backgroundTypeOptions, positionOptions, repeatOptions, sizeOptions } from '../_settings/utils/background/utils';
import { getBorderInputs, getCornerInputs } from '../_settings/utils/border/utils';
import { fontTypes, fontWeights } from '../_settings/utils/font/utils';

export const getSettings = (data: any) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const appearanceTabId = nanoid();
  const dataTabId = nanoid();
  const dataSettingsId = nanoid();
  const dataSettingsForUrlId = nanoid();
  const securityTabId = nanoid();
  const styleRouterId = nanoid();
  const dimensionsStylePnlId = nanoid();
  const dimensionsStyleCollapsiblePanelId = nanoid();

  const propertyNameId = nanoid();

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
                  id: propertyNameId,
                  propertyName: 'propertyName',
                  parentId: commonTabId,
                  label: 'Property Name',
                  size: 'small',
                  validate: {
                    required: true,
                  },
                  styledLabel: true,
                  jsSetting: true,
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'hidden',
                      parentId: commonTabId,
                      label: 'Hide',
                      type: 'switch',
                      jsSetting: true,
                      width: '50%',
                    },
                    {
                      id: nanoid(),
                      type: 'switch',
                      propertyName: 'isDoughnut',
                      label: 'Is Doughnut',
                      description: 'If the pie chart is a doughnut chart, switch to true.',
                      tooltip: 'If the pie chart is a doughnut chart, switch to true.',
                      parentId: commonTabId,
                      defaultValue: false,
                      hidden: {
                        _code: 'return getSettingValue(data?.chartType) !== `pie`',
                        _mode: 'code',
                        _value: false,
                      } as any,
                      jsSetting: true,
                    },
                    {
                      id: nanoid(),
                      type: 'switch',
                      propertyName: 'stacked',
                      label: 'Stacked',
                      description: 'If the bar chart is a stacked chart, switch to true.',
                      tooltip: 'If the bar chart is a stacked chart, switch to true.',
                      parentId: commonTabId,
                      defaultValue: false,
                      hidden: {
                        _code:
                          'return getSettingValue(data?.chartType) !== `bar` || getSettingValue(data?.simpleOrPivot) !== `pivot` || getSettingValue(data?.dataMode) === `url`',
                        _mode: 'code',
                        _value: false,
                      } as any,
                      jsSetting: true,
                    }
                  ]
                })
                .addCollapsiblePanel({
                  id: nanoid(),
                  label: 'Quick Settings',
                  labelAlign: 'right',
                  description: 'Quick settings to get started with the chart',
                  parentId: commonTabId,
                  ghost: true,
                  collapsible: 'header',
                  collapsedByDefault: false,
                  content: {
                    id: nanoid(),
                    components: [
                      ...new DesignerToolbarSettings()
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: commonTabId,
                          inputs: [
                            {
                              id: nanoid(),
                              propertyName: 'dataMode',
                              parentId: commonTabId,
                              label: 'Data Source Type',
                              description:
                                'The type of data source you want to use for the chart. If you select `URL`, you will have to provide a URL endpoint to the data. If you select `Entity Type`, you will have to select an entity type from the list.',
                              tooltip: 'The type of data source you want to use for the chart. If you select `URL`, you will have to provide a URL endpoint to the data. If you select `Entity Type`, you will have to select an entity type from the list.',
                              type: 'dropdown',
                              allowClear: true,
                              dropdownOptions: [
                                { label: 'URL', value: 'url' },
                                { label: 'Entity type', value: 'entityType' },
                              ],
                              validate: { required: true },
                              defaultValue: 'entityType',
                              jsSetting: true,
                            },
                            {
                              id: nanoid(),
                              propertyName: 'simpleOrPivot',
                              parentId: commonTabId,
                              label: 'Simple / Pivot',
                              type: 'dropdown',
                              allowClear: true,
                              dropdownOptions: [
                                { label: 'Simple', value: 'simple' },
                                { label: 'Pivot', value: 'pivot' },
                              ],
                              validate: { required: true },
                              defaultValue: 'simple',
                              hidden: {
                                _code: 'return getSettingValue(data?.dataMode) === `url`',
                                _mode: 'code',
                                _value: false,
                              } as any,
                              jsSetting: true,
                            },
                          ]
                        })
                        .addContainer({
                          id: dataSettingsForUrlId,
                          propertyName: 'dataSettingsForUrl',
                          parentId: commonTabId,
                          label: 'Data Settings (URL)',
                          labelAlign: 'left',
                          hidden: {
                            _code: 'return getSettingValue(data?.dataMode) !== `url`',
                            _mode: 'code',
                            _value: false,
                          } as any,
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'url',
                                label: 'URL',
                                labelAlign: 'right',
                                parentId: dataTabId,
                                inputType: 'endpointsAutocomplete',
                                description: 'The endpoint to use to fetch data.',
                                tooltip: 'The endpoint to use to fetch data.',
                                validate: {
                                  required: {
                                    _code: "return getSettingValue(data.dataMode) === 'url';",
                                    _mode: 'code',
                                    _value: false,
                                  } as any,
                                },
                                dataSourceType: 'url',
                                dataSourceUrl: '/api/services/app/Api/Endpoints',
                                settingsValidationErrors: [],
                                useRawValues: true,
                                jsSetting: true,
                                width: '100%',
                                placeholder: '',
                                allowClear: true,
                              })
                              .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'additionalProperties',
                                label: 'Additional Properties',
                                parentId: dataSettingsForUrlId,
                                jsSetting: true,
                                inputType: 'labelValueEditor',
                                labelTitle: 'Key',
                                valueTitle: 'Value',
                                labelName: 'key',
                                valueName: 'value',
                                tooltip:
                                  'Additional properties you want to be passed when the form gets submitted like parentId in the case where the modal is used in a childTable. ' +
                                  'Also note you can use Mustache expression like {{id}} for value property. \n\n' +
                                  'Id initial value is already initialised with {{entityReference.id}} but you can override it',
                                exposedVariables: [
                                  { name: 'data', description: 'This form data', type: 'object' },
                                  { name: 'form', description: 'Form instance', type: 'object' },
                                  {
                                    name: 'formMode',
                                    description: 'Current form mode',
                                    type: "'designer' | 'edit' | 'readonly'",
                                  },
                                  { name: 'globalState', description: 'Global state', type: 'object' },
                                  {
                                    name: 'entityReference.id',
                                    description: 'Id of entity reference entity',
                                    type: 'object',
                                  },
                                  { name: 'entityReference.entity', description: 'Entity', type: 'object' },
                                  { name: 'moment', description: 'moment', type: '' },
                                  { name: 'http', description: 'axiosHttp', type: '' },
                                ].map((item) => JSON.stringify(item)),
                              }
                              )
                              .toJson(),
                          ],
                        })
                        .addContainer({
                          id: dataSettingsId,
                          propertyName: 'dataSettings',
                          parentId: dataTabId,
                          label: 'Data Settings',
                          labelAlign: 'left',
                          hidden: {
                            _code: 'return getSettingValue(data?.dataMode) === `url`',
                            _mode: 'code',
                            _value: false,
                          } as any,
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: dataSettingsId,
                                inputs: [
                                  {
                                    id: nanoid(),
                                    type: 'autocomplete',
                                    propertyName: 'entityType',
                                    label: 'Entity Type',
                                    description: 'The entity type you want to use.',
                                    labelAlign: 'right',
                                    parentId: dataSettingsId,
                                    hidden: false,
                                    dataSourceType: 'url',
                                    validate: {},
                                    dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
                                    settingsValidationErrors: [],
                                    jsSetting: true,
                                    useRawValues: true,
                                    width: '50%',
                                  },
                                  {
                                    id: nanoid(),
                                    type: 'numberField',
                                    propertyName: 'maxResultCount',
                                    label: 'Data Size Limit',
                                    description: "The maximum number of items to be fetched from the data source. If not provided, the data will be fetched without a limit." +
                                      "-1 means no limit, 250 is the default limit. Higher values may cause performance issues, for higher values aggregating data in the backend is advised.",
                                    tooltip: "The maximum number of items to be fetched from the data source. If not provided, the data will be fetched without a limit." +
                                      "-1 means no limit, 250 is the default limit. Higher values may cause performance issues, for higher values aggregating data in the backend is advised.",
                                    parentId: dataSettingsId,
                                    validate: { required: false },
                                    min: -1,
                                    jsSetting: true,
                                  }
                                ],
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: dataSettingsId,
                                inline: true,
                                hidden: {
                                  _code: 'return getSettingValue(data?.dataMode) === `url`',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                inputs: [
                                  {
                                    id: nanoid(),
                                    propertyName: 'axisProperty',
                                    label: 'Axis Property',
                                    labelAlign: 'right',
                                    parentId: dataSettingsId,
                                    type: 'propertyAutocomplete',
                                    isDynamic: false,
                                    description: 'The property to be used on the x-axis.',
                                    validate: { required: true },
                                    modelType: {
                                      _code: 'return getSettingValue(data?.entityType);',
                                      _mode: 'code',
                                      _value: false
                                    } as any,
                                    autoFillProps: false,
                                    settingsValidationErrors: [],
                                    width: '100%',
                                    jsSetting: true,
                                  },
                                ],
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: dataSettingsId,
                                inline: true,
                                hidden: {
                                  _code: 'return !getSettingValue(data?.axisProperty)',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                inputs: [
                                  {
                                    id: nanoid(),
                                    type: 'switch',
                                    propertyName: 'isAxisTimeSeries',
                                    label: 'Is Axis Property Time Series?',
                                    description: 'If the x-axis is a time series, switch to true.',
                                    parentId: dataSettingsId,
                                    defaultValue: false,
                                    validate: { required: true },
                                    jsSetting: true,
                                    width: '50%',
                                  },
                                  {
                                    id: nanoid(),
                                    propertyName: 'timeSeriesFormat',
                                    parentId: dataSettingsId,
                                    label: 'Time Series Format',
                                    type: 'dropdown',
                                    allowClear: true,
                                    dropdownOptions: [
                                      { label: 'Day', value: 'day' },
                                      { label: 'Month', value: 'month' },
                                      { label: 'Year', value: 'year' },
                                      { label: 'Day-Month', value: 'day-month' },
                                      { label: 'Day-Month-Year', value: 'day-month-year' },
                                      { label: 'Month-Year', value: 'month-year' },
                                    ],
                                    validate: { required: true },
                                    defaultValue: 'month-year',
                                    jsSetting: true,
                                    hidden: {
                                      _code: 'return getSettingValue(data?.isAxisTimeSeries) !== true',
                                      _mode: 'code',
                                      _value: false,
                                    } as any,
                                    width: '50%',
                                  }
                                ]
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: dataSettingsId,
                                inline: true,
                                hidden: {
                                  _code: 'return getSettingValue(data?.dataMode) === `url`',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                inputs: [
                                  {
                                    id: nanoid(),
                                    propertyName: 'valueProperty',
                                    label: 'Value Property',
                                    labelAlign: 'right',
                                    parentId: dataSettingsId,
                                    type: 'propertyAutocomplete',
                                    isDynamic: false,
                                    description: 'The property to be used on the x-axis.',
                                    validate: { required: true },
                                    modelType: {
                                      _code: 'return getSettingValue(data?.entityType);',
                                      _mode: 'code',
                                      _value: false
                                    } as any,
                                    autoFillProps: false,
                                    settingsValidationErrors: [],
                                    width: '100%',
                                    jsSetting: true,
                                  },
                                ],
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: dataSettingsId,
                                inline: true,
                                hidden: {
                                  _code: 'return getSettingValue(data?.simpleOrPivot) === `simple`',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                inputs: [
                                  {
                                    id: nanoid(),
                                    propertyName: 'groupingProperty',
                                    label: 'Grouping Property',
                                    labelAlign: 'right',
                                    parentId: dataSettingsId,
                                    type: 'propertyAutocomplete',
                                    isDynamic: false,
                                    description:
                                      'The properties you want to use on the Legend. This is the property that will be used to group the data for Pivot Charts.',
                                    validate: { required: true },
                                    modelType: {
                                      _code: 'return getSettingValue(data?.entityType);',
                                      _mode: 'code',
                                      _value: false
                                    } as any,
                                    autoFillProps: false,
                                    settingsValidationErrors: [],
                                    width: '100%',
                                    jsSetting: true,
                                  },
                                ],
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: dataSettingsId,
                                inline: true,
                                hidden: {
                                  _code: 'return !getSettingValue(data?.groupingProperty)',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                inputs: [
                                  {
                                    id: nanoid(),
                                    type: 'switch',
                                    propertyName: 'isGroupingTimeSeries',
                                    label: 'Is Grouping Property Time Series?',
                                    description: 'If the grouping property is a time series, switch to true.',
                                    parentId: dataSettingsId,
                                    defaultValue: false,
                                    validate: { required: true },
                                    width: '50%',
                                    jsSetting: true,
                                  },
                                  {
                                    id: nanoid(),
                                    propertyName: 'groupingTimeSeriesFormat',
                                    parentId: dataSettingsId,
                                    label: 'Grouping Time Series Format',
                                    type: 'dropdown',
                                    allowClear: true,
                                    dropdownOptions: [
                                      { label: 'Day', value: 'day' },
                                      { label: 'Month', value: 'month' },
                                      { label: 'Year', value: 'year' },
                                      { label: 'Day-Month', value: 'day-month' },
                                      { label: 'Day-Month-Year', value: 'day-month-year' },
                                      { label: 'Month-Year', value: 'month-year' },
                                    ],
                                    validate: { required: true },
                                    defaultValue: 'month-year',
                                    jsSetting: true,
                                    hidden: {
                                      _code: 'return getSettingValue(data?.isGroupingTimeSeries) !== true',
                                      _mode: 'code',
                                      _value: false,
                                    } as any,
                                    width: '50%',
                                  }
                                ],
                              })

                              .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'aggregationMethod',
                                parentId: dataSettingsId,
                                label: 'Aggregation Method',
                                inputType: 'dropdown',
                                allowClear: true,
                                dropdownOptions: [
                                  { label: 'Sum', value: 'sum' },
                                  { label: 'Count', value: 'count' },
                                  { label: 'Average', value: 'average' },
                                  { label: 'Min', value: 'min' },
                                  { label: 'Max', value: 'max' },
                                ],
                                validate: { required: true },
                                defaultValue: 'count',
                                jsSetting: true,
                              })
                              .toJson(),
                          ],
                        })
                        .toJson(),
                    ],
                  },
                })
                .addCollapsiblePanel({
                  id: nanoid(),
                  label: 'Labels',
                  labelAlign: 'right',
                  description: 'Labels for the chart',
                  parentId: commonTabId,
                  ghost: true,
                  collapsible: 'header',
                  collapsedByDefault: false,
                  content: {
                    id: nanoid(),
                    components: [
                      ...new DesignerToolbarSettings()
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: commonTabId,
                          inputs: [
                            {
                              id: nanoid(),
                              type: 'switch',
                              propertyName: 'showTitle',
                              label: 'Show Title',
                              description: 'Show the title of the chart',
                              parentId: commonTabId,
                              defaultValue: true,
                              jsSetting: true,
                              width: '50%',
                            },
                            {
                              id: nanoid(),
                              type: 'textField',
                              propertyName: 'title',
                              parentId: commonTabId,
                              label: 'Title',
                              tooltip: 'The title of the chart (if any), if none then the title will be generated from the entity type.',
                              description: 'The title of the chart (if any)',
                              labelAlign: 'right',
                              jsSetting: true,
                              hidden: {
                                _code: 'return getSettingValue(data?.showTitle) !== true',
                                _mode: 'code',
                                _value: true,
                              } as any,
                            }
                          ]
                        })
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: commonTabId,
                          hidden: {
                            _code: 'return !(getSettingValue(data?.chartType) === `pie` || getSettingValue(data?.chartType) === `polarArea` || getSettingValue(data?.simpleOrPivot) === `pivot`)',
                            _mode: 'code',
                            _value: false,
                          } as any,
                          inputs: [
                            {
                              id: nanoid(),
                              type: 'switch',
                              propertyName: 'showLegend',
                              label: 'Show Legend',
                              description:
                                'Show the legend of the chart. Legend is the area that shows the color and what it represents.',
                              parentId: commonTabId,
                              defaultValue: false,
                              jsSetting: true,
                              width: '50%',
                            },
                            {
                              id: nanoid(),
                              propertyName: 'legendPosition',
                              parentId: commonTabId,
                              hidden: {
                                _code: 'return getSettingValue(data?.showLegend) !== true',
                                _mode: 'code',
                                _value: true,
                              } as any,
                              label: 'Legend Position',
                              type: 'dropdown',
                              allowClear: true,
                              dropdownOptions: [
                                { label: 'Top', value: 'top' },
                                { label: 'Bottom', value: 'bottom' },
                                { label: 'Left', value: 'left' },
                                { label: 'Right', value: 'right' },
                              ],
                              validate: { required: true },
                              defaultValue: 'top',
                              jsSetting: true,
                            },
                          ],
                        })
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: commonTabId,
                          hidden: {
                            _code: 'return getSettingValue(data?.chartType) === `pie` || getSettingValue(data?.chartType) === `polarArea`',
                            _mode: 'code',
                            _value: false,
                          } as any,
                          inputs: [
                            {
                              id: nanoid(),
                              type: 'switch',
                              propertyName: 'showXAxisScale',
                              label: 'Show X Axis',
                              parentId: commonTabId,
                              defaultValue: true,
                              jsSetting: true,
                            },
                            {
                              id: nanoid(),
                              type: 'switch',
                              propertyName: 'showXAxisTitle',
                              label: 'Show X Axis Title',
                              parentId: commonTabId,
                              defaultValue: true,
                              hidden: {
                                _code: 'return getSettingValue(data?.showXAxisScale) !== true',
                                _mode: 'code',
                                _value: true,
                              } as any,
                              jsSetting: true,
                            },
                          ],
                        })
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: commonTabId,
                          hidden: {
                            _code: 'return getSettingValue(data?.showXAxisTitle) !== true',
                            _mode: 'code',
                            _value: true,
                          } as any,
                          inputs: [
                            {
                              id: nanoid(),
                              type: 'textField',
                              propertyName: 'axisPropertyLabel',
                              label: 'Axis Property Label',
                              description: 'Custom label of the x-axis. If not provided, the label will be generated from the entity type property.',
                              tooltip: 'Custom label of the x-axis. If not provided, the label will be generated from the entity type property.',
                              parentId: commonTabId,
                              jsSetting: true,
                            },
                          ]
                        })
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: commonTabId,
                          hidden: {
                            _code: 'return getSettingValue(data?.chartType) === `pie` || getSettingValue(data?.chartType) === `polarArea`',
                            _mode: 'code',
                            _value: false,
                          } as any,
                          inputs: [
                            {
                              id: nanoid(),
                              type: 'switch',
                              propertyName: 'showYAxisScale',
                              label: 'Show Y Axis',
                              parentId: commonTabId,
                              defaultValue: true,
                              jsSetting: true,
                            },
                            {
                              id: nanoid(),
                              type: 'switch',
                              propertyName: 'showYAxisTitle',
                              label: 'Show Y Axis Title',
                              parentId: commonTabId,
                              defaultValue: true,
                              hidden: {
                                _code: 'return getSettingValue(data?.showYAxisScale) !== true',
                                _mode: 'code',
                                _value: true,
                              } as any,
                              jsSetting: true,
                            },
                          ],
                        })
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: commonTabId,
                          hidden: {
                            _code: 'return getSettingValue(data?.showYAxisTitle) !== true',
                            _mode: 'code',
                            _value: true,
                          } as any,
                          inputs: [
                            {
                              id: nanoid(),
                              type: 'textField',
                              propertyName: 'valuePropertyLabel',
                              label: 'Value Property Label',
                              description: 'Custom label of the value property. If not provided, the label will be generated from the entity type property.',
                              tooltip: 'Custom label of the value property. If not provided, the label will be generated from the entity type property.',
                              parentId: commonTabId,
                              jsSetting: true,
                            }
                          ]
                        })
                        .toJson(),
                    ]
                  }
                })
                .toJson(),
            ],
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
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'dataMode',
                      parentId: 'root',
                      label: 'Data Source Type',
                      description:
                        'The type of data source you want to use for the chart. If you select `URL`, you will have to provide a URL endpoint to the data. If you select `Entity Type`, you will have to select an entity type from the list.',
                      type: 'dropdown',
                      allowClear: true,
                      dropdownOptions: [
                        { label: 'URL', value: 'url' },
                        { label: 'Entity type', value: 'entityType' },
                      ],
                      validate: { required: true },
                      defaultValue: 'entityType',
                      hidden: false,
                      jsSetting: true,
                      width: '50%',
                    },
                    {
                      id: nanoid(),
                      type: 'numberField',
                      propertyName: 'requestTimeout',
                      parentId: dataTabId,
                      label: 'Request Timeout',
                      description: 'The timeout for the request (in milliseconds) to the data source. 10000 is the default timeout.',
                      tooltip: 'The timeout for the request (in milliseconds) to the data source. 10000 is the default timeout.',
                      validate: { required: false },
                      defaultValue: 10000,
                      min: 0,
                      jsSetting: true,
                    }
                  ]
                })
                .addContainer({
                  id: dataSettingsForUrlId,
                  propertyName: 'dataSettingsForUrl',
                  parentId: dataTabId,
                  label: 'Data Settings (URL)',
                  labelAlign: 'left',
                  hidden: {
                    _code: 'return getSettingValue(data?.dataMode) !== `url`',
                    _mode: 'code',
                    _value: false,
                  } as any,
                  components: [
                    ...new DesignerToolbarSettings()
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'url',
                        label: 'URL',
                        labelAlign: 'right',
                        parentId: dataTabId,
                        inputType: 'endpointsAutocomplete',
                        description: 'The endpoint to use to fetch data.',
                        validate: {
                          required: {
                            _code: "return getSettingValue(data.dataMode) === 'url';",
                            _mode: 'code',
                            _value: false,
                          } as any,
                        },
                        dataSourceType: 'url',
                        dataSourceUrl: '/api/services/app/Api/Endpoints',
                        settingsValidationErrors: [],
                        useRawValues: true,
                        jsSetting: true,
                        width: '100%',
                        placeholder: '',
                        allowClear: true,
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'additionalProperties',
                        label: 'Additional Properties',
                        parentId: dataSettingsForUrlId,
                        inputType: 'labelValueEditor',
                        labelTitle: 'Key',
                        valueTitle: 'Value',
                        labelName: 'key',
                        valueName: 'value',
                        tooltip:
                          'Additional properties you want to be passed when the form gets submitted like parentId in the case where the modal is used in a childTable. ' +
                          'Also note you can use Mustache expression like {{id}} for value property. \n\n' +
                          'Id initial value is already initialised with {{entityReference.id}} but you can override it',
                        exposedVariables: [
                          { name: 'data', description: 'This form data', type: 'object' },
                          { name: 'form', description: 'Form instance', type: 'object' },
                          {
                            name: 'formMode',
                            description: 'Current form mode',
                            type: "'designer' | 'edit' | 'readonly'",
                          },
                          { name: 'globalState', description: 'Global state', type: 'object' },
                          {
                            name: 'entityReference.id',
                            description: 'Id of entity reference entity',
                            type: 'object',
                          },
                          { name: 'entityReference.entity', description: 'Entity', type: 'object' },
                          { name: 'moment', description: 'moment', type: '' },
                          { name: 'http', description: 'axiosHttp', type: '' },
                        ].map((item) => JSON.stringify(item)),
                        jsSetting: true,
                      }
                      )
                      .toJson(),
                  ],
                })
                .addContainer({
                  id: dataSettingsId,
                  propertyName: 'dataSettings',
                  parentId: dataTabId,
                  label: 'Data Settings',
                  labelAlign: 'left',
                  hidden: {
                    _code: 'return getSettingValue(data?.dataMode) === `url`',
                    _mode: 'code',
                    _value: false,
                  } as any,
                  components: [
                    ...new DesignerToolbarSettings()
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        inputs: [
                          {
                            id: nanoid(),
                            type: 'autocomplete',
                            propertyName: 'entityType',
                            label: 'Entity Type',
                            description: 'The entity type you want to use.',
                            labelAlign: 'right',
                            parentId: dataTabId,
                            hidden: false,
                            dataSourceType: 'url',
                            validate: {},
                            dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
                            settingsValidationErrors: [],
                            jsSetting: true,
                            useRawValues: true,
                            width: '50%'
                          },
                          {
                            id: nanoid(),
                            type: 'numberField',
                            propertyName: 'maxResultCount',
                            label: 'Data Size Limit',
                            description: "The maximum number of items to be fetched from the data source. If not provided, the data will be fetched without a limit." +
                              "-1 means no limit, 250 is the default limit. Higher values may cause performance issues, for higher values aggregating data in the backend is advised.",
                            tooltip: "The maximum number of items to be fetched from the data source. If not provided, the data will be fetched without a limit." +
                              "-1 means no limit, 250 is the default limit. Higher values may cause performance issues, for higher values aggregating data in the backend is advised.",
                            parentId: dataTabId,
                            validate: { required: false },
                            min: -1,
                            jsSetting: true,
                          }
                        ],
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        inline: true,
                        hidden: {
                          _code: 'return getSettingValue(data?.dataMode) === `url`',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        inputs: [
                          {
                            id: nanoid(),
                            propertyName: 'axisProperty',
                            label: 'Axis Property',
                            labelAlign: 'right',
                            parentId: dataTabId,
                            type: 'propertyAutocomplete',
                            isDynamic: false,
                            description: 'The property to be used on the x-axis.',
                            validate: { required: true },
                            modelType: {
                              _code: 'return getSettingValue(data?.entityType);',
                              _mode: 'code',
                              _value: false
                            } as any,
                            autoFillProps: false,
                            settingsValidationErrors: [],
                            width: '100%',
                            jsSetting: true,
                          },
                        ],
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        hidden: {
                          _code: 'return !getSettingValue(data?.axisProperty)',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        inputs: [
                          {
                            id: nanoid(),
                            type: 'switch',
                            propertyName: 'isAxisTimeSeries',
                            label: 'Is Axis Property Time Series?',
                            description: 'If the x-axis is a time series, switch to true.',
                            parentId: dataTabId,
                            defaultValue: false,
                            validate: { required: false },
                            width: '50%',
                            jsSetting: true,
                          },
                          {
                            id: nanoid(),
                            propertyName: 'timeSeriesFormat',
                            parentId: dataTabId,
                            label: 'Time Series Format',
                            type: 'dropdown',
                            allowClear: true,
                            dropdownOptions: [
                              { label: 'Day', value: 'day' },
                              { label: 'Month', value: 'month' },
                              { label: 'Year', value: 'year' },
                              { label: 'Day-Month', value: 'day-month' },
                              { label: 'Day-Month-Year', value: 'day-month-year' },
                              { label: 'Month-Year', value: 'month-year' },
                            ],
                            validate: { required: true },
                            defaultValue: 'month-year',
                            jsSetting: true,
                            hidden: {
                              _code: 'return getSettingValue(data?.isAxisTimeSeries) !== true',
                              _mode: 'code',
                              _value: false,
                            } as any,
                          },
                        ],
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        inline: true,
                        hidden: {
                          _code: 'return getSettingValue(data?.dataMode) === `url`',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        inputs: [
                          {
                            id: nanoid(),
                            propertyName: 'valueProperty',
                            label: 'Value Property',
                            labelAlign: 'right',
                            parentId: dataTabId,
                            type: 'propertyAutocomplete',
                            isDynamic: false,
                            description: 'The property to be used on the x-axis.',
                            validate: { required: true },
                            modelType: {
                              _code: 'return getSettingValue(data?.entityType);',
                              _mode: 'code',
                              _value: false
                            } as any,
                            autoFillProps: false,
                            settingsValidationErrors: [],
                            width: '100%',
                            jsSetting: true,
                          },
                        ],
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        inline: true,
                        hidden: {
                          _code: 'return getSettingValue(data?.simpleOrPivot) === `simple`',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        inputs: [
                          {
                            id: nanoid(),
                            propertyName: 'groupingProperty',
                            label: 'Grouping Property',
                            labelAlign: 'right',
                            parentId: dataTabId,
                            type: 'propertyAutocomplete',
                            isDynamic: false,
                            description:
                              'The properties you want to use on the Legend. This is the property that will be used to group the data for Pivot Charts.',
                            validate: { required: true },
                            modelType: {
                              _code: 'return getSettingValue(data?.entityType);',
                              _mode: 'code',
                              _value: false
                            } as any,
                            autoFillProps: false,
                            settingsValidationErrors: [],
                            width: '100%',
                            jsSetting: true,
                          },
                        ],
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        inline: true,
                        hidden: {
                          _code: 'return !getSettingValue(data?.groupingProperty)',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        inputs: [
                          {
                            id: nanoid(),
                            type: 'switch',
                            propertyName: 'isGroupingTimeSeries',
                            label: 'Is Grouping Property Time Series?',
                            description: 'If the grouping property is a time series, switch to true.',
                            parentId: dataTabId,
                            defaultValue: false,
                            validate: { required: false },
                            width: '50%',
                            jsSetting: true,
                          },
                          {
                            id: nanoid(),
                            propertyName: 'groupingTimeSeriesFormat',
                            parentId: dataTabId,
                            label: 'Grouping Time Series Format',
                            type: 'dropdown',
                            allowClear: true,
                            dropdownOptions: [
                              { label: 'Day', value: 'day' },
                              { label: 'Month', value: 'month' },
                              { label: 'Year', value: 'year' },
                              { label: 'Day-Month', value: 'day-month' },
                              { label: 'Day-Month-Year', value: 'day-month-year' },
                              { label: 'Month-Year', value: 'month-year' },
                            ],
                            validate: { required: true },
                            defaultValue: 'month-year',
                            width: '50%',
                            jsSetting: true,
                            hidden: {
                              _code: 'return getSettingValue(data?.isGroupingTimeSeries) !== true',
                              _mode: 'code',
                              _value: false,
                            } as any,
                          },
                        ],
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        inline: true,
                        hidden: {
                          _code: 'return getSettingValue(data?.dataMode) === `url`',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        inputs: [
                          {
                            id: nanoid(),
                            propertyName: 'orderBy',
                            label: 'Order By',
                            labelAlign: 'right',
                            parentId: dataTabId,
                            type: 'propertyAutocomplete',
                            isDynamic: false,
                            description:
                              'The properties you want to order the data by. Use the propeties that you have selected for axis, value (and legend).',
                            validate: { required: false },
                            modelType: {
                              _code: 'return getSettingValue(data?.entityType);',
                              _mode: 'code',
                              _value: false,
                            } as any,
                            autoFillProps: false,
                            settingsValidationErrors: [],
                            width: '100%',
                            jsSetting: true,
                          },
                        ],
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        inline: true,
                        inputs: [
                          {
                            id: nanoid(),
                            propertyName: 'orderDirection',
                            parentId: dataTabId,
                            label: 'Order Direction',
                            type: 'dropdown',
                            allowClear: true,
                            dropdownOptions: [
                              { label: 'Ascending', value: 'asc' },
                              { label: 'Descending', value: 'desc' },
                            ],
                            validate: { required: true },
                            defaultValue: 'asc',
                            hidden: {
                              _code: 'return !(getSettingValue(data?.orderBy))',
                              _mode: 'code',
                              _value: false,
                            } as any,
                            jsSetting: true,
                          }
                        ]
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'aggregationMethod',
                        parentId: dataTabId,
                        label: 'Aggregation Method',
                        inputType: 'dropdown',
                        allowClear: true,
                        dropdownOptions: [
                          { label: 'Sum', value: 'sum' },
                          { label: 'Count', value: 'count' },
                          { label: 'Average', value: 'average' },
                          { label: 'Min', value: 'min' },
                          { label: 'Max', value: 'max' },
                        ],
                        validate: { required: true },
                        defaultValue: 'count',
                        jsSetting: true,
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        inline: true,
                        hidden: {
                          _code: 'return getSettingValue(data?.dataMode) === `url` || !getSettingValue(data?.entityType)',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        inputs: [
                          {
                            id: nanoid(),
                            propertyName: 'filters',
                            label: 'Entity Filter',
                            labelAlign: 'right',
                            parentId: dataTabId,
                            type: 'queryBuilder',
                            hidden: false,
                            isDynamic: false,
                            validate: {},
                            settingsValidationErrors: [],
                            modelType: {
                              _code: 'return getSettingValue(data?.entityType);',
                              _mode: 'code',
                              _value: false,
                            } as any,
                            fieldsUnavailableHint: 'Please select `Entity Type` to be able to configure this filter.',
                            width: '100%',
                            jsSetting: true,
                          },
                        ],
                      })
                      .toJson(),
                  ],
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
                .addCollapsiblePanel({
                  id: nanoid(),
                  propertyName: 'pnlTitleFont',
                  label: 'Title Font',
                  labelAlign: 'right',
                  parentId: appearanceTabId,
                  ghost: true,
                  collapsible: 'header',
                  content: {
                    id: nanoid(),
                    components: [...new DesignerToolbarSettings()
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: appearanceTabId,
                        inline: true,
                        propertyName: 'titleFont',
                        inputs: [
                          {
                            type: 'dropdown',
                            id: nanoid(),
                            label: 'Family',
                            propertyName: 'titleFont.family',
                            hideLabel: true,
                            dropdownOptions: fontTypes,
                            defaultValue: 'Segoe UI',
                          },
                          {
                            type: 'numberField',
                            id: nanoid(),
                            label: 'Size',
                            propertyName: 'titleFont.size',
                            hideLabel: true,
                            width: 50,
                            defaultValue: 16,
                            min: 8,
                            max: 32,
                          },
                          {
                            type: 'dropdown',
                            id: nanoid(),
                            label: 'Weight',
                            propertyName: 'titleFont.weight',
                            hideLabel: true,
                            tooltip: "Controls text thickness (light, normal, bold, etc.)",
                            dropdownOptions: fontWeights,
                            width: 100,
                            defaultValue: '400',
                          },
                          {
                            type: 'colorPicker',
                            id: nanoid(),
                            label: 'Color',
                            hideLabel: true,
                            propertyName: 'titleFont.color',
                            defaultValue: '#000000',
                          },
                        ],
                      })
                      .toJson()
                    ]
                  }
                })
                .addCollapsiblePanel({
                  id: nanoid(),
                  propertyName: 'pnlAxisLabelFont',
                  label: 'Axis Labels Font',
                  labelAlign: 'right',
                  parentId: appearanceTabId,
                  ghost: true,
                  collapsible: 'header',
                  content: {
                    id: nanoid(),
                    components: [...new DesignerToolbarSettings()
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: appearanceTabId,
                        inline: true,
                        propertyName: 'axisLabelFont',
                        inputs: [
                          {
                            type: 'dropdown',
                            id: nanoid(),
                            label: 'Family',
                            propertyName: 'axisLabelFont.family',
                            hideLabel: true,
                            dropdownOptions: fontTypes,
                            defaultValue: 'Segoe UI',
                          },
                          {
                            type: 'numberField',
                            id: nanoid(),
                            label: 'Size',
                            propertyName: 'axisLabelFont.size',
                            hideLabel: true,
                            width: 50,
                            defaultValue: 12,
                            min: 8,
                            max: 24,
                          },
                          {
                            type: 'dropdown',
                            id: nanoid(),
                            label: 'Weight',
                            propertyName: 'axisLabelFont.weight',
                            hideLabel: true,
                            tooltip: "Controls text thickness (light, normal, bold, etc.)",
                            dropdownOptions: fontWeights,
                            width: 100,
                            defaultValue: '400',
                          },
                          {
                            type: 'colorPicker',
                            id: nanoid(),
                            label: 'Color',
                            hideLabel: true,
                            propertyName: 'axisLabelFont.color',
                            defaultValue: '#000000',
                          },
                        ],
                      })
                      .toJson()
                    ]
                  },
                  hidden: {
                    _code: 'return ["polarArea", "pie"].includes(getSettingValue(data?.chartType));',
                    _mode: 'code',
                    _value: false,
                  } as any,
                })
                .addCollapsiblePanel({
                  id: nanoid(),
                  propertyName: 'pnlLegendFont',
                  label: 'Legend Font',
                  labelAlign: 'right',
                  parentId: appearanceTabId,
                  ghost: true,
                  collapsible: 'header',
                  hidden: {
                    _code: 'return ["line", "bar"].includes(getSettingValue(data?.chartType)) && getSettingValue(data?.chartType) !== "pivot";',
                    _mode: 'code',
                    _value: false,
                  } as any,
                  content: {
                    id: nanoid(),
                    components: [...new DesignerToolbarSettings()
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: appearanceTabId,
                        inline: true,
                        propertyName: 'legendFont',
                        inputs: [
                          {
                            type: 'dropdown',
                            id: nanoid(),
                            label: 'Family',
                            propertyName: 'legendFont.family',
                            hideLabel: true,
                            dropdownOptions: fontTypes,
                            defaultValue: 'Segoe UI',
                          },
                          {
                            type: 'numberField',
                            id: nanoid(),
                            label: 'Size',
                            propertyName: 'legendFont.size',
                            hideLabel: true,
                            width: 50,
                            defaultValue: 12,
                            min: 8,
                            max: 24,
                          },
                          {
                            type: 'dropdown',
                            id: nanoid(),
                            label: 'Weight',
                            propertyName: 'legendFont.weight',
                            hideLabel: true,
                            tooltip: "Controls text thickness (light, normal, bold, etc.)",
                            dropdownOptions: fontWeights,
                            width: 100,
                            defaultValue: '400',
                          },
                          {
                            type: 'colorPicker',
                            id: nanoid(),
                            label: 'Color',
                            hideLabel: true,
                            propertyName: 'legendFont.color',
                            defaultValue: '#000000',
                          },
                        ],
                      })
                      .toJson()
                    ]
                  }
                })
                .addCollapsiblePanel({
                  id: nanoid(),
                  propertyName: 'pnlTickFont',
                  label: 'Grid Ticks Font',
                  labelAlign: 'right',
                  parentId: appearanceTabId,
                  ghost: true,
                  collapsible: 'header',
                  content: {
                    id: nanoid(),
                    components: [...new DesignerToolbarSettings()
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: appearanceTabId,
                        inline: true,
                        propertyName: 'tickFont',
                        inputs: [
                          {
                            type: 'dropdown',
                            id: nanoid(),
                            label: 'Family',
                            propertyName: 'tickFont.family',
                            hideLabel: true,
                            dropdownOptions: fontTypes,
                            defaultValue: 'Segoe UI',
                          },
                          {
                            type: 'numberField',
                            id: nanoid(),
                            label: 'Size',
                            propertyName: 'tickFont.size',
                            hideLabel: true,
                            width: 50,
                            defaultValue: 12,
                            min: 8,
                            max: 24,
                          },
                          {
                            type: 'dropdown',
                            id: nanoid(),
                            label: 'Weight',
                            propertyName: 'tickFont.weight',
                            hideLabel: true,
                            tooltip: "Controls text thickness (light, normal, bold, etc.)",
                            dropdownOptions: fontWeights,
                            width: 100,
                            defaultValue: '400',
                          },
                          {
                            type: 'colorPicker',
                            id: nanoid(),
                            label: 'Color',
                            hideLabel: true,
                            propertyName: 'tickFont.color',
                            defaultValue: '#000000',
                          },
                        ],
                      })
                      .toJson()
                    ]
                  },
                  hidden: {
                    _code: 'return ["polarArea", "pie"].includes(getSettingValue(data?.chartType));',
                    _mode: 'code',
                    _value: false,
                  } as any,
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
                    _code: "    return contexts.canvasContext?.designerDevice || 'desktop';",
                    _value: ""
                  },
                  components: [
                    ...new DesignerToolbarSettings()
                      .addCollapsiblePanel({
                        id: dimensionsStyleCollapsiblePanelId,
                        propertyName: 'pnlDimensions',
                        label: 'Dimensions',
                        parentId: styleRouterId,
                        labelAlign: 'right',
                        ghost: true,
                        collapsible: 'header',
                        content: {
                          id: dimensionsStylePnlId,
                          components: [...new DesignerToolbarSettings()
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: dimensionsStylePnlId,
                              inline: true,
                              inputs: [
                                {
                                  type: 'textField',
                                  id: nanoid(),
                                  label: "Width",
                                  width: 85,
                                  propertyName: "dimensions.width",
                                  icon: "widthIcon",
                                  tooltip: "You can use any unit (%, px, em, etc). px by default if without unit. We recommend 100%."

                                },
                                {
                                  type: 'textField',
                                  id: nanoid(),
                                  label: "Min Width",
                                  width: 85,
                                  hideLabel: true,
                                  propertyName: "dimensions.minWidth",
                                  icon: "minWidthIcon",
                                },
                                {
                                  type: 'textField',
                                  id: nanoid(),
                                  label: "Max Width",
                                  width: 85,
                                  hideLabel: true,
                                  propertyName: "dimensions.maxWidth",
                                  icon: "maxWidthIcon",
                                }
                              ]
                            })
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: dimensionsStylePnlId,
                              inline: true,
                              inputs: [
                                {
                                  type: 'textField',
                                  id: nanoid(),
                                  label: "Height",
                                  width: 85,
                                  propertyName: "dimensions.height",
                                  icon: "heightIcon",
                                  tooltip: "You can use any unit (%, px, em, etc). px by default if without unit. We recommend minimum height of 400px."
                                },
                                {
                                  type: 'textField',
                                  id: nanoid(),
                                  label: "Min Height",
                                  width: 85,
                                  hideLabel: true,
                                  propertyName: "dimensions.minHeight",
                                  icon: "minHeightIcon",
                                },
                                {
                                  type: 'textField',
                                  id: nanoid(),
                                  label: "Max Height",
                                  width: 85,
                                  hideLabel: true,
                                  propertyName: "dimensions.maxHeight",
                                  icon: "maxHeightIcon",
                                }
                              ]
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
                        hidden: { _code: 'return  ["text", "link", "ghost"].includes(getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.buttonType));', _mode: 'code', _value: false } as any,
                        parentId: styleRouterId,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [...new DesignerToolbarSettings()
                            .addContainer({
                              id: nanoid(),
                              parentId: styleRouterId,
                              components: getBorderInputs() as any
                            })
                            .addContainer({
                              id: nanoid(),
                              parentId: styleRouterId,
                              components: getCornerInputs() as any
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
                        parentId: styleRouterId,
                        collapsible: 'header',
                        hidden: { _code: 'return  ["text", "link", "ghost"].includes(getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.buttonType));', _mode: 'code', _value: false } as any,
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInput({
                                id: nanoid(),
                                parentId: styleRouterId,
                                label: "Type",
                                jsSetting: false,
                                propertyName: "background.type",
                                inputType: "radio",
                                tooltip: "Select a type of background",
                                buttonGroupOptions: backgroundTypeOptions,
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: styleRouterId,
                                inputs: [{
                                  type: 'colorPicker',
                                  id: nanoid(),
                                  label: "Color",
                                  propertyName: "background.color",
                                  hideLabel: true,
                                  jsSetting: false,
                                }],
                                hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "color";', _mode: 'code', _value: false } as any,
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: styleRouterId,
                                inputs: [{
                                  type: 'multiColorPicker',
                                  id: nanoid(),
                                  propertyName: "background.gradient.colors",
                                  label: "Colors",
                                  jsSetting: false,
                                }
                                ],
                                hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "gradient";', _mode: 'code', _value: false } as any,
                                hideLabel: true,
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: styleRouterId,
                                inputs: [{
                                  type: 'textField',
                                  id: nanoid(),
                                  propertyName: "background.url",
                                  jsSetting: false,
                                  label: "URL",
                                }],
                                hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "url";', _mode: 'code', _value: false } as any,
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: styleRouterId,
                                inputs: [{
                                  type: 'imageUploader',
                                  id: nanoid(),
                                  propertyName: 'background.uploadFile',
                                  label: "Image",
                                  jsSetting: false,
                                }],
                                hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "image";', _mode: 'code', _value: false } as any,
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: styleRouterId,
                                hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "storedFile";', _mode: 'code', _value: false } as any,
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
                                parentId: styleRouterId,
                                inline: true,
                                hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                                inputs: [
                                  {
                                    type: 'customDropdown',
                                    id: nanoid(),
                                    label: "Size",
                                    customTooltip: 'Size of the background image, two space separated values with units e.g "100% 100px"',
                                    hideLabel: true,
                                    propertyName: "background.size",
                                    dropdownOptions: sizeOptions,
                                  },
                                  {
                                    type: 'customDropdown',
                                    id: nanoid(),
                                    label: "Position",
                                    hideLabel: true,
                                    customTooltip: 'Position of the background image, two space separated values with units e.g "5em 100px"',
                                    propertyName: "background.position",
                                    dropdownOptions: positionOptions,
                                  },
                                ]
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: styleRouterId,
                                inputs: [{
                                  type: 'radio',
                                  id: nanoid(),
                                  label: 'Repeat',
                                  hideLabel: true,
                                  propertyName: 'background.repeat',
                                  inputType: 'radio',
                                  buttonGroupOptions: repeatOptions,
                                }],
                                hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
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
                        hidden: { _code: 'return  ["text", "link", "ghost"].includes(getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.buttonType));', _mode: 'code', _value: false } as any,
                        parentId: styleRouterId,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [...new DesignerToolbarSettings()
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: styleRouterId,
                              inline: true,
                              inputs: [
                                {
                                  type: 'numberField',
                                  id: nanoid(),
                                  label: 'Offset X',
                                  hideLabel: true,
                                  width: 80,
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
                            .addSettingsInput({
                              id: nanoid(),
                              inputType: 'textField',
                              propertyName: 'className',
                              label: 'Custom CSS Class',
                            })
                            .toJson()
                          ]
                        }
                      })
                      .toJson()
                  ]
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: appearanceTabId,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'strokeWidth',
                      parentId: appearanceTabId,
                      type: 'numberField',
                      label: 'Stroke Thickness',
                      defaultValue: 0.0,
                      description:
                        'The thickness of the stroke for the elements (bars, lines, etc.) in the chart. Default is 0.0',
                      step: 0.1,
                      jsSetting: true,
                    },
                    {
                      id: nanoid(),
                      propertyName: 'strokeColor',
                      parentId: appearanceTabId,
                      label: 'Stroke Color',
                      allowClear: true,
                      type: 'colorPicker',
                      jsSetting: true,
                      tooltip: 'The color of the stroke / border for the elements (bars, lines, etc.) in the chart. Default is #000000',
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: appearanceTabId,
                  inputs: [
                    {
                      id: nanoid(),
                      type: 'numberField',
                      propertyName: 'tension',
                      parentId: appearanceTabId,
                      label: 'Tension',
                      defaultValue: 0,
                      min: 0,
                      hidden: {
                        _code: 'return getSettingValue(data?.chartType) !== `line`',
                        _mode: 'code',
                        _value: true,
                      } as any,
                      jsSetting: true,
                    }
                  ]
                })
                .toJson(),
            ],
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
                  jsSetting: true,
                })
                .toJson(),
            ],
          },
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
