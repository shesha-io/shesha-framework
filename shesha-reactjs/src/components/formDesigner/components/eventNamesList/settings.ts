import { DesignerToolbarSettings } from '../../../../interfaces/toolbarSettings';

export const alertSettingsForm = new DesignerToolbarSettings()
  .addSectionSeparator({
    id: 'b8954bf6-f76d-4139-a850-c99bf06c8b69',
    name: 'separator1',
    parentId: 'root',
    label: 'Display',
    title: '',
  })
  .addTextField({
    id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
    name: 'name',
    parentId: 'root',
    label: 'Name',
    validate: { required: true },
  })
  .addDropdown({
    id: 'f6c3d710-8d98-47fc-9fe2-7c6312e9a03c',
    name: 'alertType',
    parentId: 'root',
    hidden: false,
    customVisibility: null,
    label: 'Type',
    useRawValues: false,
    dataSourceType: 'values',
    values: [
      { id: '17a865b3-8e28-41de-ab40-1fc49a56b31d', label: 'Success', value: 'success' },
      { id: 'edeb7d32-f942-41cc-a941-07b8882d8faa', label: 'Info', value: 'info' },
      { id: 'df342c95-4dae-49a5-beff-259d0f2ebcb3', label: 'Warning', value: 'warning' },
      { id: '21fc57e5-5e5d-4ae8-83c4-080a15b55176', label: 'Error', value: 'error' },
    ],
    validate: { required: true },
  })
  .addTextArea({
    id: '277b7ffe-d023-4543-a4b4-ff7f76052867',
    name: 'text',
    parentId: 'root',
    hidden: false,
    customVisibility: null,
    label: 'Text',
    autoSize: false,
    showCount: false,
    allowClear: false,
    validate: { required: true },
  })
  .addTextArea({
    id: '8340f638-c466-448e-99cd-fb8c544fe02a',
    name: 'description',
    parentId: 'root',
    hidden: false,
    customVisibility: null,
    label: 'Description',
    autoSize: false,
    showCount: false,
    allowClear: true,
  })
  .addCheckbox({
    id: '65aef83a-ea37-480a-9d77-ee4f4e229a70',
    name: 'showIcon',
    parentId: 'root',
    label: 'Show Icon',
  })
  .addCheckbox({
    id: '148e12c0-41a0-4fa2-8c64-8f6dd5213a3e',
    name: 'closable',
    label: 'Closable',
    parentId: 'root',
  })
  .addIconPicker({
    id: '152f3d72-68fb-43ab-adf6-8cf7d11fe6e1',
    name: 'icon',
    label: 'Icon',
    parentId: 'root',
  })
  .addSectionSeparator({
    id: '516d72e1-3dfd-433f-8459-8b1610c3c9cb',
    name: 'separatorStyle',
    parentId: 'root',
    label: 'Style',
    title: '',
  })
  .addCodeEditor({
    id: '987c3de1-b959-4670-96f6-9b1747189a6e',
    name: 'style',
    label: 'Style',
    parentId: 'root',
    mode: 'dialog',
  })
  .addSectionSeparator({
    id: 'bc67960e-77e3-40f2-89cc-f18f94678cce',
    name: 'separatorVisibility',
    parentId: 'root',
    label: 'Visibility',
    title: 'Visibility',
  })
  .addTextArea({
    id: '03959ffd-cadb-496c-bf6d-b742f7f6edc6',
    name: 'customVisibility',
    parentId: 'root',
    label: 'Custom Visibility',
    autoSize: false,
    showCount: false,
    allowClear: false,
    description:
      'Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key.',
  })
  .toJson();
