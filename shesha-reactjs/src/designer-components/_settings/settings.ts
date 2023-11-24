import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';

export const getSettings = () =>
  new DesignerToolbarSettings()
    .addCheckbox({
      id: '24a8be15-98eb-40f7-99ea-ebb602693e9c',
      propertyName: 'disabled',
      parentId: 'root',
      label: 'Disabled',
      jsSetting: true,
    })
    .addCheckbox({
      id: '40024b1c-edd4-4b5d-9c85-1dda6fb8db6c',
      propertyName: 'allowAdd',
      parentId: 'root',
      label: 'Allow Add',
      validate: {},
      hidden: {_code: 'return getSettingValue(data?.disabled) ?? false;', _mode: 'value', _value: false} as any,
      jsSetting: true,
    })
    .addCheckbox({
      id: '6b3d298a-0e82-4420-ae3c-38bf5a2246d4',
      propertyName: 'allowDelete',
      parentId: 'root',
      label: 'Allow Remove',
      validate: {},
      hidden: {_code: 'return getSettingValue(data?.disabled) ?? false;', _mode: 'value', _value: false} as any,
      jsSetting: true,
    })
    .addCollapsiblePanel({
      id: '11114bf6-f76d-4139-a850-c99bf06c8b69',
      propertyName: 'pnlDisplay',
      parentId: 'root',
      label: 'Display',
      labelAlign: "left",
      expandIconPosition: "start",
      ghost: true,
      collapsible: 'header',
      hidden: {_code: 'return getSettingValue(data?.disabled) ?? false;', _mode: 'code', _value: false} as any,
      content: {
        id:'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
        components: [...new DesignerToolbarSettings()    
          .addPropertyAutocomplete({
            id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
            propertyName: 'componentName',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Component name',
            validate: {
              required: true,
            },
          }).toJson()
        ]
      }
    })
    .toJson();
