import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';

export const navigateArgumentsForm = new DesignerToolbarSettings()
  .addRadio({
    id: nanoid(),
    propertyName: 'navigationType',
    parentId: 'root',
    label: 'Navigation Type',
    dataSourceType: 'values',
    items: [
      { id: 'url', label: 'Url', value: 'url' },
      { id: 'form', label: 'Form', value: 'form' },
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