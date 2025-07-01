import { nanoid } from '@/utils/uuid';
import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';

export const getSettings = () =>
  new DesignerToolbarSettings()
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
        id: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
        components: [...new DesignerToolbarSettings()
          .addContextPropertyAutocomplete({
            id: nanoid(),
            propertyName: 'propertyName',
            label: 'Property name',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            validate: {
              required: true,
            },
          })
          .addTextField({
            id: '8c898413-7dfd-4322-b610-fce8c35756f8',
            propertyName: 'label',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Label',
          })
          .addCheckbox({
            id: 'EA1BE8D3-69A0-4ABA-AD2A-3ED32B979189',
            propertyName: 'hideLabel',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Hide Label',
            labelAlign: 'right',
            validate: {},
          })
          .addCheckbox({
            id: 'd936689d-8ea3-4f8a-bcc3-d494d27c46fd',
            propertyName: 'hidden',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'hide',
            labelAlign: 'right',
            validate: {},
          })
          .addDropdown({
            id: 'f6c3d710-8d98-47fc-9fe2-7c6312e9a03c',
            propertyName: 'valueSource',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            hidden: false,
            label: 'Value source',
            dataSourceType: 'values',
            values: [
              { id: '17a865b3-8e28-41de-ab40-1fc49a56b31d', label: 'Form', value: 'form' },
              { id: 'edeb7d32-f942-41cc-a941-07b8882d8faa', label: 'Manual', value: 'manual' },
            ],
            validate: { required: true },
            defaultValue: 'manual',
          })
          .addTextField({
            id: '33b16438-9563-438b-a375-8c5f4ccdd727',
            propertyName: 'override',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Override',
            validate: {},
          })
          .addTextField({
            id: '43f91890-9728-47f3-9694-3d893d820c86',
            propertyName: 'value',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Value',
            validate: {},
            hidden: { _code: 'return  getSettingValue(data?.valueSource) !== "manual";', _mode: 'code', _value: false } as any,
          })
          .addTextField({
            id: '821d3a6c-abdb-4f11-b659-e562c75bada9',
            propertyName: 'color',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Color',
            validate: {},
          })
          .addCodeEditor({
            id: '12b8a36a-3aec-414c-942f-a57e37f00901',
            propertyName: 'mappings',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            language: 'json',
            label: 'Default Mappings',
            description: 'Enter the JSON object that should match the structure of the default one provided',
            validate: {},
          })
          .addCodeEditor({
            id: '987c3de1-b959-4670-96f6-9b1747189a6e',
            propertyName: 'style',
            label: 'Style',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            mode: 'dialog',
          })
          .toJson()
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
        id: 'pnl24bf6-f76d-4139-a850-c99bf06c8b71',
        components: [...new DesignerToolbarSettings()
          .addPermissionAutocomplete({
            id: '4d81ae9d-d222-4fc1-85b2-4dc3ee6a3721',
            propertyName: 'permissions',
            label: 'Permissions',
            labelAlign: 'right',
            parentId: 'root',
            hidden: false,
            validate: {},
            jsSetting: true,
          }).toJson()
        ]
      }
    })
    .toJson();
