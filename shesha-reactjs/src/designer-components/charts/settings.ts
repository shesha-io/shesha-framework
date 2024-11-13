import { nanoid } from "@/utils/uuid";
import { DesignerToolbarSettings } from "../../interfaces";

const chartGeneralId = nanoid();
const chartSettingsId = nanoid();
const dataSettingsId = nanoid();

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
          }).toJson()
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
    content: {
      id: nanoid(),
      components:
        [...new DesignerToolbarSettings()
          .addAutocomplete({
            id: nanoid(),
            propertyName: 'entityType',
            label: 'Entity type',
            description: 'The entity type you want to use for the chart',
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
            label: 'Axis property',
            labelAlign: 'right',
            parentId: 'root',
            hidden: false,
            isDynamic: false,
            description: 'The property to be used on the axis',
            validate: { required: true },
            modelType: '{{data.entityType}}',
            autoFillProps: false,
            settingsValidationErrors: [],
          })
          .addPropertyAutocomplete({
            id: nanoid(),
            propertyName: 'valueProperty',
            label: 'Value property',
            labelAlign: 'right',
            parentId: 'root',
            hidden: false,
            isDynamic: false,
            description: 'This is the property that will be used to calculate the data and hence show on the depenedent axis',
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
            description: 'The properties you want to use on the Legend',
            validate: { required: true },
            modelType: '{{data.entityType}}',
            autoFillProps: false,
            settingsValidationErrors: [],
          })
          .addCheckbox({
            id: nanoid(),
            propertyName: 'allowFilter',
            label: 'Allow Filter',
            parentId: 'root',
            defaultValue: true,
          })
          .addPropertyAutocomplete({
            id: nanoid(),
            propertyName: 'filterProperties',
            label: 'Filter Property list',
            labelAlign: 'right',
            mode: "multiple",
            parentId: 'root',
            isDynamic: false,
            description: 'The properties you want users to filter by. Use the propeties that you have selected for axis, value (and legend).',
            modelType: '{{data.entityType}}',
            autoFillProps: false,
            settingsValidationErrors: [],
            hidden: {
              _code: "return !(getSettingValue(data?.allowFilter)",
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
            defaultValue: false,
          })
          .addCheckbox({
            id: nanoid(),
            propertyName: 'showXAxisLabel',
            label: 'Show X Axis Scale',
            parentId: 'root',
          })
          .addCheckbox({
            id: nanoid(),
            propertyName: 'showXAxisLabelTitle',
            label: 'Show X Axis Label Title',
            parentId: 'root',
          })
          .addCheckbox({
            id: nanoid(),
            propertyName: 'showYAxisLabel',
            label: 'Show Y Axis Scale',
            parentId: 'root',
          })
          .addCheckbox({
            id: nanoid(),
            propertyName: 'showYAxisLabelTitle',
            label: 'Show Y Axis Label Title',
            parentId: 'root',
          })
          .addDropdown({
            id: nanoid(),
            propertyName: 'legendPosition',
            parentId: 'root',
            hidden: {
              _code: "return getSettingValue(data?.showLegend) !== true",
              _mode: "code",
              _value: false
            },
            label: 'Legend Position',
            dataSourceType: 'values',
            values: [
              { id: nanoid(), label: 'Top', value: 'top' },
              { id: nanoid(), label: 'Left', value: 'left' },
              { id: nanoid(), label: 'Bottom', value: 'bottom' },
              { id: nanoid(), label: 'Right', value: 'right' },
              { id: nanoid(), label: 'Center', value: 'center' },
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
            hidden: {
              _code: "return getSettingValue(data?.chartType) !== `line`",
              _mode: "code",
              _value: true
            },
          })
          .addColorPicker({
            id: nanoid(),
            propertyName: 'strokeColor',
            parentId: 'root',
            label: 'Stroke Color',
            defaultValue: '#000',
          })
          .toJson()
        ]
    }
  })
  .toJson();
