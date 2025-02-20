import { DesignerToolbarSettings, IPropertySetting } from "@/index";
import { nanoid } from "@/utils/uuid";
import { FormLayout } from "antd/lib/form/Form";

export const getSettings = (data: any) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const appearanceTabId = nanoid();
  const dataTabId = nanoid();
  const chartSettingsId = nanoid();
  const dataSettingsId = nanoid();
  const dataSettingsForUrlId = nanoid();

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
            components: [...new DesignerToolbarSettings()
              .addContextPropertyAutocomplete({
                id: propertyNameId,
                propertyName: "propertyName",
                parentId: commonTabId,
                label: "Property Name",
                size: "small",
                validate: {
                  "required": true
                },
                styledLabel: true,
                jsSetting: true,
              })
              .addLabelConfigurator({
                id: nanoid(),
                propertyName: 'hideLabel',
                label: 'Label',
                parentId: commonTabId,
                hideLabel: true,
              })
              .addSettingsInput({
                id: nanoid(),
                propertyName: 'dataMode',
                parentId: 'root',
                label: 'Data Source Type',
                description: 'The type of data source you want to use for the chart. If you select `URL`, you will have to provide a URL endpoint to the data. If you select `Entity Type`, you will have to select an entity type from the list.',
                inputType: 'dropdown',
                dropdownOptions: [
                  { label: 'URL', value: 'url' },
                  { label: 'Entity Type', value: 'entityType' }
                ],
                validate: { required: true },
                defaultValue: 'entityType',
              })
              .toJson()
            ]
          },
          {
            key: 'appearance',
            title: 'Appearance',
            id: appearanceTabId,
            components: [...new DesignerToolbarSettings()
              .addCollapsiblePanel({
                id: chartSettingsId,
                propertyName: 'chartSettings',
                parentId: appearanceTabId,
                label: 'Chart Settings',
                labelAlign: "left",
                expandIconPosition: "start",
                ghost: true,
                collapsible: 'header',
                content: {
                  id: nanoid(),
                  components:
                    [...new DesignerToolbarSettings()
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'chartType',
                        parentId: appearanceTabId,
                        hidden: false,
                        label: 'Chart Type',
                        inputType: 'dropdown',
                        dropdownOptions: [
                          { label: 'Pie Chart', value: 'pie' },
                          { label: 'Line Chart', value: 'line' },
                          { label: 'Bar Chart', value: 'bar' },
                          { label: 'Polar Area Chart', value: 'polarArea' },
                        ],
                        validate: { required: true },
                        defaultValue: 'line',
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        inputType: 'switch',
                        propertyName: 'isDoughnut',
                        label: 'Is Doughnut',
                        parentId: appearanceTabId,
                        // hidden: {
                        //   _code: "return getSettingValue(data?.chartType) !== `pie`",
                        //   _mode: "code",
                        //   _value: true
                        // },
                        defaultValue: false,
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'simpleOrPivot',
                        parentId: appearanceTabId,
                        hidden: false,
                        label: 'Simple / Pivot',
                        inputType: 'dropdown',
                        dropdownOptions: [
                          { label: 'Simple', value: 'simple' },
                          { label: 'Pivot', value: 'pivot' }
                        ],
                        validate: { required: true },
                        defaultValue: 'simple',
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        inputType: 'switch',
                        propertyName: 'stacked',
                        label: 'Stacked',
                        parentId: appearanceTabId,
                        // hidden: {
                        //   _code: "return !(getSettingValue(data?.chartType) === `bar` && getSettingValue(data?.simpleOrPivot) === `pivot`)",
                        //   _mode: "code",
                        //   _value: true
                        // },
                        defaultValue: true,
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        inputType: 'text',
                        propertyName: 'title',
                        parentId: appearanceTabId,
                        // hidden: {
                        //   _code: "return getSettingValue(data?.showTitle) !== true",
                        //   _mode: "code",
                        //   _value: false
                        // },
                        label: 'Title',
                        description: 'The title of the chart (if any)',
                        labelAlign: 'right',
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        inputType: 'switch',
                        propertyName: 'showTitle',
                        label: 'Show Title',
                        description: 'Show the title of the chart',
                        parentId: appearanceTabId,
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        inputType: 'switch',
                        propertyName: 'showLegend',
                        label: 'Show Legend',
                        description: 'Show the legend of the chart. Legend is the area that shows the color and what it represents.',
                        parentId: appearanceTabId,
                        defaultValue: true,
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'legendPosition',
                        parentId: appearanceTabId,
                        hidden: {
                          _code: "return getSettingValue(data?.showLegend) !== true",
                          _mode: "code",
                          _value: true
                        },
                        label: 'Legend Position',
                        inputType: 'dropdown',
                        dropdownOptions: [
                          { label: 'Top', value: 'top' },
                          { label: 'Bottom', value: 'bottom' },
                          { label: 'Left', value: 'left' },
                          { label: 'Right', value: 'right' },
                        ],
                        validate: { required: true },
                        defaultValue: 'top',
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        inputType: 'switch',
                        propertyName: 'showXAxisScale',
                        label: 'Show X Axis',
                        parentId: appearanceTabId,
                        defaultValue: true,
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        inputType: 'switch',
                        propertyName: 'showXAxisTitle',
                        label: 'Show X Axis Title',
                        parentId: appearanceTabId,
                        defaultValue: true,
                        // hidden: {
                        //   _code: "return getSettingValue(data?.showXAxisScale) !== true",
                        //   _mode: "code",
                        //   _value: true
                        // },
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        inputType: 'switch',
                        propertyName: 'showYAxisScale',
                        label: 'Show Y Axis',
                        parentId: appearanceTabId,
                        defaultValue: true,
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        inputType: 'switch',
                        propertyName: 'showYAxisTitle',
                        label: 'Show Y Axis Title',
                        parentId: appearanceTabId,
                        defaultValue: true,
                        // hidden: {
                        //   _code: "return getSettingValue(data?.showYAxisScale) !== true",
                        //   _mode: "code",
                        //   _value: true
                        // }
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        inputType: 'number',
                        propertyName: 'tension',
                        parentId: chartSettingsId,
                        label: 'Tension',
                        defaultValue: 0,
                        min: 0,
                        // hidden: {
                        //   _code: "return getSettingValue(data?.chartType) !== `line`",
                        //   _mode: "code",
                        //   _value: true
                        // },
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        inputType: 'number',
                        propertyName: 'strokeWidth',
                        parentId: chartSettingsId,
                        label: 'Stroke width',
                        defaultValue: 0.0,
                        description: 'The width of the stroke for the elements (bars, lines, etc.) in the c in the chart. Default is 0.0',
                        // stepNumeric: 0.1,
                        min: 0,
                        max: 10,
                      })
                      .addColorPicker({
                        id: nanoid(),
                        propertyName: 'strokeColor',
                        parentId: 'root',
                        label: 'Stroke Color',
                        allowClear: true,
                      })
                      .toJson()
                    ]
                }
              })
              .addCollapsiblePanel({
                id: dataSettingsForUrlId,
                propertyName: 'dataSettingsForUrl',
                parentId: 'root',
                label: 'Data Settings (URL)',
                labelAlign: "left",
                expandIconPosition: "start",
                ghost: true,
                collapsible: 'header',
                hidden: {
                  _code: "return getSettingValue(data?.dataMode) !== `url`",
                  _mode: "code",
                  _value: true
                },
                content: {
                  id: nanoid(),
                  components:
                    [...new DesignerToolbarSettings()
                      .addSettingsInput({
                        id: nanoid(),
                        inputType: 'text',
                        propertyName: 'url',
                        label: 'URL',
                        description: 'The URL you want to use for the chart',
                        labelAlign: 'right',
                        parentId: 'root',
                        hidden: false,
                        validate: { required: true },
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        inputType: 'text',
                        propertyName: 'axisProperty',
                        label: 'Axis label',
                        labelAlign: 'right',
                        parentId: 'root',
                        isDynamic: false,
                        description: 'Label for the axis property',
                        validate: { required: false },
                        hidden: {
                          _code: "return getSettingValue(data?.chartType) === `pie` || getSettingValue(data?.chartType) === `polarArea`",
                          _mode: "code",
                          _value: true
                        },
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        inputType: 'text',
                        propertyName: 'valueProperty',
                        label: 'Value axis label',
                        labelAlign: 'right',
                        parentId: 'root',
                        isDynamic: false,
                        description: 'Label for the value property',
                        validate: { required: false },
                        // hidden: {
                        //   _code: "return getSettingValue(data?.chartType) === `pie` || getSettingValue(data?.chartType) === `polarArea`",
                        //   _mode: "code",
                        //   _value: true
                        // },
                      })
                      .toJson()
                    ]
                }
              })
              .addCollapsiblePanel({
                id: dataSettingsId,
                propertyName: 'dataSettings',
                parentId: 'root',
                label: 'Data Settings',
                labelAlign: "left",
                expandIconPosition: "start",
                ghost: true,
                collapsible: 'header',
                hidden: {
                  _code: "return getSettingValue(data?.dataMode) === `url`",
                  _mode: "code",
                  _value: true
                },
                content: {
                  id: nanoid(),
                  components:
                    [...new DesignerToolbarSettings()
                      .addSettingsInput({
                        id: nanoid(),
                        inputType: 'autocomplete',
                        propertyName: 'entityType',
                        label: 'Entity Type',
                        description: 'The entity type you want to use for the chart.',
                        labelAlign: 'right',
                        parentId: 'root',
                        hidden: false,
                        dataSourceType: 'url',
                        validate: { required: true },
                        dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
                        settingsValidationErrors: [],
                        useRawValues: true,
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        inputType: 'propertyAutocomplete',
                        propertyName: 'axisProperty',
                        label: 'Axis Property',
                        labelAlign: 'right',
                        parentId: 'root',
                        isDynamic: false,
                        description: 'The property to be used on the x-axis.',
                        validate: { required: true },
                        modelType: '{{data.entityType}}',
                        autoFillProps: false,
                        settingsValidationErrors: [],
                        // hidden: {
                        //   _code: "return getSettingValue(data?.dataMode) === `url`",
                        //   _mode: "code",
                        //   _value: true
                        // },
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        inputType: 'switch',
                        propertyName: 'isAxisTimeSeries',
                        label: 'Is Axis Property Time Series?',
                        description: 'If the x-axis is a time series, check this box.',
                        parentId: 'root',
                        defaultValue: false,
                        validate: { required: true },
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'timeSeriesFormat',
                        parentId: 'root',
                        label: 'Time Series Format',
                        inputType: 'dropdown',
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
                        // hidden: {
                        //   _code: "return getSettingValue(data?.isAxisTimeSeries) !== true",
                        //   _mode: "code",
                        //   _value: false
                        // },
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        inputType: 'propertyAutocomplete',
                        propertyName: 'valueProperty',
                        label: 'Value Property',
                        labelAlign: 'right',
                        parentId: 'root',
                        isDynamic: false,
                        description: 'This is the property that will be used to calculate the data and hence show on the depenedent y-axis.',
                        validate: { required: true },
                        modelType: '{{data.entityType}}',
                        autoFillProps: false,
                        settingsValidationErrors: [],
                        // hidden: {
                        //   _code: "return getSettingValue(data?.dataMode) === `url`",
                        //   _mode: "code",
                        //   _value: false
                        // },
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        inputType: 'propertyAutocomplete',
                        propertyName: 'legendProperty',
                        label: 'Legend Property',
                        labelAlign: 'right',
                        parentId: 'root',
                        // hidden: {
                        //   _code: "return getSettingValue(data?.simpleOrPivot) === `simple`",
                        //   _mode: "code",
                        //   _value: false
                        // },
                        isDynamic: false,
                        description: 'The properties you want to use on the Legend. This is the property that will be used to group the data for Pivot Charts.',
                        validate: { required: true },
                        modelType: '{{data.entityType}}',
                        autoFillProps: false,
                        settingsValidationErrors: [],
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        inputType: 'propertyAutocomplete',
                        propertyName: 'orderBy',
                        label: 'Order By',
                        labelAlign: 'right',
                        parentId: 'root',
                        hidden: false,
                        isDynamic: false,
                        description: 'The properties you want to order the data by. Use the propeties that you have selected for axis, value (and legend).',
                        modelType: '{{data.entityType}}',
                        autoFillProps: false,
                        settingsValidationErrors: [],
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'orderDirection',
                        parentId: 'root',
                        label: 'Order Direction',
                        inputType: 'dropdown',
                        dropdownOptions: [
                          { label: 'Ascending', value: 'asc' },
                          { label: 'Descending', value: 'desc' },
                        ],
                        validate: { required: true },
                        defaultValue: 'asc',
                        // hidden: {
                        //   _code: "return !(getSettingValue(data?.orderBy))",
                        //   _mode: "code",
                        //   _value: true
                        // },
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        inputType: 'switch',
                        propertyName: 'allowFilter',
                        label: 'Allow Chart Filter',
                        parentId: 'root',
                        description: 'Allow users to filter the chart data directly from the chart.',
                        defaultValue: false,
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        inputType: 'propertyAutocomplete',
                        propertyName: 'filterProperties',
                        label: 'Filter Property list',
                        labelAlign: 'right',
                        mode: "multiple",
                        parentId: 'root',
                        isDynamic: true,
                        description: 'The properties you want users to filter by. Use the propeties that you have selected for axis, value (and legend).',
                        modelType: '{{data.entityType}}',
                        autoFillProps: false,
                        settingsValidationErrors: [],
                        // hidden: {
                        //   _code: "return !(getSettingValue(data?.allowFilter))",
                        //   _mode: "code",
                        //   _value: true
                        // },
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'aggregationMethod',
                        parentId: 'root',
                        label: 'Aggregation Method',
                        inputType: 'dropdown',
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
                      .addSettingsInput({
                        id: 'n4enebtmhFgvkP5ukQK1f',
                        inputType: 'queryBuilder',
                        propertyName: 'filters',
                        label: 'Entity filter',
                        labelAlign: 'right',
                        parentId: 'root',
                        hidden: false,
                        isDynamic: false,
                        validate: {},
                        settingsValidationErrors: [],
                        modelType: '{{data.entityType}}',
                        fieldsUnavailableHint: 'Please select `Entity Type` to be able to configure this filter.',
                      })
                      .toJson()
                    ]
                }
              })
              .toJson()
            ]
          },
          {
            key: 'data-3',
            title: 'Data',
            id: dataTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addCollapsiblePanel({
                  id: dataSettingsForUrlId,
                  propertyName: 'dataSettingsForUrl',
                  parentId: dataTabId,
                  label: 'Data Settings (URL)',
                  labelAlign: "left",
                  expandIconPosition: "start",
                  ghost: true,
                  collapsible: 'header',
                  hidden: {
                    _code: "return getSettingValue(data?.dataMode) !== `url`",
                    _mode: "code",
                    _value: true
                  },
                  content: {
                    id: nanoid(),
                    components:
                      [...new DesignerToolbarSettings()
                        .addTextField({
                          id: nanoid(),
                          propertyName: 'url',
                          label: 'URL',
                          description: 'The URL you want to use for the chart',
                          labelAlign: 'right',
                          parentId: dataTabId,
                          hidden: false,
                          validate: { required: true },
                        })
                        .addTextField({
                          id: nanoid(),
                          propertyName: 'axisProperty',
                          label: 'Axis label',
                          labelAlign: 'right',
                          parentId: dataTabId,
                          isDynamic: false,
                          description: 'Label for the axis property',
                          validate: { required: false },
                          hidden: {
                            _code: "return getSettingValue(data?.chartType) === `pie` || getSettingValue(data?.chartType) === `polarArea`",
                            _mode: "code",
                            _value: true
                          },
                        })
                        .addTextField({
                          id: nanoid(),
                          propertyName: 'valueProperty',
                          label: 'Value axis label',
                          labelAlign: 'right',
                          parentId: dataTabId,
                          isDynamic: false,
                          description: 'Label for the value property',
                          validate: { required: false },
                          hidden: {
                            _code: "return getSettingValue(data?.chartType) === `pie` || getSettingValue(data?.chartType) === `polarArea`",
                            _mode: "code",
                            _value: true
                          },
                        })
                        .toJson()
                      ]
                  }
                })
                .addCollapsiblePanel({
                  id: dataSettingsId,
                  propertyName: 'dataSettings',
                  parentId: dataTabId,
                  label: 'Data Settings',
                  labelAlign: "left",
                  expandIconPosition: "start",
                  ghost: true,
                  collapsible: 'header',
                  hidden: {
                    _code: "return getSettingValue(data?.dataMode) === `url`",
                    _mode: "code",
                    _value: true
                  },
                  content: {
                    id: nanoid(),
                    components:
                      [...new DesignerToolbarSettings()
                        .addAutocomplete({
                          id: nanoid(),
                          propertyName: 'entityType',
                          label: 'Entity Type',
                          description: 'The entity type you want to use for the chart.',
                          labelAlign: 'right',
                          parentId: dataTabId,
                          hidden: false,
                          dataSourceType: 'url',
                          validate: { required: true },
                          dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
                          settingsValidationErrors: [],
                          useRawValues: true,
                          queryParams: null,
                        })
                        .addPropertyAutocomplete({
                          id: nanoid(),
                          propertyName: 'axisProperty',
                          label: 'Axis Property',
                          labelAlign: 'right',
                          parentId: dataTabId,
                          isDynamic: false,
                          description: 'The property to be used on the x-axis.',
                          validate: { required: true },
                          modelType: '{{data.entityType}}',
                          autoFillProps: false,
                          settingsValidationErrors: [],
                          hidden: {
                            _code: "return getSettingValue(data?.dataMode) === `url`",
                            _mode: "code",
                            _value: true
                          },
                        })
                        .addSettingsInput({
                          id: nanoid(),
                          inputType: 'switch',
                          propertyName: 'isAxisTimeSeries',
                          label: 'Is Axis Property Time Series?',
                          description: 'If the x-axis is a time series, check this box.',
                          parentId: dataTabId,
                          defaultValue: false,
                          validate: { required: true },
                        })
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: dataTabId,
                          inline: true,
                          // hidden: {
                          //   _code: "return !getSettingValue(data?.isAxisTimeSeries);",
                          //   _mode: "code",
                          //   _value: true
                          // } as any,
                          readOnly: false,
                          inputs: [
                            {
                              id: nanoid(),
                              propertyName: 'timeSeriesFormat',
                              parentId: dataTabId,
                              label: 'Time Series Format',
                              type: 'dropdown',
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
                            }
                          ]
                        })
                        .addPropertyAutocomplete({
                          id: nanoid(),
                          propertyName: 'valueProperty',
                          label: 'Value Property',
                          labelAlign: 'right',
                          parentId: dataTabId,
                          isDynamic: false,
                          description: 'This is the property that will be used to calculate the data and hence show on the depenedent y-axis.',
                          validate: { required: true },
                          modelType: '{{data.entityType}}',
                          autoFillProps: false,
                          settingsValidationErrors: [],
                          hidden: {
                            _code: "return getSettingValue(data?.dataMode) === `url`",
                            _mode: "code",
                            _value: true
                          },
                        })
                        .addPropertyAutocomplete({
                          id: nanoid(),
                          propertyName: 'legendProperty',
                          label: 'Legend Property',
                          labelAlign: 'right',
                          parentId: dataTabId,
                          hidden: {
                            _code: "return getSettingValue(data?.simpleOrPivot) === `simple`",
                            _mode: "code",
                            _value: false
                          },
                          isDynamic: false,
                          description: 'The properties you want to use on the Legend. This is the property that will be used to group the data for Pivot Charts.',
                          validate: { required: true },
                          modelType: '{{data.entityType}}',
                          autoFillProps: false,
                          settingsValidationErrors: [],
                        })
                        .addPropertyAutocomplete({
                          id: nanoid(),
                          propertyName: 'orderBy',
                          label: 'Order By',
                          labelAlign: 'right',
                          parentId: dataTabId,
                          hidden: false,
                          isDynamic: false,
                          description: 'The properties you want to order the data by. Use the propeties that you have selected for axis, value (and legend).',
                          modelType: '{{data.entityType}}',
                          autoFillProps: false,
                          settingsValidationErrors: [],
                        })
                        .addSettingsInput({
                          id: nanoid(),
                          propertyName: 'orderDirection',
                          parentId: dataTabId,
                          label: 'Order Direction',
                          inputType: 'dropdown',
                          dropdownOptions: [
                            { label: 'Ascending', value: 'asc' },
                            { label: 'Descending', value: 'desc' },
                          ],
                          validate: { required: true },
                          defaultValue: 'asc',
                          // hidden: {
                          //   _code: "return !(getSettingValue(data?.orderBy))",
                          //   _mode: "code",
                          //   _value: true
                          // },
                        })
                        .addCheckbox({
                          id: nanoid(),
                          propertyName: 'allowFilter',
                          label: 'Allow Chart Filter',
                          parentId: dataTabId,
                          description: 'Allow users to filter the chart data directly from the chart.',
                          defaultValue: false,
                        })
                        .addPropertyAutocomplete({
                          id: nanoid(),
                          propertyName: 'filterProperties',
                          label: 'Filter Property list',
                          labelAlign: 'right',
                          mode: "multiple",
                          parentId: dataTabId,
                          isDynamic: true,
                          description: 'The properties you want users to filter by. Use the propeties that you have selected for axis, value (and legend).',
                          modelType: '{{data.entityType}}',
                          autoFillProps: false,
                          settingsValidationErrors: [],
                          hidden: {
                            _code: "return !(getSettingValue(data?.allowFilter))",
                            _mode: "code",
                            _value: true
                          },
                        })
                        .addSettingsInput({
                          id: nanoid(),
                          propertyName: 'aggregationMethod',
                          parentId: dataTabId,
                          label: 'Aggregation Method',
                          inputType: 'dropdown',
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
                        .addQueryBuilder({
                          id: 'n4enebtmhFgvkP5ukQK1f',
                          propertyName: 'filters',
                          label: 'Entity filter',
                          labelAlign: 'right',
                          parentId: dataTabId,
                          hidden: false,
                          isDynamic: false,
                          validate: {},
                          settingsValidationErrors: [],
                          modelType: '{{data.entityType}}',
                          fieldsUnavailableHint: 'Please select `Entity Type` to be able to configure this filter.',
                        })
                        .toJson()
                      ]
                  }
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