import { DesignerToolbarSettings } from '../../../../../interfaces/toolbarSettings';

export const getSettings = (data: any) =>
  new DesignerToolbarSettings(data)
    .addSectionSeparator({
      id: 'b8954bf6-f76d-4139-a850-c99bf06c8b69',
      name: 'separator1',
      parentId: 'root',
      label: 'Display',
    })
    .addPropertyAutocomplete({
      id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
      name: 'name',
      parentId: 'root',
      label: 'Name',
      validate: { required: true },
    })
    .addSectionSeparator({
      id: '8e9069f1-9981-4336-b7af-acd6250a8d2e',
      name: 'separatorPageSizes',
      parentId: 'root',
      label: 'Page Sizes',
    })
    .addCheckbox({
      id: 'ff14eada-10f7-4470-8db2-52b543d9d03f',
      name: 'showSizeChanger',
      parentId: 'root',
      label: 'Show Size Changer',
      defaultValue: true,
    })
    .addCheckbox({
      id: 'b0304429-96b1-40bd-9b36-65197df42470',
      name: 'showTotalItems',
      parentId: 'root',
      label: 'Show Total Items',
      defaultValue: true,
    })
    .addSectionSeparator({
      id: 'bc67960e-77e3-40f2-89cc-f18f94678cce',
      name: 'separatorVisibility',
      parentId: 'root',
      label: 'Visibility',
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
