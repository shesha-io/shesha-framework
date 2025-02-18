import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';

export const navigateArgumentsForm = new DesignerToolbarSettings()
  .addSettingsInput({
    id: nanoid(),
    inputType: 'radio',
    propertyName: 'navigationType',
    parentId: 'root',
    label: 'Navigation Type',
    buttonGroupOptions: [
      { icon: 'LinkOutlined', title: 'Url', value: 'url' },
      { icon: 'FormOutlined', title: 'Form', value: 'form' },
    ]
  })
  .addTextField({
    id: nanoid(),
    propertyName: 'url',
    parentId: 'root',
    label: 'Target Url',
    validate: { required: true },
    hidden: {
      _mode: 'code',
      _code: 'return data?.navigationType !== "url"'
    }
  })
  .addFormAutocomplete({
    id: nanoid(),
    propertyName: 'formId',
    label: 'Form',
    validate: {
      required: true,
    },
    hidden: {
      _mode: 'code',
      _code: 'return data?.navigationType !== "form"'
    }
  })
  .addLabelValueEditor({
    id: nanoid(),
    propertyName: 'queryParameters',
    label: 'Query String parameters',
    labelName: 'key',
    labelTitle: 'Key',
    valueName: 'value',
    valueTitle: 'Value'
  })
  .toJson();