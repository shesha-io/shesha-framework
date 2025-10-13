import { nanoid } from '@/utils/uuid';
import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormRawMarkup } from '@/index';

export const getSettings = (data: object): FormRawMarkup =>
  new DesignerToolbarSettings(data)
    .addPropertyAutocomplete({
      id: nanoid(),
      propertyName: 'propertyName',
      label: 'Property name',
      labelAlign: 'right',
      parentId: 'root',
      hidden: false,
      validate: {
        required: true,
      },
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
      label: 'Description',
      labelAlign: 'right',
      parentId: 'root',
      hidden: false,
      autoSize: false,
      showCount: false,
      allowClear: false,
      validate: {},
    })
    .addTextField({
      id: nanoid(),
      propertyName: 'noSelectionItemText',
      parentId: 'root',
      label: 'No selection item text',
    })
    .addTextField({
      id: nanoid(),
      propertyName: 'noSelectionItemValue',
      parentId: 'root',
      label: 'No selection item value',
    })
    .addDropdown({
      id: nanoid(),
      propertyName: 'componentType',
      label: 'Component type',
      dataSourceType: 'values',
      values: [
        { id: 'input', label: 'input', value: 'input' },
        { id: 'output', label: 'output', value: 'output' },
      ],
    })
    .addSectionSeparator({
      id: nanoid(),
      propertyName: 'sectionVisibility',
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
      customVisibility: null,
      description:
        'Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key.',
      validate: {},
      settingsValidationErrors: [],
      exposedVariables: [
        { name: 'data', description: 'The form data', type: 'object' },
        { name: 'moment', description: 'The moment.js object', type: 'object' },
        { name: 'form', description: 'Form instance', type: 'FormInstance' },
        { name: 'formMode', description: 'The form mode', type: "'readonly' | 'edit' | 'designer'" },
        { name: 'globalState', description: 'The global state of the application', type: 'object' },
      ],
    })
    .addCodeEditor({
      id: nanoid(),
      propertyName: 'customEnabled',
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
        { name: 'data', description: 'The form data', type: 'object' },
        { name: 'moment', description: 'The moment.js object', type: 'object' },
        { name: 'form', description: 'Form instance', type: 'FormInstance' },
        { name: 'formMode', description: 'The form mode', type: "'readonly' | 'edit' | 'designer'" },
        { name: 'globalState', description: 'The global state of the application', type: 'object' },
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
    })
    .toJson();
