import { nanoid } from 'nanoid/non-secure';
import { DesignerToolbarSettings } from '../../../../interfaces/toolbarSettings';

export const iconPickerFormSettings = new DesignerToolbarSettings()
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
    validate: {
      required: true,
    },
  })
  .addTextField({
    id: '46d07439-4c18-468c-89e1-60c002ce96c5',
    name: 'label',
    parentId: 'root',
    label: 'Label',
  })
  .addDropdown({
    id: '57a40a33-7e08-4ce4-9f08-a34d24a83338',
    name: 'labelAlign',
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
    name: 'title',
    parentId: 'root',
    label: 'Title',
  })
  .addNumberField({
    id: nanoid(),
    name: 'fontSize',
    label: 'Size',
    min: 10,
  })
  .addDropdown({
    id: 'df8a8f35-a50b-42f9-9642-73d390ceddbf',
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
  .addCheckbox({
    id: 'cfd7d45e-c7e3-4a27-987b-dc525c412448',
    name: 'hidden',
    parentId: 'root',
    label: 'Hidden',
  })
  .addCheckbox({
    id: 'c6885251-96a6-40ce-99b2-4b5209a9e01c',
    name: 'hideLabel',
    parentId: 'root',
    label: 'Hide Label',
  })
  .addSectionSeparator({
    id: '41721f44-adbc-42fe-8c70-69b30e36f4ca',
    name: 'sectionVisibility',
    parentId: 'root',
    label: 'Visibility',
  })
  .addCodeEditor({
    id: '84558f32-b056-4ced-9803-accef8cab0ec',
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
      { id: nanoid(), name: 'value', description: 'Component current value', type: 'string | any' },
      { id: nanoid(), name: 'data', description: 'Selected form values', type: 'object' },
    ],
  })
  .toJson();
