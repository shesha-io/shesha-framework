import { DesignerToolbarSettings } from "@/index";
import { nanoid } from "@/utils/uuid";

export const SimplePropertySettings = (dataTabId: string, type: 'full' | 'array', propName: string = ''): DesignerToolbarSettings => {
  const codePropName = propName.replaceAll('.', '?.');

  const stringFormatId = nanoid();
  const numberFormatId = nanoid();
  const refListFormatId = nanoid();

  const typesFullList = [
    { value: 'string', label: 'String' },
    { value: 'number', label: 'Number' },
    { value: 'date-time', label: 'Date time' },
    { value: 'date', label: 'Date' },
    { value: 'time', label: 'Time' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'reference-list-item', label: 'Reference list value' },
    { value: 'entity', label: 'Entity reference (single)' },
    { value: 'object', label: 'Nested object' },
    { value: 'array', label: 'List' },
    { value: 'file', label: 'File' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'geometry', label: 'Geometry' },
  ];

  const typesArrayList = [
    { value: 'string', label: 'String' },
    { value: 'number', label: 'Number' },
    { value: 'date-time', label: 'Date time' },
    { value: 'date', label: 'Date' },
    { value: 'time', label: 'Time' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'geometry', label: 'Geometry' },
  ];

  return new DesignerToolbarSettings()
    .addSettingsInput({ parentId: dataTabId, inputType: 'dropdown', propertyName: `${propName}dataType`, label: 'Data Type', validate: { required: true },
      editMode: { _value: 'inherited', _mode: 'code', _code: 'return !data.createdInDb && data.source != 1;' } as any,
      mode: 'single', dropdownOptions: type === 'full' ? typesFullList : typesArrayList,
      allowClear: true, tooltip: 'Select the data type for this property.',
      onChangeSetting: (_value, _data, setFormData) => {
        const newData = { formatting: { defaultEditor: null } };
        setFormData({ values: newData, mergeValues: true });
      },
    })

    // Date & Time format
    .addSettingsInputRow({ parentId: dataTabId, inputs: [
      { type: 'textField', propertyName: `${propName}dataFormat`, label: 'Date Format',
        tooltip: 'Enter the format for this property. Also, note that you can use moment display options. See https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/',
      }],
    hidden: { _code: `return data?.${codePropName}dataType !== \'date\' && data?.${codePropName}  dataType !== \'date-time\';`, _mode: 'code', _value: false },
    })
    .addSettingsInputRow({ parentId: dataTabId, inputs: [
      { type: 'textField', propertyName: `${propName}dataFormat`, label: 'Time Format',
        tooltip: 'Enter the format for this property. Also, note that you can use moment display options. See https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/',
      }],
    hidden: { _code: `return data?.${codePropName}dataType !== \'time\';`, _mode: 'code', _value: false },
    })

  // String format

    .addContainer({ id: stringFormatId, parentId: dataTabId, hidden: { _code: `return data?.${codePropName}dataType !== \'string\';`, _mode: 'code', _value: false },
      components: [...new DesignerToolbarSettings()
        .addSettingsInput({ parentId: stringFormatId, inputType: 'dropdown', propertyName: `${propName}dataFormat`, label: 'String Format', mode: 'single',
          dropdownOptions: [
            { label: 'Single line', value: 'singleline' },
            { label: 'Multiline', value: 'multiline' },
            { label: 'Html', value: 'html' },
            { label: 'Json', value: 'json' },
            { label: 'Javascript', value: 'javascript' },
            { label: 'Password', value: 'password' },
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'phone' },
          ],
        })
        .addSettingsInput({ parentId: stringFormatId, inputType: 'numberField', propertyName: `${propName}minLength`, label: 'Min Length',
          editMode: { _code: `return !data.${codePropName}sizeHardcoded;`, _mode: 'code', _value: false } as any,
        })
        .addSettingsInput({ parentId: stringFormatId, inputType: 'numberField', propertyName: `${propName}maxLength`, label: 'Max Length',
          editMode: { _code: `return !data.${codePropName}sizeHardcoded;`, _mode: 'code', _value: false } as any,
        })
        .toJson(),
      ],
    })

  // Number format

    .addContainer({ id: numberFormatId, parentId: dataTabId, hidden: { _code: `return data?.${codePropName}dataType !== \'number\';`, _mode: 'code', _value: false },
      components: [...new DesignerToolbarSettings()
        .addSettingsInput({ parentId: numberFormatId, inputType: 'dropdown', propertyName: `${propName}dataFormat`, label: 'Number format', mode: 'single',
          editMode: { _value: 'inherited', _mode: 'code', _code: 'return !data.createdInDb && data.source != 1;' } as any,
          dropdownOptions: [
            { label: 'Integer', value: 'int64' },
            { label: 'Float', value: 'float' },
            { label: 'Decimal', value: 'decimal' },
          ],
        })
        .addSettingsInputRow({ parentId: numberFormatId, inputs: [
          { type: 'numberField', propertyName: `${propName}formatting.numDecimalPlaces`, label: 'Num decimal places',
            editMode: { _value: 'inherited', _mode: 'code', _code: 'return !data.createdInDb && data.source != 1;' } as any,
          },
          { type: 'switch', propertyName: `${propName}formatting.showAsPercentage`, label: 'Show as percentage' },
        ],
        hidden: { _code: `return data?.${codePropName}dataFormat !== \'decimal\';`, _mode: 'code', _value: false },
        })
        .addSettingsInputRow({ parentId: numberFormatId, inputs: [
          { type: 'switch', propertyName: `${propName}formatting.showThousandsSeparator`, label: 'Thousands separator' },
          { type: 'textField', propertyName: `${propName}formatting.customFormat`, label: 'Custom format', tooltip: 'numbro.js like format (https://numbrojs.com/old-format.html)' },
        ],
        })
        .addSettingsInputRow({ parentId: numberFormatId, inputs: [
          { type: 'numberField', propertyName: `${propName}min`, label: 'Min', editMode: { _code: `return !data.${codePropName}sizeHardcoded;`, _mode: 'code', _value: false } as any },
          { type: 'numberField', propertyName: `${propName}max`, label: 'Max', editMode: { _code: `return !data.${codePropName}sizeHardcoded;`, _mode: 'code', _value: false } as any },
        ],
        })
        .toJson(),
      ],
    })

  // Reference list format

    .addContainer({ id: refListFormatId, parentId: dataTabId, hidden: { _code: `return data?.${codePropName}dataType !== \'reference-list-item\';`, _mode: 'code', _value: false },
      components: [...new DesignerToolbarSettings()
        .addSettingsInput({ parentId: refListFormatId, inputType: 'referenceListAutocomplete', propertyName: `${propName}referenceListId`, label: 'Reference List' })
        .toJson(),
      ],
    })

  ;
};
