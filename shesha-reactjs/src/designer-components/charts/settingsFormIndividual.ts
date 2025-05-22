import { DesignerToolbarSettings } from '@/index';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';

export const getSettings = (data: any) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const appearanceTabId = nanoid();
  const dataTabId = nanoid();
  const dataSettingsId = nanoid();
  const dataSettingsForUrlId = nanoid();
  const securityTabId = nanoid();

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
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'hidden',
                  parentId: 'root',
                  label: 'Hide',
                  inputType: 'switch',
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
                        .addSettingsInput({
                          id: nanoid(),
                          propertyName: 'simpleOrPivot',
                          parentId: commonTabId,
                          hidden: false,
                          label: 'Simple / Pivot',
                          inputType: 'dropdown',
                          allowClear: true,
                          dropdownOptions: [
                            { label: 'Simple', value: 'simple' },
                            { label: 'Pivot', value: 'pivot' },
                          ],
                          validate: { required: true },
                          defaultValue: 'simple',
                        })
                        .addSettingsInput({
                          id: nanoid(),
                          propertyName: 'dataMode',
                          parentId: commonTabId,
                          label: 'Data Source Type',
                          description:
                            'The type of data source you want to use for the chart. If you select `URL`, you will have to provide a URL endpoint to the data. If you select `Entity Type`, you will have to select an entity type from the list.',
                          inputType: 'dropdown',
                          allowClear: true,
                          dropdownOptions: [
                            { label: 'URL', value: 'url' },
                            { label: 'Entity Type', value: 'entityType' },
                          ],
                          validate: { required: true },
                          defaultValue: 'entityType',
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
                                inputType: 'textField',
                                label: 'URL',
                                description: 'The URL you want to use for the chart',
                                labelAlign: 'right',
                                parentId: dataSettingsForUrlId,
                                hidden: false,
                                validate: { required: true },
                              })
                              .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'axisProperty',
                                label: 'Axis label',
                                inputType: 'textField',
                                labelAlign: 'right',
                                parentId: dataSettingsForUrlId,
                                isDynamic: false,
                                description: 'Label for the axis property',
                                validate: { required: false },
                                hidden: {
                                  _code:
                                    'return getSettingValue(data?.chartType) === `pie` || getSettingValue(data?.chartType) === `polarArea`',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                              })
                              .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'valueProperty',
                                label: 'Value axis label',
                                inputType: 'textField',
                                labelAlign: 'right',
                                parentId: dataSettingsForUrlId,
                                isDynamic: false,
                                description: 'Label for the value property',
                                validate: { required: false },
                                hidden: {
                                  _code:
                                    'return getSettingValue(data?.chartType) === `pie` || getSettingValue(data?.chartType) === `polarArea`',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                              })
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
                                inline: true,
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
                                    width: '100%',
                                  },
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
                                    description: 'If the x-axis is a time series, check this box.',
                                    parentId: dataSettingsId,
                                    defaultValue: false,
                                    validate: { required: true },
                                    width: '100%',
                                  }
                                ]
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: dataSettingsId,
                                inline: true,
                                hidden: {
                                  _code: 'return getSettingValue(data?.isAxisTimeSeries) !== true',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                inputs: [
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
                                    defaultValue: 'day-month-year',
                                    width: '100%',
                                  },
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
                                    propertyName: 'legendProperty',
                                    label: 'Legend Property',
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
                                  },
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
                      .addSettingsInput({
                        id: nanoid(),
                        inputType: 'textField',
                        propertyName: 'title',
                        parentId: commonTabId,
                        hidden: {
                          _code: 'return getSettingValue(data?.showTitle) !== true',
                          _mode: 'code',
                          _value: false,
                        },
                        label: 'Title',
                        description: 'The title of the chart (if any)',
                        labelAlign: 'right',
                      })
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
                          },
                          {
                            id: nanoid(),
                            type: 'switch',
                            propertyName: 'showLegend',
                            label: 'Show Legend',
                            description:
                              'Show the legend of the chart. Legend is the area that shows the color and what it represents.',
                            parentId: commonTabId,
                            defaultValue: false,
                          },
                        ],
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'legendPosition',
                        parentId: commonTabId,
                        hidden: {
                          _code: 'return getSettingValue(data?.showLegend) !== true',
                          _mode: 'code',
                          _value: true,
                        },
                        label: 'Legend Position',
                        inputType: 'dropdown',
                        allowClear: true,
                        dropdownOptions: [
                          { label: 'Top', value: 'top' },
                          { label: 'Bottom', value: 'bottom' },
                          { label: 'Left', value: 'left' },
                          { label: 'Right', value: 'right' },
                        ],
                        validate: { required: true },
                        defaultValue: 'top',
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: commonTabId,
                        inputs: [
                          {
                            id: nanoid(),
                            type: 'switch',
                            propertyName: 'showXAxisScale',
                            label: 'Show X Axis',
                            parentId: commonTabId,
                            defaultValue: true,
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
                          },
                        ],
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: commonTabId,
                        inputs: [
                          {
                            id: nanoid(),
                            type: 'switch',
                            propertyName: 'showYAxisScale',
                            label: 'Show Y Axis',
                            parentId: commonTabId,
                            defaultValue: true,
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
                          },
                        ],
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
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'dataMode',
                  parentId: 'root',
                  label: 'Data Source Type',
                  description:
                    'The type of data source you want to use for the chart. If you select `URL`, you will have to provide a URL endpoint to the data. If you select `Entity Type`, you will have to select an entity type from the list.',
                  inputType: 'dropdown',
                  allowClear: true,
                  dropdownOptions: [
                    { label: 'URL', value: 'url' },
                    { label: 'Entity Type', value: 'entityType' },
                  ],
                  validate: { required: true },
                  defaultValue: 'entityType',
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
                        inputType: 'textField',
                        label: 'URL',
                        description: 'The URL you want to use for the chart',
                        labelAlign: 'right',
                        parentId: dataTabId,
                        hidden: false,
                        validate: { required: true },
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'axisProperty',
                        label: 'Axis label',
                        inputType: 'textField',
                        labelAlign: 'right',
                        parentId: dataTabId,
                        isDynamic: false,
                        description: 'Label for the axis property',
                        validate: { required: false },
                        hidden: {
                          _code:
                            'return getSettingValue(data?.chartType) === `pie` || getSettingValue(data?.chartType) === `polarArea`',
                          _mode: 'code',
                          _value: false,
                        } as any,
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'valueProperty',
                        label: 'Value axis label',
                        inputType: 'textField',
                        labelAlign: 'right',
                        parentId: dataTabId,
                        isDynamic: false,
                        description: 'Label for the value property',
                        validate: { required: false },
                        hidden: {
                          _code:
                            'return getSettingValue(data?.chartType) === `pie` || getSettingValue(data?.chartType) === `polarArea`',
                          _mode: 'code',
                          _value: false,
                        } as any,
                      })
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
                        inline: true,
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
                            width: '100%',
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
                              _value: false,
                            } as any,
                            autoFillProps: false,
                            settingsValidationErrors: [],
                            width: '100%',
                          },
                        ],
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
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
                            description: 'If the x-axis is a time series, check this box.',
                            parentId: dataTabId,
                            defaultValue: false,
                            validate: { required: true },
                            width: '100%',
                          },
                        ],
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        inline: true,
                        hidden: {
                          _code: 'return getSettingValue(data?.isAxisTimeSeries) !== true',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        inputs: [
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
                            defaultValue: 'day-month-year',
                            width: '100%',
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
                              _value: false,
                            } as any,
                            autoFillProps: false,
                            settingsValidationErrors: [],
                            width: '100%',
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
                            propertyName: 'legendProperty',
                            label: 'Legend Property',
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
                              _value: false,
                            } as any,
                            autoFillProps: false,
                            settingsValidationErrors: [],
                            width: '100%',
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
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'orderDirection',
                        parentId: dataTabId,
                        label: 'Order Direction',
                        inputType: 'dropdown',
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
                            propertyName: 'filters',
                            label: 'Entity filter',
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
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: appearanceTabId,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'width',
                      parentId: 'root',
                      label: 'Width',
                      description:
                        'The width (px) of the chart. If not provided, the default width will be used. Minimum width is 300px. For responsiveness, setting the width will automatically set the height to proportionate value.',
                      type: 'numberField',
                      step: 1,
                      min: 300,
                    },
                    {
                      id: nanoid(),
                      propertyName: 'height',
                      parentId: 'root',
                      label: 'Height',
                      description:
                        'The height (px) of the chart. If not provided, the default height will be used. Minimum height is 200px. For responsiveness, setting the height will automatically set the width to proportionate value.',
                      type: 'numberField',
                      step: 1,
                      min: 200,
                    },
                  ],
                })
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'switch',
                  propertyName: 'showBorder',
                  label: 'Show Border',
                  parentId: 'root',
                  defaultValue: true,
                })
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'switch',
                  propertyName: 'isDoughnut',
                  label: 'Is Doughnut',
                  parentId: appearanceTabId,
                  hidden: {
                    _code: 'return getSettingValue(data?.chartType) !== `pie`',
                    _mode: 'code',
                    _value: true,
                  },
                  defaultValue: false,
                })
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'switch',
                  propertyName: 'stacked',
                  label: 'Stacked',
                  parentId: appearanceTabId,
                  hidden: {
                    _code:
                      'return !(getSettingValue(data?.chartType) === `bar` && getSettingValue(data?.simpleOrPivot) === `pivot`)',
                    _mode: 'code',
                    _value: true,
                  },
                  defaultValue: true,
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
                      label: 'Stroke width',
                      defaultValue: 0.0,
                      description:
                        'The width of the stroke for the elements (bars, lines, etc.) in the c in the chart. Default is 0.0',
                      step: 0.1,
                    },
                    {
                      id: nanoid(),
                      propertyName: 'strokeColor',
                      parentId: appearanceTabId,
                      label: 'Stroke Color',
                      allowClear: true,
                      type: 'colorPicker',
                    },
                  ],
                })
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'numberField',
                  propertyName: 'tension',
                  parentId: appearanceTabId,
                  label: 'Tension',
                  defaultValue: 0,
                  min: 0,
                  hidden: {
                    _code: 'return getSettingValue(data?.chartType) !== `line`',
                    _mode: 'code',
                    _value: true,
                  },
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
