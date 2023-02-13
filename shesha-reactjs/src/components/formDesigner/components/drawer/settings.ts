import { nanoid } from 'nanoid/non-secure';
import { DesignerToolbarSettings } from '../../../../interfaces/toolbarSettings';

export const getSettings = (data: { readOnly?: boolean }) =>
  new DesignerToolbarSettings(data)
    .addSectionSeparator({
      id: nanoid(),
      name: 'separator1',
      parentId: 'root',
      label: 'Display',
      title: '',
    })
    .addPropertyAutocomplete({
      id: nanoid(),
      name: 'name',
      parentId: 'root',
      label: 'Name',
      validate: { required: true },
    })
    .addSectionSeparator({ id: nanoid(), name: 'placementSeparator', readOnly: data.readOnly })
    .addDropdown({
      id: nanoid(),
      name: 'placement',
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
      name: 'width',
      label: 'Width',
      tooltip: 'Width of the Drawer dialog in % or px',
      placeholder: '70% or 800px',
      customVisibility: "return data?.placement === 'right' || data?.placement === 'left'",
    })
    .addTextField({
      id: nanoid(),
      name: 'height',
      label: 'Height',
      tooltip: 'Placement is top or bottom, height of the Drawer dialog',
      customVisibility: "return data?.placement === 'bottom' || data?.placement === 'top'",
      placeholder: '70% or 800px',
    })
    .addSectionSeparator({
      id: nanoid(),
      name: 'Footer',
      label: 'Footer',
      readOnly: data.readOnly,
    })
    .addCheckbox({
      id: nanoid(),
      name: 'showFooter',
      label: 'Show Footer',
      tooltip: 'Whether Ok and Cancel buttons are shown',
    })
    .addContainer({
      id: nanoid(),
      name: 'containerComponents',
      direction: 'vertical',
      customVisibility: 'return data.showFooter',
      components: new DesignerToolbarSettings()
        .addSectionSeparator({ id: nanoid(), name: 'okButtonSeparator', label: 'Ok button' })
        .addConfigurableActionConfigurator({
          id: nanoid(),
          name: 'onOkAction',
          label: 'Ok Action',
        })
        .addTextField({
          id: nanoid(),
          name: 'okText',
          label: 'Ok Text',
          tooltip: 'The text that will be displayed on the Ok button',
        })
        .addCodeEditor({
          id: nanoid(),
          name: 'okButtonCustomEnabled',
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

        .addSectionSeparator({ id: nanoid(), name: 'cancelButtonSeparator', label: 'Cancel button' })
        .addConfigurableActionConfigurator({
          id: nanoid(),
          name: 'onCancelAction',
          label: 'Ok Cancel',
        })
        .addTextField({
          id: nanoid(),
          name: 'cancelText',
          label: 'Cancel Text',
          tooltip: 'The text that will be displayed on the Cancel button',
        })
        .addCodeEditor({
          id: nanoid(),
          name: 'cancelButtonCustomEnabled',
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
      name: 'separatorVisibility',
      parentId: 'root',
      label: 'Visibility',
      title: 'Visibility',
    })
    .addCodeEditor({
      id: '03959ffd-cadb-496c-bf6d-b742f7f6edc6',
      name: 'customVisibility',
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
