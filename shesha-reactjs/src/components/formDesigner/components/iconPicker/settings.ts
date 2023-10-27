import { nanoid } from 'nanoid/non-secure';
import { DesignerToolbarSettings } from '../../../../interfaces/toolbarSettings';

export const iconPickerFormSettings = new DesignerToolbarSettings()
  .addSectionSeparator({
    id: 'b8954bf6-f76d-4139-a850-c99bf06c8b69',
    propertyName: 'separator1',
    parentId: 'root',
    label: 'Display',
  })
  .addContextPropertyAutocomplete({
    id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
    propertyName: 'propertyName',
    parentId: 'root',
    label: 'Property name',
    validate: {
      required: true,
    },
  })
  .addTextField({
    id: '46d07439-4c18-468c-89e1-60c002ce96c5',
    propertyName: 'label',
    parentId: 'root',
    label: 'Label',
  })
  .addDropdown({
    id: '57a40a33-7e08-4ce4-9f08-a34d24a83338',
    propertyName: 'labelAlign',
    parentId: 'root',
    label: 'Label align',
    values: [
      {
        label: 'left',
        value: 'left',
        id: 'f01e54aa-a1a4-4bd6-ba73-c395e48af8ce',
      },
      {
        label: 'right',
        value: 'right',
        id: 'b920ef96-ae27-4a01-bfad-b5b7d07218da',
      },
    ],
    dataSourceType: 'values',
  })
  .addTextArea({
    id: '2d32fe70-99a0-4825-ae6c-8b933004e119',
    propertyName: 'description',
    parentId: 'root',
    label: 'Description',
  })
  .addNumberField({
    id: nanoid(),
    propertyName: 'fontSize',
    label: 'Size',
    min: 10,
    defaultValue: 24,
  })
  .addCodeEditor({
    id: nanoid(),
    propertyName: 'customIcon',
    label: 'Custom Icon',
    labelAlign: 'right',
    parentId: 'root',
    hidden: false,
    description: 'Enter custom icon code. The function must return a string representing the name of the icon',
    validate: {},
    settingsValidationErrors: [],
    exposedVariables: [
      { id: nanoid(), name: 'data', description: 'The form data', type: 'object' },
      { id: nanoid(), name: 'globalState', description: 'The global state', type: 'object' },
    ],
  })
  .addSectionSeparator({
    id: nanoid(),
    propertyName: 'separatorColor',
    parentId: 'root',
    label: 'Color',
  })
  .addColorPicker({
    id: nanoid(),
    propertyName: 'color',
    label: 'Color',
    title: 'Choose Icon color',
  })
  .addCodeEditor({
    id: nanoid(),
    propertyName: 'customColor',
    label: 'Custom Color',
    labelAlign: 'right',
    parentId: 'root',
    hidden: false,
    description: 'Enter custom color code. The function must return a string representing the color of the icon',
    validate: {},
    settingsValidationErrors: [],
    exposedVariables: [
      { id: nanoid(), name: 'data', description: 'The form data', type: 'object' },
      { id: nanoid(), name: 'globalState', description: 'The global state', type: 'object' },
    ],
  })
  .addDropdown({
    id: nanoid(),
    propertyName: 'visibility',
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
  .addCheckbox({
    id: nanoid(),
    propertyName: 'hidden',
    parentId: 'root',
    label: 'Hidden',
  })
  .addCheckbox({
    id: 'c6885251-96a6-40ce-99b2-4b5209a9e01c',
    propertyName: 'hideLabel',
    parentId: 'root',
    label: 'Hide Label',
  })
  .toJson();
