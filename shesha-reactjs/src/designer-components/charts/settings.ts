import { DesignerToolbarSettings } from "../../interfaces";
import { nanoid } from "@/utils/uuid";

export const settingsForm = new DesignerToolbarSettings()
  .addSectionSeparator({
    id: nanoid(),
    componentName: 'separator1',
    parentId: 'root',
    label: 'General',
  })
  .addPropertyAutocomplete({
    id: nanoid(),
    propertyName: 'name',
    componentName: 'name',
    parentId: 'root',
    label: 'Name',
    validate: { required: true },
  })
  .addCheckbox({
    id: nanoid(),
    propertyName: 'showName',
    label: 'Show Name',
    parentId: 'root',
  })
  .addTextArea({
    id: nanoid(),
    propertyName: 'description',
    componentName: 'description',
    parentId: 'root',
    label: 'Description',
    autoSize: false,
    showCount: false,
    allowClear: false,
  })
  .addCheckbox({
    id: nanoid(),
    propertyName: 'showDescription',
    label: 'Show Description',
    parentId: 'root',
  })
  .addSectionSeparator({
    id: nanoid(),
    componentName: 'separator2',
    parentId: 'root',
    label: 'Chart Settings',
  })
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
      _code: "return getSettingValue(data?.chartType) !== `bar` && getSettingValue(data?.simpleOrPivot) !== `simple`",
      _mode: "code",
      _value: false
    },
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
    labelAlign: 'right',
    validate: { required: true },
  })
  .addCheckbox({
    id: nanoid(),
    propertyName: 'showTitle',
    label: 'Show Title',
    parentId: 'root',
  })
  .addCheckbox({
    id: nanoid(),
    propertyName: 'showLegend',
    label: 'Show Legend',
    parentId: 'root',
    hidden: {
      _code: "return getSettingValue(data?.simpleOrPivot) === `simple`",
      _mode: "code",
      _value: false
    },
    defaultValue: false,
  })
  .addCheckbox({
    id: nanoid(),
    propertyName: 'showXAxisLabel',
    label: 'Show X Axis Label',
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
    label: 'Show Y Axis Label',
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
  .addSectionSeparator({
    id: nanoid(),
    componentName: 'separator3',
    parentId: 'root',
    label: 'Data Settings',
  })
  .addAutocomplete({
    id: nanoid(),
    propertyName: 'entityType',
    label: 'Entity type',
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
    label: 'Legend Property list',
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
  .addPropertyAutocomplete({
    id: nanoid(),
    propertyName: 'filterProperties',
    label: 'Filter Property list',
    labelAlign: 'right',
    mode: "multiple",
    parentId: 'root',
    isDynamic: false,
    description: 'The properties you want users to filter by. Use the propeties that you have selected for axis, value (and legend).',
    validate: { required: true },
    modelType: '{{data.entityType}}',
    autoFillProps: false,
    settingsValidationErrors: [],
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
  .toJson();
