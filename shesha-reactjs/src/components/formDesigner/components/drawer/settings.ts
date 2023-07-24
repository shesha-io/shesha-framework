import { nanoid } from 'nanoid/non-secure';
import { DesignerToolbarSettings } from '../../../../interfaces/toolbarSettings';

export const getSettings = (data: { readOnly?: boolean }) =>
  new DesignerToolbarSettings(data)
    .addSectionSeparator({
      id: nanoid(),
      propertyName: 'separator1',
      parentId: 'root',
      label: 'Display',
    })
    .addPropertyAutocomplete({
      id: nanoid(),
      propertyName: 'propertyName',
      parentId: 'root',
      label: 'Property name',
      validate: { required: true },
    })
    .addSectionSeparator({ id: nanoid(), propertyName: 'placementSeparator', readOnly: data.readOnly })
    .addDropdown({
      id: nanoid(),
      propertyName: 'placement',
      parentId: 'root',
      hidden: false,
      customVisibility: null,
      label: 'Placement',
      useRawValues: false,
      dataSourceType: 'values',
      values: [
        { id: nanoid(), label: 'top', value: 'top' },
        { id: nanoid(), label: 'right', value: 'right' },
        { id: nanoid(), label: 'bottom', value: 'bottom' },
        { id: nanoid(), label: 'left', value: 'left' },
      ],
      validate: { required: true },
    })
    .addTextField({
      id: nanoid(),
      propertyName: 'width',
      label: 'Width',
      description: 'Width of the Drawer dialog in % or px',
      placeholder: '70% or 800px',
      customVisibility: "return data?.placement === 'right' || data?.placement === 'left'",
    })
    .addTextField({
      id: nanoid(),
      propertyName: 'height',
      label: 'Height',
      description: 'Placement is top or bottom, height of the Drawer dialog',
      customVisibility: "return data?.placement === 'bottom' || data?.placement === 'top'",
      placeholder: '70% or 800px',
    })
    .addSectionSeparator({
      id: nanoid(),
      propertyName: 'Footer',
      label: 'Footer',
      readOnly: data.readOnly,
    })
    .addCheckbox({
      id: nanoid(),
      propertyName: 'showFooter',
      label: 'Show Footer',
      description: 'Whether Ok and Cancel buttons are shown',
    })
    .addContainer({
      id: nanoid(),
      propertyName: 'containerComponents',
      direction: 'vertical',
      customVisibility: 'return data.showFooter',
      components: new DesignerToolbarSettings()
        .addSectionSeparator({ id: nanoid(), propertyName: 'okButtonSeparator', label: 'Ok button' })
        .addConfigurableActionConfigurator({
          id: nanoid(),
          propertyName: 'onOkAction',
          label: 'Ok Action',
        })
        .addTextField({
          id: nanoid(),
          propertyName: 'okText',
          label: 'Ok Text',
          description: 'The text that will be displayed on the Ok button',
        })
        .addCodeEditor({
          id: nanoid(),
          propertyName: 'okButtonCustomEnabled',
          parentId: 'root',
          label: 'Custom Enabled',
          description: 'Enter custom enabled of the Ok button',
          exposedVariables: [
            {
              id: '788673a5-5eb9-4a9a-a34b-d8cea9cacb3c',
              name: 'data',
              description: 'Form data',
              type: 'object',
            },
            {
              id: '65b71112-d412-401f-af15-1d3080f85319',
              name: 'globalState',
              description: 'The global state',
              type: 'object',
            },
          ],
        })

        .addSectionSeparator({ id: nanoid(), propertyName: 'cancelButtonSeparator', label: 'Cancel button' })
        .addConfigurableActionConfigurator({
          id: nanoid(),
          propertyName: 'onCancelAction',
          label: 'Ok Cancel',
        })
        .addTextField({
          id: nanoid(),
          propertyName: 'cancelText',
          label: 'Cancel Text',
          description: 'The text that will be displayed on the Cancel button',
        })
        .addCodeEditor({
          id: nanoid(),
          propertyName: 'cancelButtonCustomEnabled',
          parentId: 'root',
          label: 'Custom Enabled',
          description: 'Enter custom enabled of the Cancel button',
          exposedVariables: [
            {
              id: '788673a5-5eb9-4a9a-a34b-d8cea9cacb3c',
              name: 'data',
              description: 'Form data',
              type: 'object',
            },
            {
              id: '65b71112-d412-401f-af15-1d3080f85319',
              name: 'globalState',
              description: 'The global state',
              type: 'object',
            },
          ],
        })
        .toJson(),
    })
    .addSectionSeparator({
      id: 'bc67960e-77e3-40f2-89cc-f18f94678cce',
      propertyName: 'separatorVisibility',
      parentId: 'root',
      label: 'Visibility',
    })
    .addCodeEditor({
      id: '03959ffd-cadb-496c-bf6d-b742f7f6edc6',
      propertyName: 'customVisibility',
      parentId: 'root',
      label: 'Custom Visibility',
      description:
        'Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key.',
      exposedVariables: [
        {
          id: '788673a5-5eb9-4a9a-a34b-d8cea9cacb3c',
          name: 'data',
          description: 'Form data',
          type: 'object',
        },
        {
          id: '65b71112-d412-401f-af15-1d3080f85319',
          name: 'globalState',
          description: 'The global state',
          type: 'object',
        },
      ],
    })
    .toJson();
