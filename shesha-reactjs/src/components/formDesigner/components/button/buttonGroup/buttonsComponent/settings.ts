import { DesignerToolbarSettings } from '../../../../../../interfaces/toolbarSettings';

export const buttonsSettingsForm = new DesignerToolbarSettings()
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
    id: '06f18c99-20aa-4d43-9ee2-36bc6c8d2f26',
    name: 'label',
    parentId: 'root',
    label: 'Label',
  })
  .addCodeEditor({
    id: '03959ffd-cadb-496c-bf6d-b742f7f6edc6',
    name: 'customVisibility',
    parentId: 'root',
    label: 'Custom Visibility',
    description:
      'Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key.',
    mode: 'dialog',
  })
  .toJson();
