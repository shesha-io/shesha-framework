import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { ModelPropertyDto } from '@/apis/modelConfigurations';

export const getSettings = (data: ModelPropertyDto) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const dataTabId = nanoid();
  const settingsFormatId = nanoid();
  const appearanceTabId = nanoid();
  const securityTabId = nanoid();

  return {
    components: new DesignerToolbarSettings(data)
      .addSearchableTabs({
        id: searchableTabsId,
        propertyName: 'settingsTabs',
        parentId: 'root',
        label: 'Settings',
        hideLabel: true,
        labelAlign: 'right',
        size: 'small',
        tabs: [
          {
            key: '1',
            title: 'Common',
            id: commonTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({ id: nanoid(), parentId: commonTabId, inputType: 'textField', propertyName: 'name', label: 'Name', validate: { required: true }, })
              .addSettingsInput({ id: nanoid(), parentId: commonTabId, inputType: 'textField', propertyName: 'label', label: 'Label', validate: { required: true } })
              .addSettingsInput({ id: nanoid(), parentId: commonTabId, inputType: 'textArea', propertyName: 'description', label: 'Description',})
              .toJson(),
            ]
          },
          {
            key: '2',
            title: 'Data type and format',
            id: dataTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({ id: nanoid(), parentId: dataTabId, inputType: 'dropdown', propertyName: 'dataType', label: 'Data type', validate: { required: true },
                customEnabled: 'return data.source != 1;', mode: 'single',
                dropdownOptions: [
                  { value: 'string', label: 'String' },
                  { value: 'float',  label: 'float' },
                  { value: 'int32',  label: 'int32' },
                  { value: 'int64',  label: 'int64' },
                  { value: 'decimal', label: 'decimal' },
                  { value: 'date-time', label: 'Date time' },
                  { value: 'date', label: 'Date' },
                  { value: 'time', label: 'Time' },
                  { value: 'boolean', label: 'Boolean' },
                  { value: 'reference-list-item', label: 'Reference list' },
                  { value: 'entity', label: 'Entity reference' },
                  { value: 'multi-entity', label: 'Multiple Entity reference' },
                  { value: 'array-entity', label: 'List of Entities' },
                  { value: 'array', label: 'Object list' },
                  { value: 'file', label: 'File' },
                  { value: 'advanced', label: 'Advanced' },
                  { value: 'object', label: 'Object' },
                  { value: 'geometry', label: 'Geometry' },
                  /*
                  { value: 'number', label: 'Number' },
                  { value: 'double', label: 'double' },
                  { value: 'object-reference', label: 'Object' },
                  { value: 'json', label: 'JSON' },
                  listOf: 'external-list',
                  */
                ]
              })

              // Date & Time format
              .addSettingsInputRow({ id: nanoid(), parentId: dataTabId, inputs: [
                  { id: nanoid(), type: 'textField', propertyName: 'dataFormat', label: 'Date format', 
                    tooltip: 'Enter the format for this property. Also, note that you can use moment display options. See https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/',
                  }],
                  hidden: { _code: 'return getSettingValue(data?.dataType) !== \'date\' && getSettingValue(data?.dataType) !== \'date-time\';', _mode: 'code', '_value': false },
              })
              .addSettingsInputRow({ id: nanoid(), parentId: dataTabId, inputs: [
                  { id: nanoid(), type: 'textField', propertyName: 'dataFormat', label: 'Time format',
                    tooltip: 'Enter the format for this property. Also, note that you can use moment display options. See https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/',
                  }],
                  hidden: { '_code': 'return getSettingValue(data?.dataType) !== \'time\';', '_mode': 'code', '_value': false },
              })

              // String format

              .addContainer({ id: nanoid(), parentId: dataTabId, hidden: { '_code': 'return getSettingValue(data?.dataType) !== \'string\';', '_mode': 'code', '_value': false },
                components: [...new DesignerToolbarSettings()
                  .addSettingsInput({ id: nanoid(), parentId: settingsFormatId, inputType: 'dropdown', propertyName: 'dataFormat', label: 'String format',
                    customEnabled: 'return data.source != 1;', mode: 'single',
                    dropdownOptions: [
                      { label: 'single line', value: 'singleline' },
                      { label: 'multiline', value: 'multiline' },
                      { label: 'html', value: 'html' },
                      { label: 'json', value: 'json' },
                      { label: 'javascript', value: 'javascript' },
                      { label: 'password', value: 'password' },
                      { label: 'email', value: 'email' },
                      { label: 'phone', value: 'phone' }
                    ]
                  })
                  .addSettingsInput({ id: nanoid(), parentId: dataTabId, inputType: 'numberField', propertyName: 'minLength', label: 'Min Length', 
                    editMode: { '_code': 'return !getSettingValue(data.sizeHardcoded);', '_mode': 'code', '_value': false } as any,
                  })
                  .addSettingsInput({ id: nanoid(), parentId: dataTabId, inputType: 'numberField', propertyName: 'maxLength', label: 'Max Length', 
                    editMode: { '_code': 'return !getSettingValue(data.sizeHardcoded);', '_mode': 'code', '_value': false } as any,
                  })
                  .addSettingsInput({ id: nanoid(), parentId: dataTabId, inputType: 'textField', propertyName: 'regExp', label: 'Regular Expression', 
                    editMode: { '_code': 'return !getSettingValue(data.regExpHardcoded);', '_mode': 'code', '_value': false } as any,
                  })
                  .toJson()
                ],
              })


              .addSettingsInput({ id: nanoid(), parentId: dataTabId, inputType: 'textField', propertyName: 'label', label: 'Label', validate: { required: true } })
              .toJson(),
            ]
          }
        ],
      }).toJson(),
    formSettings: {
      colon: false,
      layout: 'vertical' as FormLayout,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    },
  };
};