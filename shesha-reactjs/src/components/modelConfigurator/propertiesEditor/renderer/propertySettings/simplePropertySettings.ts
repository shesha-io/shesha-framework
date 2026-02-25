import { FormBuilder, FormBuilderFactory } from "@/form-factory/interfaces";
import { nanoid } from "@/utils/uuid";

export const SimplePropertySettings = (fbf: FormBuilderFactory, dataTabId: string, type: 'full' | 'array', propName: string = ''): FormBuilder => {
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
    // { value: 'geometry', label: 'Geometry' },
  ];

  const typesArrayList = [
    { value: 'string', label: 'String' },
    { value: 'number', label: 'Number' },
    { value: 'date-time', label: 'Date time' },
    { value: 'date', label: 'Date' },
    { value: 'time', label: 'Time' },
    { value: 'boolean', label: 'Boolean' },
    // { value: 'geometry', label: 'Geometry' },
  ];

  return fbf(dataTabId)
    .addSettingsInput({ inputType: 'dropdown', propertyName: `${propName}dataType`, label: 'Data Type', validate: { required: true },
      editMode: { _value: 'inherited', _mode: 'code', _code: 'return data.allowEdit;' } as any,
      dropdownOptions: type === 'full' ? typesFullList : typesArrayList,
      allowClear: true, tooltip: 'Select the data type for this property.',
      onChangeSetting: (_value, _data, setFormData) => {
        const newData = { formatting: { defaultEditor: null } };
        setFormData({ values: newData, mergeValues: true });
      },
    })

    // Date & Time format
    .addSettingsInput({ inputType: 'textField', propertyName: `${propName}dataFormat`, label: 'Date Format',
      tooltip: 'Enter the format for this property. Also, note that you can use moment display options. See https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/',
      visibleJs: `return data?.${codePropName}dataType === \'date\' || data?.${codePropName}  dataType === \'date-time\';`,
    })
    .addSettingsInput({ inputType: 'textField', propertyName: `${propName}dataFormat`, label: 'Time Format',
      tooltip: 'Enter the format for this property. Also, note that you can use moment display options. See https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/',
      visibleJs: `return data?.${codePropName}dataType === \'time\';`,
    })

  // String format

    .addContainer({ id: stringFormatId, visibleJs: `return data?.${codePropName}dataType === \'string\';`,
      components: [...fbf(stringFormatId)
        .addSettingsInput({ inputType: 'dropdown', propertyName: `${propName}dataFormat`, label: 'String Format',
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
        .addSettingsInput({ inputType: 'numberField', propertyName: `${propName}minLength`, label: 'Min Length',
          editMode: { _code: `return !data.${codePropName}sizeHardcoded;`, _mode: 'code', _value: false } as any,
        })
        .addSettingsInput({ inputType: 'numberField', propertyName: `${propName}maxLength`, label: 'Max Length',
          editMode: { _code: `return !data.${codePropName}sizeHardcoded;`, _mode: 'code', _value: false } as any,
        })
        .toJson(),
      ],
    })

  // Number format

    .addContainer({ id: numberFormatId, visibleJs: `return data?.${codePropName}dataType === \'number\';`,
      components: [...fbf(numberFormatId)
        .addSettingsInput({ inputType: 'dropdown', propertyName: `${propName}dataFormat`, label: 'Number Format',
          validate: { required: true },
          editMode: { _value: 'inherited', _mode: 'code', _code: 'return data.allowEdit;' } as any,
          dropdownOptions: [
            { label: 'Integer', value: 'int64' },
            { label: 'Float', value: 'float' },
            { label: 'Decimal', value: 'decimal' },
          ],
        })
        .addSettingsInputRow({ inputs: [
          { type: 'numberField', propertyName: `${propName}formatting.numDecimalPlaces`, label: 'Num decimal places',
            editMode: { _value: 'inherited', _mode: 'code', _code: 'return data.allowEdit;' } as any,
          },
          { type: 'switch', propertyName: `${propName}formatting.showAsPercentage`, label: 'Show as percentage' },
        ], visibleJs: `return data?.${codePropName}dataFormat === \'decimal\';` })
        .addSettingsInputRow({ inputs: [
          { type: 'textField', propertyName: `${propName}formatting.thousandsSeparator`, label: 'Thousands separator' },
          { type: 'textField', propertyName: `${propName}formatting.customFormat`, label: 'Custom format', tooltip: 'numbro.js like format (https://numbrojs.com/old-format.html)' },
        ],
        })
        .addSettingsInputRow({ inputs: [
          { type: 'numberField', propertyName: `${propName}min`, label: 'Min', editMode: { _code: `return !data.${codePropName}sizeHardcoded;`, _mode: 'code', _value: false } as any },
          { type: 'numberField', propertyName: `${propName}max`, label: 'Max', editMode: { _code: `return !data.${codePropName}sizeHardcoded;`, _mode: 'code', _value: false } as any },
        ],
        })
        .toJson(),
      ],
    })

  // Reference list format

    .addContainer({ id: refListFormatId, visibleJs: `return data?.${codePropName}dataType === \'reference-list-item\';`,
      components: [...fbf(refListFormatId)
        .addSettingsInput({ inputType: 'referenceListAutocomplete', propertyName: `${propName}referenceListId`, label: 'Reference List', validate: { required: true } })
        .toJson(),
      ],
    })
  ;
};
