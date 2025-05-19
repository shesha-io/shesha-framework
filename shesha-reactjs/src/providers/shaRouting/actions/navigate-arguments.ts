import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';

export const navigateArgumentsForm = new DesignerToolbarSettings()
  .addSettingsInputRow({
    id: 'navigation-url-form-row',
    inputs: [
      {
        id: nanoid(),
        type: 'radio',
        propertyName: 'navigationType',
        parentId: 'root',
        label: 'Navigation Type',
        buttonGroupOptions: [
          { icon: 'LinkOutlined', title: 'Url', value: 'url' },
          { icon: 'FormOutlined', title: 'Form', value: 'form' },
        ]
      },
      {
        id: nanoid(),
        type: 'textField',
        propertyName: 'url',
        parentId: 'root',
        label: 'Target URL',
        validate: { required: true },
        hidden: {
          _mode: 'code',
          _code: 'return data?.navigationType !== "url"'
        } as any
      },
      {
        id: nanoid(),
        type: 'formAutocomplete',
        propertyName: 'formId',
        label: 'Form',
        parentId: 'root',
        validate: {
          required: true,
        },
        hidden: {
          _mode: 'code',
          _code: 'return data?.navigationType !== "form"'
        } as any
      }
    ]
  })
  .addSettingsInput({
    id: nanoid(),
    inputType: 'labelValueEditor',
    propertyName: 'queryParameters',
    label: 'Query String Parameters',
    labelName: 'key',
    parentId: 'root',
    labelTitle: 'Key',
    valueName: 'value',
    valueTitle: 'Value'
  })
  .toJson();