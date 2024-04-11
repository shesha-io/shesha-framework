import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';

export const progressSettingsForm = new DesignerToolbarSettings()

  .addCollapsiblePanel({
    id: "b8954bf6-f76d-4139-a850-c99bf06c8b69",
    propertyName: "separator1",
    parentId: "root",
    label: "Display",
    labelAlign: "right",
    expandIconPosition: "start",
    ghost: true,
    hideWhenEmpty: true,
    header: {
      id: '3342DA1C-DA07-46F6-8026-E8B9A93F094A',
      components: []
    },
    content: {
      id: '1BCC52E8-FD3B-4309-AD9B-099CDB729441',
      components: new DesignerToolbarSettings()
        .addContextPropertyAutocomplete({
          id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
          propertyName: 'propertyName',
          parentId: 'root',
          label: 'Property name',
          validate: { required: true },
        })
        .addTextField({
          id: '001bc9d9-d943-457c-b39a-95d5380bfdbe',
          propertyName: 'label',
          label: 'Label',
        })
        .addCheckbox({
          id: '3f7226c7-7953-4bea-b103-1484340f5929',
          propertyName: 'hideLabel',
          label: 'Hide label',
        })
        .addCodeEditor({
          id: 'a62a1d47-4255-4e0c-abae-ee313dada8d4',
          propertyName: 'format',
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
          wrapInTemplate: true,
          templateSettings: {
            functionName: 'getFormat',            
          },
          availableConstants: {
            dataType: 'object',
            properties: [
              {
                path: 'percent',
                label: 'percent',
                dataType: 'number',
              },
              {
                path: 'successPercent',
                dataType: 'number',
              },
            ]
          }
        })
        .addNumberField({
          id: 'b10d0c9f-d83a-44c5-94e6-0d30f95a36cb',
          propertyName: 'percent',
          label: 'Percent',
          min: 0,
          max: 100,
          description: 'To set the completion percentage',
        })
        .addCheckbox({
          id: '55e685e0-0277-4543-9fc2-1083c2603930',
          propertyName: 'showInfo',
          label: 'Show Info',
          defaultValue: true,
        })
        .addDropdown({
          id: 'c8360d69-0da2-4875-8dae-a0a41fb924fc',
          propertyName: 'status',
          label: 'Status',
          description: 'To set the status of the Progress.',
          values: [
            { id: 'f1448397-0a7d-42e2-af2e-c9d3b8ae0fdd', label: 'success', value: 'success' },
            { id: '72567015-266d-4c37-9b46-ba633e74a036', label: 'exception', value: 'exception' },
            { id: '4c5e55c5-3ad9-4ed1-8f9a-f1370c85c238', label: 'normal', value: 'normal' },
            { id: 'b028311f-c97a-40e2-81b3-e6b29f377165', label: 'active', value: 'active' },
          ],
          dataSourceType: 'values',
        })
        .addTextField({
          id: '6e316ddf-183d-4477-a21d-22919292e6df',
          propertyName: 'strokeColor',
          label: 'Stroke Color',
          description:
            "The color of progress bar. This will be 'overridden' by the the 'strokeColor' property of 'line' and 'circle' types",
        })
        .addDropdown({
          id: 'd8b4769a-4499-42f9-9753-3caba0d44b39',
          propertyName: 'strokeLinecap',
          label: 'Stroke Linecap',
          parentId: 'root',
          hidden: false,
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
          propertyName: 'success',
          label: 'Success',
          description:
            'Configs of successfully progress bar. Returns an object of this format: { percent: number, strokeColor: string }',
          mode: 'dialog',
          wrapInTemplate: true,
          templateSettings: {
            functionName: 'getSuccess'
          }
        })
        .addTextField({
          id: 'd72986e5-e099-4ba7-8ffe-b8e394542524',
          propertyName: 'trailColor',
          label: 'trailColor',
          description: 'The color of unfilled part',
        })
        .addDropdown({
          id: '173e3a29-786f-44b8-b569-7f033c543e24',
          propertyName: 'progressType',
          parentId: 'root',
          hidden: false,
          label: 'Type',
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
          propertyName: 'lineContainer',
          direction: 'vertical',
          hidden: { _code: 'return  getSettingValue(data?.progressType) !== "line";', _mode: 'code', _value: false } as any,
          components: new DesignerToolbarSettings()
            .addNumberField({
              id: '7decc517-9c50-433c-a23f-2054b5684a80',
              propertyName: 'steps',
              label: 'Steps',
              description: 'The total step count',
            })
            .addCodeEditor({
              id: '7decc517-9c50-433c-a23f-2054b5684a80',
              propertyName: 'lineStrokeColor',
              label: 'Stroke Width',
              description:
                'The color of progress bar, render linear-gradient when passing an object, could accept string[] when has steps. ' +
                'Write the code that returns any of the following: `string | string[] | { from: string; to: string; direction: string }`',
              mode: 'dialog',
            })
            .toJson(),
        })
        .addContainer({
          id: '6a49b8af-da4f-4de4-b834-cab5d83541ce',
          propertyName: 'circleContainer',
          direction: 'vertical',
          hidden: { _code: 'return  getSettingValue(data?.progressType) !== "circle";', _mode: 'code', _value: false } as any,
          components: new DesignerToolbarSettings()
            .addCodeEditor({
              id: 'b6e39afe-2495-4b35-9c0a-661242b4b7c4',
              propertyName: 'circleStrokeColor',
              label: 'Stroke Color',
              description:
                'The color of circular progress, render linear-gradient when passing an object. Write the code that returns: `string | object`',
              mode: 'dialog',
            })
            .toJson(),
        })
        .addContainer({
          id: '73f9b6eb-e251-4286-b0c3-183f675b39fd',
          propertyName: 'dashboardContainer',
          direction: 'vertical',
          hidden: { _code: 'return  getSettingValue(data?.progressType) !== "dashboard";', _mode: 'code', _value: false } as any,
          components: new DesignerToolbarSettings()
            .addNumberField({
              propertyName: 'gapDegree',
              label: 'Gap Degree',
              id: '25e604fc-5d88-4299-a596-5b51f0724675',
              stepNumeric: 0,
              stepString: '',
              min: 0,
              max: 295,
            })
            .addDropdown({
              id: 'bdf1f1d3-21b2-4135-b482-72e784ea1d39',
              propertyName: 'gapPosition',
              parentId: 'root',
              hidden: false,
              label: 'Gap Position',
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
          propertyName: 'strokeWidth',
          label: 'Stroke Width',
          description: 'To set the width of the circular progress, unit: percentage of the canvas width in px',
          defaultValue: 6,
        })
        .addNumberField({
          id: '1bc6dfc0-6088-4a99-a667-ae6bd6943be4',
          propertyName: 'width',
          label: 'Width',
          description: 'To set the canvas width of the circular progress, unit: px',
          hidden: { _code: 'return  !["circle", "dashboard"].includes(getSettingValue(data?.progressType));', _mode: 'code', _value: false } as any,
        })
        .toJson()
    }
  }).toJson();
