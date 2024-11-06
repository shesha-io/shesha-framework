import { nanoid } from "@/utils/uuid";
import { DesignerToolbarSettings } from "../../interfaces";

const chartGeneralId = nanoid();
const chartSettingsId = nanoid();
const dataSettingsId = nanoid();
const dataSettingsForUrlId = nanoid();

export const settingsForm = new DesignerToolbarSettings()
  .addCollapsiblePanel({
    id: chartGeneralId,
    propertyName: 'chartGeneral',
    parentId: 'root',
    label: 'General',
    labelAlign: "left",
    expandIconPosition: "start",
    ghost: true,
    collapsible: 'header',
    content: {
      id: nanoid(),
      components:
        [...new DesignerToolbarSettings()
          .addCheckbox({
            id: nanoid(),
            propertyName: 'hidden',
            label: 'Hidden',
            parentId: 'root',
          })
          .addDropdown({
            id: nanoid(),
            propertyName: 'dataMode',
            parentId: 'root',
            label: 'Data Source Type',
            description: 'The type of data source you want to use for the chart. If you select `URL`, you will have to provide a URL endpoint to the data. If you select `Entity Type`, you will have to select an entity type from the list.',
            dataSourceType: 'values',
            values: [
              { id: nanoid(), label: 'URL', value: 'url' },
              { id: nanoid(), label: 'Entity Type', value: 'entityType' }
            ],
            validate: { required: true },
            defaultValue: 'entityType',
          })
          .addNumberField({
            id: nanoid(),
            propertyName: 'height',
            parentId: 'root',
            label: 'Height',
            description: 'The height (px) of the chart. The width will be calculated automatically based on the width. Id not provided, the default height will be used.',
            defaultValue: 0,
            stepNumeric: 1,
            hidden: false,
          })
          .toJson()
        ]
    }
  })
  .addCollapsiblePanel({
    id: chartSettingsId,
    propertyName: 'chartSettings',
    parentId: 'root',
    label: 'Chart Settings',
    labelAlign: "left",
    expandIconPosition: "start",
    ghost: true,
    collapsible: 'header',
    content: {
      id: nanoid(),
      components:
        [...new DesignerToolbarSettings()
          .addDropdown({
            id: nanoid(),
            propertyName: 'chartType',
            parentId: 'root',
            hidden: false,
            label: 'Chart Type',
            dataSourceType: 'values',
            values: [
              { id: nanoid(), label: 'Pie Chart', value: 'pie' },
              { id: nanoid(), label: 'Line Chart', value: 'line' },
              { id: nanoid(), label: 'Bar Chart', value: 'bar' },
              { id: nanoid(), label: 'Polar Area Chart', value: 'polarArea' },
            ],
            validate: { required: true },
            defaultValue: 'line',
          })
          .addDropdown({
            id: nanoid(),
            propertyName: 'simpleOrPivot',
            parentId: 'root',
            hidden: false,
            label: 'Simple / Pivot',
            dataSourceType: 'values',
            values: [
              { id: nanoid(), label: 'Simple', value: 'simple' },
              { id: nanoid(), label: 'Pivot', value: 'pivot' }
            ],
            validate: { required: true },
            defaultValue: 'simple',
          })
          .addCheckbox({
            id: nanoid(),
            propertyName: 'stacked',
            label: 'Stacked',
            parentId: 'root',
            hidden: {
              _code: "return !(getSettingValue(data?.chartType) === `bar` && getSettingValue(data?.simpleOrPivot) === `pivot`)",
              _mode: "code",
              _value: true
            },
            defaultValue: true,
          })
          .addTextField({
            id: nanoid(),
            propertyName: 'title',
            parentId: 'root',
            hidden: {
              _code: "return getSettingValue(data?.showTitle) !== true",
              _mode: "code",
              _value: false
            },
            label: 'Title',
            description: 'The title of the chart (if any)',
            labelAlign: 'right',
          })
          .addCheckbox({
            id: nanoid(),
            propertyName: 'showTitle',
            label: 'Show Title',
            description: 'Show the title of the chart',
            parentId: 'root',
          })
          .addCheckbox({
            id: nanoid(),
            propertyName: 'showLegend',
            label: 'Show Legend',
            description: 'Show the legend of the chart. Legend is the area that shows the color and what it represents.',
            parentId: 'root',
            defaultValue: true,
          })
          .addCheckbox({
            id: nanoid(),
            propertyName: 'showXAxisScale',
            label: 'Show X Axis',
            parentId: 'root',
            defaultValue: true,
          })
          .addCheckbox({
            id: nanoid(),
            propertyName: 'showXAxisTitle',
            label: 'Show X Axis Title',
            parentId: 'root',
            defaultValue: true,
            hidden: {
              _code: "return getSettingValue(data?.showXAxisScale) !== true",
              _mode: "code",
              _value: true
            },
          })
          .addCheckbox({
            id: nanoid(),
            propertyName: 'showYAxisScale',
            label: 'Show Y Axis',
            parentId: 'root',
            defaultValue: true,
          })
          .addCheckbox({
            id: nanoid(),
            propertyName: 'showYAxisTitle',
            label: 'Show Y Axis Title',
            parentId: 'root',
            defaultValue: true,
            hidden: {
              _code: "return getSettingValue(data?.showYAxisScale) !== true",
              _mode: "code",
              _value: true
            }
          })
          .addDropdown({
            id: nanoid(),
            propertyName: 'legendPosition',
            parentId: 'root',
            hidden: {
              _code: "return getSettingValue(data?.showLegend) !== true && getSettingValue(data?.dataMode) === `url`",
              _mode: "code",
              _value: false
            },
            label: 'Legend Position',
            dataSourceType: 'values',
            values: [
              { id: nanoid(), label: 'Top', value: 'top' },
              { id: nanoid(), label: 'Bottom', value: 'bottom' },
              { id: nanoid(), label: 'Left', value: 'left' },
              { id: nanoid(), label: 'Right', value: 'right' },
            ],
            validate: { required: true },
            defaultValue: 'top',
          })
          .addNumberField({
            id: nanoid(),
            propertyName: 'tension',
            parentId: chartSettingsId,
            label: 'Tension',
            defaultValue: 0,
            stepNumeric: 0.1,
            hidden: {
              _code: "return getSettingValue(data?.chartType) !== `line`",
              _mode: "code",
              _value: true
            },
          })
          .addNumberField({
            id: nanoid(),
            propertyName: 'borderWidth',
            parentId: chartSettingsId,
            label: 'Border width',
            defaultValue: 0.0,
            stepNumeric: 0.1,
          })
          .addColorPicker({
            id: nanoid(),
            propertyName: 'strokeColor',
            parentId: 'root',
            label: 'Border Stroke Color',
            defaultValue: '#000000',
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
          .addTextField({
            id: nanoid(),
            propertyName: 'url',
            label: 'URL',
            description: 'The URL you want to use for the chart',
            labelAlign: 'right',
            parentId: 'root',
            hidden: false,
            validate: { required: true },
          })
          .addTextField({
            id: nanoid(),
            propertyName: 'axisProperty',
            label: 'Axis label',
            labelAlign: 'right',
            parentId: 'root',
            hidden: false,
            isDynamic: false,
            description: 'Label for the axis property',
            validate: { required: false },
          })
          .addTextField({
            id: nanoid(),
            propertyName: 'valueProperty',
            label: 'Value axis label',
            labelAlign: 'right',
            parentId: 'root',
            hidden: false,
            isDynamic: false,
            description: 'Label for the value property',
            validate: { required: false },
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
      _value: false
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
            parentId: 'root',
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
            parentId: 'root',
            hidden: false,
            isDynamic: false,
            description: 'The property to be used on the x-axis.',
            validate: { required: true },
            modelType: '{{data.entityType}}',
            autoFillProps: false,
            settingsValidationErrors: [],
          })
          .addCheckbox({
            id: nanoid(),
            propertyName: 'isAxisTimeSeries',
            label: 'Is Axis Property Time Series?',
            description: 'If the x-axis is a time series, check this box.',
            parentId: 'root',
            defaultValue: false,
            validate: { required: true },
          })
          .addDropdown({
            id: nanoid(),
            propertyName: 'timeSeriesFormat',
            parentId: 'root',
            label: 'Time Series Format',
            dataSourceType: 'values',
            values: [
              { id: nanoid(), label: 'Day', value: 'day' },
              { id: nanoid(), label: 'Month', value: 'month' },
              { id: nanoid(), label: 'Year', value: 'year' },
              { id: nanoid(), label: 'Day-Month', value: 'day-month' },
              { id: nanoid(), label: 'Day-Month-Year', value: 'day-month-year' },
              { id: nanoid(), label: 'Month-Year', value: 'month-year' },
            ],
            validate: { required: true },
            defaultValue: 'day-month-year',
            hidden: {
              _code: "return getSettingValue(data?.isAxisTimeSeries) !== true",
              _mode: "code",
              _value: true
            },
          })
          .addPropertyAutocomplete({
            id: nanoid(),
            propertyName: 'valueProperty',
            label: 'Value Property',
            labelAlign: 'right',
            parentId: 'root',
            hidden: false,
            isDynamic: false,
            description: 'This is the property that will be used to calculate the data and hence show on the depenedent y-axis.',
            validate: { required: true },
            modelType: '{{data.entityType}}',
            autoFillProps: false,
            settingsValidationErrors: [],
          })
          .addPropertyAutocomplete({
            id: nanoid(),
            propertyName: 'legendProperty',
            label: 'Legend Property',
            labelAlign: 'right',
            parentId: 'root',
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
            parentId: 'root',
            hidden: false,
            isDynamic: false,
            description: 'The properties you want to order the data by. Use the propeties that you have selected for axis, value (and legend).',
            modelType: '{{data.entityType}}',
            autoFillProps: false,
            settingsValidationErrors: [],
          })
          .addDropdown({
            id: nanoid(),
            propertyName: 'orderDirection',
            parentId: 'root',
            label: 'Order Direction',
            dataSourceType: 'values',
            values: [
              { id: nanoid(), label: 'Ascending', value: 'asc' },
              { id: nanoid(), label: 'Descending', value: 'desc' },
            ],
            validate: { required: true },
            defaultValue: 'asc',
            hidden: {
              _code: "return !(getSettingValue(data?.orderBy))",
              _mode: "code",
              _value: true
            },
          })
          .addCheckbox({
            id: nanoid(),
            propertyName: 'allowFilter',
            label: 'Allow Chart Filter',
            parentId: 'root',
            description: 'Allow users to filter the chart data directly from the chart.',
            defaultValue: true,
          })
          .addPropertyAutocomplete({
            id: nanoid(),
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
            hidden: {
              _code: "return !(getSettingValue(data?.allowFilter))",
              _mode: "code",
              _value: true
            },
          })
          .addDropdown({
            id: nanoid(),
            propertyName: 'aggregationMethod',
            parentId: 'root',
            label: 'Aggregation Method',
            dataSourceType: 'values',
            values: [
              { id: nanoid(), label: 'Sum', value: 'sum' },
              { id: nanoid(), label: 'Count', value: 'count' },
              { id: nanoid(), label: 'Average', value: 'average' },
              { id: nanoid(), label: 'Min', value: 'min' },
              { id: nanoid(), label: 'Max', value: 'max' },
            ],
            validate: { required: true },
            defaultValue: 'count',
          })
          .addQueryBuilder({
            id: 'n4enebtmhFgvkP5ukQK1f',
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
  .toJson();
