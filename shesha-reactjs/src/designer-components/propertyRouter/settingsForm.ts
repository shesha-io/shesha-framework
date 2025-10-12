import { FormRawMarkup } from '@/index';
import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';


export const getSettings = (data: object): FormRawMarkup =>
  new DesignerToolbarSettings(data)
    .addCollapsiblePanel({
      id: '11164664-cbc9-4cef-babc-6fbea44cd0ca',
      propertyName: 'pnlDisplay',
      parentId: 'root',
      label: 'Display',
      labelAlign: 'left',
      expandIconPosition: 'start',
      ghost: true,
      collapsible: 'header',
      content: {
        id: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
        components: [
          ...new DesignerToolbarSettings()
            .addTextField({
              id: '6d39921b-d20e-49cf-bc54-ec584f63be5c',
              propertyName: 'componentName',
              parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
              label: 'Component name',
              validate: { required: true },
              jsSetting: false,
            })
            .addCheckbox({
              id: 'bf1823d6-dca4-408a-b7d8-5b42eacb076d',
              propertyName: 'hidden',
              parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
              label: 'hide',
            })
            .addEditMode({
              id: 'abc823d6-dca4-408a-b7d8-5b42eacb1234',
              propertyName: 'editMode',
              parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
              label: 'Edit mode',
            })
            .addTextField({
              id: '123423d6-dca4-408a-b7d8-5b42eacb1234',
              propertyName: 'propertyRouteName',
              parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
              label: 'Property route name',
            })
            .toJson(),
        ],
      },
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
          }).toJson(),
        ],
      },
    })
    .toJson();
