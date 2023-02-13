import { DesignerToolbarSettings } from '../../../../interfaces/toolbarSettings';

export const alertSettingsForm = new DesignerToolbarSettings()
  .addSectionSeparator({
    id: 'b8954bf6-f76d-4139-a850-c99bf06c8b69',
    name: 'separator1',
    parentId: 'root',
    label: 'Display',
    title: '',
  })
  .addPropertyAutocomplete({
    id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
    name: 'name',
    parentId: 'root',
    label: 'Name',
    validate: { required: true },
  })
  .addTextField({
    id: '001bc9d9-d943-457c-b39a-95d5380bfdbe',
    name: 'label',
    label: 'Label',
  })
  .addCheckbox({
    id: '3f7226c7-7953-4bea-b103-1484340f5929',
    name: 'hideLabel',
    label: 'Hide label',
  })
  .addCodeEditor({
    id: 'a62a1d47-4255-4e0c-abae-ee313dada8d4',
    name: 'format',
    label: 'Format',
    exposedVariables: [
      {
        id: '4925a95d-6521-4856-a253-bd9f042a7388',
        name: 'percent',
        description: 'Progress percentage',
        type: 'number',
      },
      {
        id: '2b8f3030-00aa-4081-85ac-2b5c7692615e',
        name: 'successPercent',
        description: 'success percentage',
        type: 'number',
      },
    ],
    mode: 'dialog',
    description: 'The template function of the content. This function should return string or number',
  })
  .addNumberField({
    id: 'b10d0c9f-d83a-44c5-94e6-0d30f95a36cb',
    name: 'percent',
    label: 'Percent',
    min: 0,
    max: 100,
    description: 'To set the completion percentage',
  })
  .addCheckbox({
    id: '55e685e0-0277-4543-9fc2-1083c2603930',
    name: 'showInfo',
    label: 'Show Info',
    defaultValue: true,
  })
  .addDropdown({
    id: 'c8360d69-0da2-4875-8dae-a0a41fb924fc',
    name: 'status',
    label: 'Status',
    description: 'To set the status of the Progress.',
    values: [
      { id: 'f1448397-0a7d-42e2-af2e-c9d3b8ae0fdd', label: 'success', value: 'success' },
      { id: '72567015-266d-4c37-9b46-ba633e74a036', label: 'exception', value: 'exception' },
      { id: '4c5e55c5-3ad9-4ed1-8f9a-f1370c85c238', label: 'normal', value: 'normal' },
      { id: 'b028311f-c97a-40e2-81b3-e6b29f377165', label: 'active', value: 'active' },
    ],
    dataSourceType: 'values',
    useRawValues: false,
  })
  .addTextField({
    id: '6e316ddf-183d-4477-a21d-22919292e6df',
    name: 'strokeColor',
    label: 'Stroke Color',
    description:
      "The color of progress bar. This will be 'overridden' by the the 'strokeColor' property of 'line' and 'circle' types",
  })
  .addDropdown({
    id: 'd8b4769a-4499-42f9-9753-3caba0d44b39',
    name: 'strokeLinecap',
    label: 'Stroke Linecap',
    parentId: 'root',
    hidden: false,
    customVisibility: null,
    useRawValues: false,
    dataSourceType: 'values',
    defaultValue: 'round',
    values: [
      { id: '17a865b3-8e28-41de-ab40-1fc49a56b31d', label: 'round', value: 'round' },
      { id: 'edeb7d32-f942-41cc-a941-07b8882d8faa', label: 'butt', value: 'butt' },
      { id: 'df342c95-4dae-49a5-beff-259d0f2ebcb3', label: 'square', value: 'square' },
    ],
    validate: { required: true },
  })
  .addCodeEditor({
    id: '9fa733bf-0cad-4a67-9461-e8df24ea4a13',
    name: 'success',
    label: 'Success',
    description:
      'Configs of successfully progress bar. Returns an object of this format: { percent: number, strokeColor: string }',
    mode: 'dialog',
  })
  .addTextField({
    id: 'd72986e5-e099-4ba7-8ffe-b8e394542524',
    name: 'trailColor',
    label: 'trailColor',
    description: 'The color of unfilled part',
  })
  .addDropdown({
    id: '173e3a29-786f-44b8-b569-7f033c543e24',
    name: 'progressType',
    parentId: 'root',
    hidden: false,
    customVisibility: null,
    label: 'Type',
    useRawValues: false,
    dataSourceType: 'values',
    values: [
      { id: '17a865b3-8e28-41de-ab40-1fc49a56b31d', label: 'Line', value: 'line' },
      { id: 'edeb7d32-f942-41cc-a941-07b8882d8faa', label: 'Circle', value: 'circle' },
      { id: 'df342c95-4dae-49a5-beff-259d0f2ebcb3', label: 'Dashboard', value: 'dashboard' },
    ],
    validate: { required: true },
  })
  .addContainer({
    id: 'fdb031ce-250f-4c7f-8ff9-b35ac59e1946',
    name: 'lineContainer',
    direction: 'vertical',
    customVisibility: "return data.progressType === 'line'",
    components: new DesignerToolbarSettings()
      .addNumberField({
        id: '7decc517-9c50-433c-a23f-2054b5684a80',
        name: 'steps',
        label: 'Steps',
        description: 'The total step count',
      })
      .addCodeEditor({
        id: '7decc517-9c50-433c-a23f-2054b5684a80',
        name: 'lineStrokeColor',
        label: 'Stroke Width',
        description:
          'The color of progress bar, render linear-gradient when passing an object, could accept string[] when has steps. Write the code that returns any of the following: `string | string[] | { from: string; to: string; direction: string }`',
        mode: 'dialog',
      })
      .toJson(),
  })
  .addContainer({
    id: '6a49b8af-da4f-4de4-b834-cab5d83541ce',
    name: 'circleContainer',
    direction: 'vertical',
    customVisibility: "return data.progressType === 'circle'",
    components: new DesignerToolbarSettings()
      .addCodeEditor({
        id: 'b6e39afe-2495-4b35-9c0a-661242b4b7c4',
        name: 'circleStrokeColor',
        label: 'Stroke Color',
        description:
          'The color of circular progress, render linear-gradient when passing an object. Write the code that returns: `string | object`',
        mode: 'dialog',
      })
      .toJson(),
  })
  .addContainer({
    id: '73f9b6eb-e251-4286-b0c3-183f675b39fd',
    name: 'dashboardContainer',
    direction: 'vertical',
    customVisibility: "return data.progressType === 'dashboard'",
    components: new DesignerToolbarSettings()
      .addNumberField({
        name: 'gapDegree',
        label: 'Gap Degree',
        id: '25e604fc-5d88-4299-a596-5b51f0724675',
        stepNumeric: 0,
        stepString: '',
        min: 0,
        max: 295,
      })
      .addDropdown({
        id: 'bdf1f1d3-21b2-4135-b482-72e784ea1d39',
        name: 'gapPosition',
        parentId: 'root',
        hidden: false,
        customVisibility: null,
        label: 'Gap Position',
        useRawValues: false,
        dataSourceType: 'values',
        values: [
          { id: '2e9bde7b-1a0d-4438-879e-5dd7bb5fdb8e', label: 'top', value: 'top' },
          { id: 'c78eabf3-d0c7-4112-8078-c83c982c75d2', label: 'bottom', value: 'bottom' },
          { id: 'c11bcfff-c65b-49b7-a514-32f1881daa2a', label: 'left', value: 'left' },
          { id: '0e931e4c-d829-4a44-ac61-67a879f51d21', label: 'right', value: 'right' },
        ],
        validate: { required: true },
      })
      .toJson(),
  })
  .addNumberField({
    id: '6ffeac8a-71e0-4a98-bfe9-a47d3b1d0fa0',
    name: 'strokeWidth',
    label: 'Stroke Width',
    description: 'To set the width of the circular progress, unit: percentage of the canvas width in px',
    defaultValue: 6,
  })
  .addNumberField({
    id: '1bc6dfc0-6088-4a99-a667-ae6bd6943be4',
    name: 'width',
    label: 'Width',
    description: 'To set the canvas width of the circular progress, unit: px',
    customVisibility: "return ['circle', 'dashboard'].includes(data.progressType);",
  })
  .addSectionSeparator({
    id: '516d72e1-3dfd-433f-8459-8b1610c3c9cb',
    name: 'separatorStyle',
    parentId: 'root',
    label: 'Style',
    title: '',
  })
  .addSectionSeparator({
    id: 'bc67960e-77e3-40f2-89cc-f18f94678cce',
    name: 'separatorVisibility',
    parentId: 'root',
    label: 'Visibility',
    title: 'Visibility',
  })
  .addTextArea({
    id: '03959ffd-cadb-496c-bf6d-b742f7f6edc6',
    name: 'customVisibility',
    parentId: 'root',
    label: 'Custom Visibility',
    autoSize: false,
    showCount: false,
    allowClear: false,
    description:
      'Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key.',
  })
  .toJson();
