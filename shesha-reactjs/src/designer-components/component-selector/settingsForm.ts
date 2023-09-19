import { nanoid } from 'nanoid';
import { DesignerToolbarSettings } from '../../interfaces/toolbarSettings';

export const getSettings = (data: any) =>
  new DesignerToolbarSettings(data)
    .addPropertyAutocomplete({
      id: nanoid(),
      name: 'name',
      label: 'Name',
      labelAlign: 'right',
      parentId: 'root',
      hidden: false,
      customVisibility: null,
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
    .addTextArea({
      id: nanoid(),
      name: 'description',
      label: 'Description',
      labelAlign: 'right',
      parentId: 'root',
      hidden: false,
      customVisibility: '',
      autoSize: false,
      showCount: false,
      allowClear: false,
      validate: {},
    })
    .addTextField({
      id: nanoid(),
      name: 'noSelectionItemText',
      parentId: 'root',
      label: 'No selection item text',
    })
    .addTextField({
      id: nanoid(),
      name: 'noSelectionItemValue',
      parentId: 'root',
      label: 'No selection item value',
    })
    .addDropdown({
      id: nanoid(),
      name: 'componentType',
      label: 'Component type',
      useRawValues: true,
      dataSourceType: 'values',
      values: [
        { id: 'input', label: 'input', value: 'input' },
        { id: 'output', label: 'output', value: 'output' },
      ],
    })
    .addSectionSeparator({
      id: nanoid(),
      name: 'sectionVisibility',
      parentId: 'root',
      label: 'Visibility',
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
        { name: 'data', description: 'The form data', type: 'object' },
        { name: 'moment', description: 'The moment.js object', type: 'object' },
        { name: 'form', description: 'Form instance', type: 'FormInstance' },
        { name: 'formMode', description: 'The form mode', type: "'readonly' | 'edit' | 'designer'" },
        { name: 'globalState', description: 'The global state of the application', type: 'object' },
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
        { name: 'data', description: 'The form data', type: 'object' },
        { name: 'moment', description: 'The moment.js object', type: 'object' },
        { name: 'form', description: 'Form instance', type: 'FormInstance' },
        { name: 'formMode', description: 'The form mode', type: "'readonly' | 'edit' | 'designer'" },
        { name: 'globalState', description: 'The global state of the application', type: 'object' },
      ],
    })
    .toJson();
