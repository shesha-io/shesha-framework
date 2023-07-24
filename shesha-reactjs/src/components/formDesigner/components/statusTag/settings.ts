import { DesignerToolbarSettings } from 'interfaces/toolbarSettings';
import { nanoid } from 'nanoid';

export const getSettings = () =>
  new DesignerToolbarSettings()
    .addSectionSeparator({
      id: 'b8954bf6-f76d-4139-a850-c99bf06c8b69',
      propertyName: 'separator1',
      parentId: 'root',
      label: 'Override settings',
    })
    .addTextField({
      id: '33b16438-9563-438b-a375-8c5f4ccdd727',
      propertyName: 'override',
      parentId: 'root',
      label: 'Override',
      validate: {},
    })
    .addCodeEditor({
      id: '93053321-71c5-4d96-9832-d860cac70761',
      propertyName: 'overrideCodeEvaluator',
      parentId: 'root',
      label: 'Override Expression',
      language: 'typescript',
      description:
        "Enter the code that, when evaluated, will return a string representation of a value. Objects that have been exposed to you are 'data', which is the form and 'formMode', which is the mode the form is currently in.",
      validate: {},
      exposedVariables: [
        { name: 'data', description: 'Selected form values', type: 'object' },
        { name: 'formMode', description: 'Editable state of form', type: "'designer' | 'edit' | 'readonly'" },
      ],
    })
    .addSectionSeparator({
      id: 'a4e0bc19-b081-4b38-bc9f-d8352ba2205d',
      propertyName: 'separator1',
      parentId: 'root',
      label: 'Value settings',
    })
    .addDropdown({
      id: 'f6c3d710-8d98-47fc-9fe2-7c6312e9a03c',
      propertyName: 'valueSource',
      parentId: 'root',
      hidden: false,
      customVisibility: null,
      label: 'Value source',
      useRawValues: false,
      dataSourceType: 'values',
      values: [
        { id: '17a865b3-8e28-41de-ab40-1fc49a56b31d', label: 'Form', value: 'form' },
        { id: 'edeb7d32-f942-41cc-a941-07b8882d8faa', label: 'Manual', value: 'manual' },
      ],
      validate: { required: true },
      defaultValue: 'manual',
    })
    .addPropertyAutocomplete({
      id: nanoid(),
      propertyName: 'propertyName',
      label: 'Property name',
      customVisibility: 'return data?.valueSource === "form"',
      validate: {
        required: true,
      },
    })
    .addTextField({
      id: '43f91890-9728-47f3-9694-3d893d820c86',
      propertyName: 'value',
      parentId: 'root',
      label: 'Value',
      validate: {},
      customVisibility: 'return data?.valueSource === "manual"',
    })
    .addCodeEditor({
      id: '96f7b3bf-f3b0-42c8-ab24-305482e0853e',
      propertyName: 'valueCodeEvaluator',
      parentId: 'root',
      label: 'Value Expression',
      language: 'typescript',
      description:
        "Enter the code that, when evaluated, will return a string representation of a value. Objects that have been exposed to you are 'data', which is the form and 'formMode', which is the mode the form is currently in.",
      validate: {},
      exposedVariables: [
        { name: 'data', description: 'Selected form values', type: 'object' },
        { name: 'formMode', description: 'Editable state of form', type: "'designer' | 'edit' | 'readonly'" },
      ],
      customVisibility: 'return data?.valueSource === "manual"',
    })
    .addSectionSeparator({
      id: 'b8954bf6-f76d-4139-a850-c99bf06c8b66',
      propertyName: 'separator1',
      parentId: 'root',
      label: 'Color settings',
    })
    .addTextField({
      id: '821d3a6c-abdb-4f11-b659-e562c75bada9',
      propertyName: 'color',
      parentId: 'root',
      label: 'Color',
      validate: {},
    })
    .addCodeEditor({
      id: '4d732742-715b-42a3-9663-e90a3caba458',
      propertyName: 'colorCodeEvaluator',
      parentId: 'root',
      label: 'Color Expression',
      language: 'typescript',
      description:
        "Enter the code that, when evaluated, will return a string representation of a color. Objects that have been exposed to you are 'data', which is the form and 'formMode', which is the mode the form is currently in.",
      validate: {},
      exposedVariables: [
        { name: 'data', description: 'Selected form values', type: 'object' },
        { name: 'formMode', description: 'Editable state of form', type: "'designer' | 'edit' | 'readonly'" },
      ],
    })
    .addSectionSeparator({
      id: 'd5278346-8b05-482f-b1e6-7bedf5bf7712',
      propertyName: 'separator1',
      parentId: 'root',
      label: 'Validations',
    })
    .addCodeEditor({
      id: '12b8a36a-3aec-414c-942f-a57e37f00901',
      propertyName: 'mappings',
      parentId: 'root',
      language: 'json',
      label: 'Default Mappings',
      description: 'Enter the JSON object that should match the structure of the default one provided',
      validate: {},
    })
    .addSectionSeparator({
      id: '6befdd49-41aa-41d6-a29e-76fa00590b74',
      propertyName: 'sectionVisibility',
      parentId: 'root',
      label: 'Visibility',
    })
    .addCodeEditor({
      id: '205fc274-395c-4120-94ea-e9669470b194',
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
        {
          name: 'value',
          description: 'Component current value',
          type: 'string | any',
        },
        {
          name: 'data',
          description: 'Selected form values',
          type: 'object',
        },
      ],
    })

    .toJson();
