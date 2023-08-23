import { DesignerToolbarSettings } from 'interfaces/toolbarSettings';
import { nanoid } from 'nanoid/non-secure';

export const getSettings = (data: any) =>
  new DesignerToolbarSettings(data)
    .addSectionSeparator({
      id: nanoid(),
      name: 'separator1',
      parentId: 'root',
      label: 'Display',
    })
    .addTextField({
      id: nanoid(),
      name: 'name',
      parentId: 'root',
      label: 'Name',
      validate: {
        required: true,
      },
    })
    .addTextField({
      id: nanoid(),
      name: 'label',
      parentId: 'root',
      label: 'Label',
    })

    .addCheckbox({
      id: nanoid(),
      name: 'hidden',
      parentId: 'root',
      label: 'Hidden',
    })
    .addCheckbox({
      id: nanoid(),
      name: 'disabled',
      parentId: 'root',
      label: 'Disabled',
    })
    .addSectionSeparator({
      id: nanoid(),
      name: 'parametersSeparator',
      parentId: 'root',
      label: 'Parameters',
    })
    .addTextField({
      id: nanoid(),
      name: 'ownerId',
      parentId: 'root',
      label: 'Owner Id',
    })
    .addCodeEditor({
      id: nanoid(),
      name: 'ownerIdExpression',
      label: 'Owner ID Expression',
      labelAlign: 'right',
      parentId: 'root',
      hidden: false,
      customVisibility: null,
      description:
        'Enter the code that returns a string that represents the `OwnerId` of these comments. This takes precedence over `Owner Id`',
      validate: {},
      settingsValidationErrors: [],
      exposedVariables: [
        { name: 'globalState', description: 'The Global State', type: 'object' },
        { name: 'data', description: 'The form data', type: 'object' },
      ],
    })
    .addTextField({
      id: nanoid(),
      name: 'ownerType',
      parentId: 'root',
      label: 'Owner Type',
    })
    .addCodeEditor({
      id: nanoid(),
      name: 'ownerTypeExpression',
      label: 'Owner Type Expression',
      labelAlign: 'right',
      parentId: 'root',
      hidden: false,
      customVisibility: null,
      description:
        'Enter the code that returns a string that represents the `OwnerType` of these comments. This takes precedence over `Owner Type`',
      validate: {},
      settingsValidationErrors: [],
      exposedVariables: [
        { name: 'globalState', description: 'The Global State', type: 'object' },
        { name: 'data', description: 'The form data', type: 'object' },
      ],
    })
    .addSectionSeparator({
      id: nanoid(),
      name: 'styleSeparator',
      parentId: 'root',
      label: 'Styling',
    })
    .addDropdown({
      id: nanoid(),
      name: 'savePlacement',
      parentId: 'root',
      label: 'Save Placement',
      description: 'This used to place the save button (Left, Right).',
      values: [
        {
          label: 'Left',
          value: 'left',
          id: '18a25d15-5a3b-43f6-815c-ab50c60c67e2',
        },
        {
          label: 'Right',
          value: 'right',
          id: 'ba03eef2-2fc6-4ac9-9f3d-d77952416c84',
        },
      ],
      defaultValue: 'left',
      dataSourceType: 'values',
    })
    .addCheckbox({
      id: nanoid(),
      name: 'autoSize',
      parentId: 'root',
      label: 'Auto Size',
    })
    .addSectionSeparator({
      id: nanoid(),
      name: 'separatorVisibility',
      parentId: 'root',
      label: 'Visibility',
    })
    .addDropdown({
      id: nanoid(),
      name: 'visibility',
      parentId: 'root',
      label: 'Visibility',
      description:
        "This property will eventually replace the 'hidden' property and other properties that toggle visibility on the UI and payload",
      allowClear: true,
      values: [
        {
          label: 'Yes (Display in UI and include in payload)',
          value: 'Yes',
          id: '53cd10ce-26af-474b-af75-8e7b1f19e51d',
        },
        {
          label: 'No (Only include in payload)',
          value: 'No',
          id: 'f07a228c-cb9c-4da7-a8bc-bc2be518a058',
        },
        {
          label: 'Removed (Remove from UI and exlude from payload)',
          value: 'Removed',
          id: '3b6282ee-2eee-47ec-bab9-4cba52b970a0',
        },
      ],
      dataSourceType: 'values',
    })
    .addCodeEditor({
      id: nanoid(),
      name: 'customVisibility',
      label: 'Custom Visibility',
      labelAlign: 'right',
      parentId: 'root',
      hidden: false,
      customVisibility: null,
      description:
        'Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key.',
      validate: {},
      settingsValidationErrors: [],
      exposedVariables: [
        { name: 'value', description: 'Component current value', type: 'string | any' },
        { name: 'data', description: 'Selected form values', type: 'object' },
      ],
    })
    .addCodeEditor({
      id: nanoid(),
      name: 'customEnabled',
      label: 'Custom Enabled',
      labelAlign: 'right',
      parentId: 'root',
      hidden: false,
      customEnabled: null,
      description:
        'Enter custom enabled code.  You must return true to enable the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key.',
      validate: {},
      settingsValidationErrors: [],
      exposedVariables: [
        { name: 'value', description: 'Component current value', type: 'string | any' },
        { name: 'data', description: 'Selected form values', type: 'object' },
      ],
    })
    .toJson();
