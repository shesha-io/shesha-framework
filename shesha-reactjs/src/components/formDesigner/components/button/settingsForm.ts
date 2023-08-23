import { DesignerToolbarSettings } from '../../../../interfaces/toolbarSettings';

export const getSettings = (data: any) =>
  new DesignerToolbarSettings(data)
    .addPropertyAutocomplete({
      id: '5d4d56fb-d7f8-4835-a529-c4fa93f3596d',
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
      id: 'd498779d-012a-4c6a-82a9-77231245ae28',
      name: 'label',
      parentId: 'root',
      label: 'Label',
    })
    .addTextArea({
      id: '9b671866-072e-4688-8b48-ddf5e12d70d4',
      name: 'tooltip',
      label: 'Tooltip',
      labelAlign: 'right',
      parentId: '345c2181-fb9f-48ed-9631-864ac357807b',
      hidden: false,
      customVisibility: '',
      autoSize: false,
      showCount: false,
      allowClear: false,
      validate: {},
    })
    .addIconPicker({
      id: '91b404a6-4021-4b0a-b9ef-007167a93075',
      name: 'icon',
      label: 'Icon',
      labelAlign: 'right',
      parentId: '345c2181-fb9f-48ed-9631-864ac357807b',
      hidden: false,
      settingsValidationErrors: [],
    })
    .addDropdown({
      id: 'be15598e-5c23-40bc-8245-6b5385bb7963',
      name: 'buttonType',
      label: 'Button Type',
      labelAlign: 'right',
      parentId: '345c2181-fb9f-48ed-9631-864ac357807b',
      hidden: false,
      customVisibility: null,
      validate: {
        required: true,
      },
      dataSourceType: 'values',
      values: [
        {
          id: 'c4a96833-8ed7-4085-8848-169d5607136d',
          label: 'primary',
          value: 'primary',
        },
        {
          id: 'c6f974da-ad28-44e5-8e4d-50280cf24ae7',
          label: 'ghost',
          value: 'ghost',
        },
        {
          id: '71c0dc14-0473-4748-ae75-a4ed3bd6cffd',
          label: 'dashed',
          value: 'dashed',
        },
        {
          id: '789d5733-2d4f-4969-890f-613e5b4a7d59',
          label: 'link',
          value: 'link',
        },
        {
          id: '36abe636-40b2-476c-95b0-78a50478146b',
          label: 'text',
          value: 'text',
        },
        {
          id: 'de08ea36-a831-4373-ab10-ce25fadf80cd',
          label: 'default',
          value: 'default',
        },
      ],
    })
    .addCheckbox({
      id: '4e9b886a-6186-4467-a688-639b30a0e06f',
      name: 'danger',
      label: 'Danger',
      labelAlign: 'right',
      parentId: '345c2181-fb9f-48ed-9631-864ac357807b',
      hidden: false,
      customVisibility: null,
      validate: {},
    })
    .addCheckbox({
      id: 'd25a7d85-6afe-4595-899f-62675fb6c491',
      name: 'block',
      label: 'Block',
      labelAlign: 'right',
      parentId: '345c2181-fb9f-48ed-9631-864ac357807b',
      hidden: false,
      customVisibility: null,
      validate: {},
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
      id: '24a8be15-98eb-40f7-99ea-ebb602693e9c',
      name: 'disabled',
      parentId: 'root',
      label: 'Disabled',
    })
    .addConfigurableActionConfigurator({
      id: 'F3B46A95-703F-4465-96CA-A58496A5F78C',
      name: 'actionConfiguration',
      label: 'Action configuration',
      hidden: false,
      customVisibility: '',
      validate: {},
      settingsValidationErrors: [],
    })
    .addSectionSeparator({
      id: '6befdd49-41aa-41d6-a29e-76fa00590b75',
      name: 'sectionStyle',
      parentId: 'root',
      label: 'Style',
    })
    .addCodeEditor({
      id: '06ab0599-914d-4d2d-875c-765a495472f8',
      name: 'style',
      label: 'Style',
      parentId: 'root',
      validate: {},
      settingsValidationErrors: [],
      description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
      exposedVariables: [{ name: 'data', description: 'Form values', type: 'object' }],
    })
    .addDropdown({
      id: '8615d12f-6ea0-4b11-a1a1-6088c7160fd9',
      name: 'size',
      parentId: 'root',
      label: 'Size',
      allowClear: true,
      values: [
        {
          label: 'Small',
          value: 'small',
          id: '4f11403c-95fd-4e49-bb60-cb8c25f0f3c3',
        },
        {
          label: 'Middle',
          value: 'middle',
          id: '8f85c476-e632-4fa7-89ad-2be6cfb7f1f1',
        },
        {
          label: 'Large',
          value: 'large',
          id: 'f01e54aa-a1a4-4bd6-ba73-c395e48af8ce',
        },
      ],
      dataSourceType: 'values',
    })
    .addSectionSeparator({
      id: '0495b899-bb48-44ea-a212-c4920bf3a8a4',
      name: 'sectionVisibility',
      parentId: 'root',
      label: 'Visibility',
    })
    .addCodeEditor({
      id: '341beffe-2d62-4c4c-8c97-5f2b433716bf',
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
      id: '4b5e5951-4998-4635-b1c8-0b6d3940c300',
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
    .addEditableTagGroupProps({
      id: '26c68b22-3211-475d-91e1-0745a4447329',
      name: 'permissions',
      label: 'Permissions',
      labelAlign: 'right',
      parentId: 'root',
      hidden: false,
      customVisibility: null,
      validate: {},
    })
    .toJson();
