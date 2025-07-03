import { nanoid } from '@/utils/uuid';
import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';

export const configurableActionsConfiguratorSettingsForm = new DesignerToolbarSettings()
  .addTextField({
    id: nanoid(),
    propertyName: 'propertyName',
    parentId: 'root',
    label: 'Property name',
    validate: { required: true },
  })
  .addTextField({
    id: nanoid(),
    propertyName: 'label',
    parentId: 'root',
    label: 'Label',
  })
  .addTextArea({
    id: nanoid(),
    propertyName: 'description',
    parentId: 'root',
    hidden: false,
    label: 'Description',
    autoSize: false,
    showCount: false,
    allowClear: true,
  })
  .addSectionSeparator({
    id: nanoid(),
    propertyName: 'separatorVisibility',
    parentId: 'root',
    label: 'Visibility',
  })
  .addCodeEditor({
    id: nanoid(),
    propertyName: 'customVisibility',
    label: 'Custom Visibility',
    labelAlign: 'right',
    parentId: 'root',
    hidden: false,
    description:
      'Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key.',
    validate: {},
    settingsValidationErrors: [],
    exposedVariables: [
      { id: nanoid(), name: 'value', description: 'Component current value', type: 'string | any' },
      { id: nanoid(), name: 'data', description: 'Selected form values', type: 'object' },
    ],
  })
    .addPermissionAutocomplete({
      id: '4d81ae9d-d222-4fc1-85b2-4dc3ee6a3721',
      propertyName: 'permissions',
      label: 'Permissions',
      labelAlign: 'right',
      parentId: 'root',
      hidden: false,
      validate: {},
      jsSetting: true,
    })
  .toJson();
