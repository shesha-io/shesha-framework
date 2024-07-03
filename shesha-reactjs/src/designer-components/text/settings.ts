import { nanoid } from '@/utils/uuid';
import { DesignerToolbarSettings } from '@/interfaces';
import {
  FONT_SIZES,
  PADDING_SIZES, 
} from './models';
import {
  DEFAULT_CONTENT_DISPLAY,
  DEFAULT_CONTENT_TYPE,
  DEFAULT_PADDING_SIZE,
} from './utils';

export const settingsFormMarkup = new DesignerToolbarSettings()
  .addCollapsiblePanel({
    id: '11114bf6-f76d-4139-a850-c99bf06c8b69',
    propertyName: 'pnlDisplay',
    parentId: 'root',
    label: 'Display',
    labelAlign: "left",
    expandIconPosition: "start",
    ghost: true,
    collapsible: 'header',
    content: {
      id:'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
      components: [...new DesignerToolbarSettings()    
        .addContextPropertyAutocomplete({
          id: '936859e7-0342-4a7d-a8f1-c2ae444defee',
          propertyName: 'propertyName',
          parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Property name',
          validate: { required: true },
        })
        .addDropdown({
          id: nanoid(),
          propertyName: 'textType',
          parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Type',
          allowClear: false,
          values: [
            {
              label: 'Span',
              value: 'span',
              id: '32ebcc5b-6775-4b34-b856-d7ed42f33c3b',
            },
            {
              label: 'Paragraph',
              value: 'paragraph',
              id: 'f3622f5e-3dc3-452b-aa57-2273f65b9fdc',
            },
            {
              label: 'Title',
              value: 'title',
              id: '3e6a5ac8-bf51-48fb-b5c1-33ba455a1246',
            },
          ],
          dataSourceType: 'values',
        })
        .addDropdown({
          id: nanoid(),
          propertyName: 'contentDisplay',
          parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Content Display',
          allowClear: false,
          defaultValue: DEFAULT_CONTENT_DISPLAY,
          values: [
            {
              label: 'Content',
              value: 'content',
              id: 'ed3f59ac-baa9-4842-8744-4174340fc69b',
            },
            {
              label: 'Property name',
              value: 'name',
              id: 'a232c553-fb24-4a44-af0a-067a803a7e83',
            },
          ],
          dataSourceType: 'values',
        })
        .addDropdown({
          id: nanoid(),
          propertyName: 'textAlign',
          parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Text Align',
          allowClear: false,
          defaultValue: 'start',
          values: [
            {
              label: 'Left',
              value: 'start',
              id: '32ebcc5b-6775-4b34-b856-d7ed42f33c3b',
            },
            {
              label: 'Center',
              value: 'center',
              id: 'f3622f5e-3dc3-452b-aa57-2273f65b9fdc',
            },
            {
              label: 'Right',
              value: 'end',
              id: '3e6a5ac8-bf51-48fb-b5c1-33ba455a1246',
            },
          ],
          dataSourceType: 'values',
        })
        .addTextArea({
          id: 'b9857800-eb4d-4303-b1ac-6f9bc7f140ad',
          propertyName: 'content',
          parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Content',
          validate: {
            required: true,
          },
          hidden: {_code: 'return getSettingValue(data?.contentDisplay) === "name";', _mode: 'code', _value: false} as any,
        })
        .addCheckbox({
          id: '123498f1-1e05-479d-b119-d038cb7d398d',
          propertyName: 'hidden',
          parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Hidden?',
        })
        .toJson()
      ]
    }
  })
  .addCollapsiblePanel({
    id: '211114bf6-f76d-4139-a850-c99bf06c8b69',
    propertyName: 'pnlData',
    parentId: 'root',
    label: 'Data type and format',
    labelAlign: "left",
    expandIconPosition: "start",
    ghost: true,
    collapsible: 'header',
    content: {
      id:'2pnl54bf6-f76d-4139-a850-c99bf06c8b69',
      components: [...new DesignerToolbarSettings()    
      .addDropdown({
          id: '747589ce-a289-44b9-b713-01d072ac9d01',
          parentId: '2pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          propertyName: 'dataType',
          jsSetting: false,
          label: 'Data Type',
          defaultValue: 'string',
          values: [
            {
              id: '7f9bbdae-c7df-4fd4-8373-97cee736b51dv-',
              label: 'string',
              value: 'string',
            },
            {
              id: '9091637e-28ef-4d74-90eb-57dd0b6d5ee2',
              label: 'date time',
              value: 'date-time',
            },
            {
              id: '3bd07704-5593-4b4e-914f-fd3c551330bb',
              label: 'number',
              value: 'number',
            },
            {
              id: 'cc7c0357-b862-46ca-8e07-346e0cb8cf81',
              label: 'boolean',
              value: 'boolean',
            },
          ],
          dataSourceType: 'values',
        })
        .addTextField({
          id: '0a68e412-0636-451a-9add-cf7d461dcc17',
          parentId: '2pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          propertyName: 'dateFormat',
          label: 'Format',
          placeholder: 'Date Format',
          hidden: {_code: 'return  getSettingValue(data?.dataType) !== "date-time";', _mode: 'code', _value: false} as any,
        })
        .addDropdown({
          id: 'd5bb0113-144e-4fb3-8246-e9a7f12462b9',
          parentId: '2pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          propertyName: 'numberFormat',
          label: 'Number format',
          defaultValue: 'round',
          values: [
            {
              id: '678d8042-00c7-46e6-b814-5fc2b10551fc',
              label: 'currency',
              value: 'currency',
            },
            {
              id: '56d2c101-cc9c-4340-8c2a-f9d10df62983',
              label: 'double',
              value: 'double',
            },
            {
              id: '737c0a7d-7248-4688-9f0e-2b6b6ceaef55',
              label: 'round',
              value: 'round',
            },
            {
              id: '503e356f-b159-4caf-be63-a2376586e2b0',
              label: 'thousand separator',
              value: 'thousandSeparator',
            },
          ],
          dataSourceType: 'values',
          hidden: {_code: 'return  getSettingValue(data?.dataType) !== "number";', _mode: 'code', _value: false} as any,
        }).toJson()
      ]
    }
  })
  .addCollapsiblePanel({
    id: '31114bf6-f76d-4139-a850-c99bf06c8b69',
    propertyName: 'pnlColor',
    parentId: 'root',
    label: 'Color',
    labelAlign: "left",
    expandIconPosition: "start",
    ghost: true,
    collapsible: 'header',
    content: {
      id:'3pnl54bf6-f76d-4139-a850-c99bf06c8b69',
      components: [...new DesignerToolbarSettings()    
      .addDropdown({
          id: '6d29cf2c-96fe-40ce-be97-32e9f5d0fe40',
          propertyName: 'contentType',
          parentId: '3pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Color',
          defaultValue: [DEFAULT_CONTENT_TYPE],
          values: [
            {
              label: 'Default',
              value: '',
              id: '32ebcc5b-6775-4b34-b856-d7ed42f33c3c',
            },
            {
              label: 'Primary',
              value: 'primary',
              id: '32ebcc5b-6775-4b34-b856-d7ed42f33c3e',
            },
            {
              label: 'Secondary',
              value: 'secondary',
              id: '32ebcc5b-6775-4b34-b856-d7ed42f33c3b',
            },
            {
              label: 'Success',
              value: 'success',
              id: 'f3622f5e-3dc3-452b-aa57-2273f65b9fdc',
            },
            {
              label: 'Warning',
              value: 'warning',
              id: '3e6a5ac8-bf51-48fb-b5c1-33ba455a1246',
            },
            {
              label: 'Info',
              value: 'info',
              id: '32ebcc5b-6775-4b34-b856-d7ed42f33c3b',
            },
            {
              label: 'Error',
              value: 'danger',
              id: '4b3830fa-6b2a-4493-a049-2a4a5be4b0a4',
            },
            {
              label: '(Custom Color)',
              value: 'custom',
              id: nanoid(),
            },
          ],
          dataSourceType: 'values',
        })
        .addColorPicker({
          id: nanoid(),
          propertyName: 'color',
          parentId: '3pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Custom Color',
          title: 'Pick Content Color',
          hidden: {_code: 'return  getSettingValue(data?.contentType) !== "custom";', _mode: 'code', _value: false} as any,
          allowClear: true,
          showText: true,
        })
        .addColorPicker({
          id: nanoid(),
          parentId: '3pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          propertyName: 'backgroundColor',
          label: 'Background Color',
          title: 'Pick Content Color',
          allowClear: true,
          showText: true,
        }).toJson()
      ]
    }
  })
  .addCollapsiblePanel({
    id: '41114bf6-f76d-4139-a850-c99bf06c8b69',
    propertyName: 'pnlFont',
    parentId: 'root',
    label: 'Font',
    labelAlign: "left",
    expandIconPosition: "start",
    ghost: true,
    collapsible: 'header',
    content: {
      id:'4pnl54bf6-f76d-4139-a850-c99bf06c8b69',
      components: [...new DesignerToolbarSettings()    
      .addDropdown({
          id: 'ccea671b-9144-4266-9cd7-64495cbc6910',
          propertyName: 'level',
          parentId: '4pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Font Size',
          values: [
            {
              label: 'H1',
              value: '1',
              id: '81f0cd35-45b0-4d3e-8960-b6c9c3f7fb6f',
            },
            {
              label: 'H2',
              value: '2',
              id: 'a19ccf4a-27f0-45ae-819a-779668370639',
            },
            {
              label: 'H3',
              value: '3',
              id: '6a755f46-09a6-4e5e-b9fe-8617be7ef8e1',
            },
            {
              label: 'H4',
              value: '4',
              id: '3f8460ca-f50a-4cba-9b5d-6a2b02be14d2',
            },
            {
              label: 'H5',
              value: '5',
              id: '186a71a8-ead4-4bed-8a3b-bc197faac998',
            },
            ...Object.keys(FONT_SIZES).map(key => ({ id: nanoid(), value: key, label: key })),
          ],
          dataSourceType: 'values',
          hidden: {_code: 'return  getSettingValue(data?.textType) !== "title";', _mode: 'code', _value: false} as any,
        })
        .addDropdown({
          id: nanoid(),
          propertyName: 'fontSize',
          parentId: '4pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Font Size',
          values: Object.keys(FONT_SIZES).map(key => ({ id: nanoid(), value: key, label: key })),
          dataSourceType: 'values',
          hidden: {_code: 'return  getSettingValue(data?.textType) === "title";', _mode: 'code', _value: false} as any,
        })
        .addDropdown({
          id: '6edef969-8e4b-4495-92fa-12cd3430fa8e',
          propertyName: 'padding',
          parentId: '4pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Padding',
          defaultValue: DEFAULT_PADDING_SIZE,
          values: [...Object.keys(PADDING_SIZES).map(key => ({ id: nanoid(), value: key, label: key }))],
          dataSourceType: 'values',
        })
        .addCheckbox({
          id: '3cd922a6-22b2-435f-8a46-8cca9fba8bea',
          propertyName: 'code',
          parentId: '4pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Code style?',
        })
        .addCheckbox({
          id: 'aa17f452-0b07-473a-9c7a-986dfc2d37d9',
          propertyName: 'italic',
          parentId: '4pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Italic',
        })
        .addCheckbox({
          id: '883498f1-1e05-479d-b119-d038cb7d398d',
          propertyName: 'copyable',
          parentId: '4pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Copyable?',
        })
        .addCheckbox({
          id: '27cc9d42-1d07-4f70-a17c-50711d03acc5',
          propertyName: 'keyboard',
          parentId: '4pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Keyboard style?',
        })
        .addCheckbox({
          id: '821d3a6c-abdb-4f11-b659-e562c75bada9',
          propertyName: 'delete',
          parentId: '4pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Delete?',
        })
        .addCheckbox({
          id: '3a97e341-7f20-4479-9fa6-d8086e8b9a17',
          propertyName: 'ellipsis',
          parentId: '4pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Ellipsis?',
        })
        .addCheckbox({
          id: '23f1f1d7-7eb8-440b-8620-bb059b6938e4',
          propertyName: 'mark',
          parentId: '4pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Marked style?',
        })
        .addCheckbox({
          id: 'cbfdec6c-8fe5-4d35-b067-6c00de8ba311',
          propertyName: 'strong',
          parentId: '4pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Strong?',
          hidden: {_code: 'return  getSettingValue(data?.textType) === "title";', _mode: 'code', _value: false} as any,
        })
        .addCheckbox({
          id: '12b8a36a-3aec-414c-942f-a57e37f00901',
          propertyName: 'underline',
          parentId: '4pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Underline?',
        }).toJson()
      ]
    }
  })
  .addCollapsiblePanel({
    id: '51114bf6-f76d-4139-a850-c99bf06c8b69',
    propertyName: 'pnlStyle',
    parentId: 'root',
    label: 'Style',
    labelAlign: "left",
    expandIconPosition: "start",
    ghost: true,
    collapsible: 'header',
    content: {
      id:'5pnl54bf6-f76d-4139-a850-c99bf06c8b69',
      components: [...new DesignerToolbarSettings()    
      .addCodeEditor({
          id: '06ab0599-914d-4d2d-875c-765a495472f8',
          propertyName: 'style',
          label: 'Style',
          parentId: '5pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          validate: {},
          settingsValidationErrors: [],
          description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
          exposedVariables: [
            { id: '06ab0599-914d-4d2d-875c-765a495472f6', name: 'data', description: 'Form values', type: 'object' },
          ],
          //availableConstants: [],
          mode: 'dialog',
        }).toJson()
      ]
    }
  })
  .addCollapsiblePanel({
    id: 'eb91c2f5-592e-4f60-ba1a-f1d2011a5290',
    propertyName: 'pnlSecurity',
    parentId: 'root',
    label: 'Security',
    labelAlign: "left",
    expandIconPosition: "start",
    ghost: true,
    collapsible: 'header',
    content: {
      id:'pnl24bf6-f76d-4139-a850-c99bf06c8b71',
      components: [...new DesignerToolbarSettings() 
        .addPermissionAutocomplete({
          id: '4d81ae9d-d222-4fc1-85b2-4dc3ee6a3721',
          propertyName: 'permissions',
          label: 'Permissions',
          labelAlign: 'right',
          parentId: 'root',
          hidden: false,
          validate: {},
        }).toJson()
      ]
}
})
  .toJson();
