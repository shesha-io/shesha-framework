import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';

export const getSettings = (data: any) =>
  new DesignerToolbarSettings(data)
    .addCollapsiblePanel({
      id: nanoid(),
      parentId: 'root',
      propertyName: 'pnlDisplay',
      label: 'Display',
      labelAlign: 'left',
      expandIconPosition: 'start',
      ghost: true,
      collapsible: 'header',
      content: {
        id: 'dfce8149-b595-4686-8778-e93d1b82d1e5',
        components: [
          ...new DesignerToolbarSettings()
            .addContextPropertyAutocomplete({
              id: nanoid(),
              propertyName: 'propertyName',
              label: 'Property name',
              parentId: 'dfce8149-b595-4686-8778-e93d1b82d1e5',
              validate: {
                required: true,
              },
            })
            .addCheckbox({
              id: nanoid(),
              propertyName: 'hidden',
              label: 'hide',
              parentId: 'dfce8149-b595-4686-8778-e93d1b82d1e5',
            })
            .addTextField({
              id: nanoid(),
              propertyName: 'subText',
              label: 'Sub Text',
              parentId: 'dfce8149-b595-4686-8778-e93d1b82d1e5',
            })
            .addButtons({
              id: nanoid(),
              propertyName: 'items',
              label: 'Configure Menu Buttons',
              parentId: 'dfce8149-b595-4686-8778-e93d1b82d1e5',
            })
            .addCheckbox({
              id: nanoid(),
              propertyName: 'showUserInfo',
              label: 'Show User Info',
              parentId: 'dfce8149-b595-4686-8778-e93d1b82d1e5'
            })
            .addTextField({
              id: nanoid(),
              propertyName: 'popOverTitle',
              label: 'Popover Title',
              parentId: 'dfce8149-b595-4686-8778-e93d1b82d1e5',
              hidden: {
                _mode: 'code',
                _code: 'return data?.showUserInfo != true'
              }
            })
            .addFormAutocomplete({
              id: nanoid(),
              propertyName: 'popOverFormId',
              label: 'Popover Form',
              parentId: 'dfce8149-b595-4686-8778-e93d1b82d1e5',
              hidden: {
                _mode: 'code',
                _code: 'return data?.showUserInfo != true'
              }
            })
            .toJson(),
        ],
      },
    })
    .addCollapsiblePanel({
      id: nanoid(),
      propertyName: "pnlStyle",
      parentId: "root",
      label: "Style",
      labelAlign: "left",
      expandIconPosition: "start",
      ghost: true,
      collapsible: "header",
      content: {
        id: '64cf99eb-5b1d-4fae-9ad6-015b7bd5bcad',
        components: [
          ...new DesignerToolbarSettings()
            .addCodeEditor({
              id: nanoid(),
              propertyName: "subTextStyle",
              label: "Sub Text Style",
              parentId: "64cf99eb-5b1d-4fae-9ad6-015b7bd5bcad",
              mode: "dialog",
            })
            .addColorPicker({
              id: nanoid(),
              propertyName: "subTextColor",
              label: "Sub Text Color",
              title: "Sub Text Color",
              allowClear: true,
              showText: true,
              parentId: "64cf99eb-5b1d-4fae-9ad6-015b7bd5bcad",
            })
            .addSlider({
              id: nanoid(),
              propertyName: "subTextFontSize",
              label: "Sub Text Size",
              defaultValue: "12",
              min: "1",
              max: "100",
              parentId: "64cf99eb-5b1d-4fae-9ad6-015b7bd5bcad",
            })
            .addCodeEditor({
              id: nanoid(),
              propertyName: "popOverContentStyle",
              label: "Popover content Style",
              parentId: "64cf99eb-5b1d-4fae-9ad6-015b7bd5bcad",
              mode: "dialog",
            })
            .toJson(),
        ],
      },
    })
    .addCollapsiblePanel({
      id: nanoid(),
      propertyName: 'pnlSecurity',
      parentId: 'root',
      label: 'Security',
      labelAlign: 'left',
      expandIconPosition: 'start',
      ghost: true,
      collapsible: 'header',
      content: {
        id: 'fccb6b17-656d-43c0-8144-0b91c454da1d',
        components: [
          ...new DesignerToolbarSettings()
            .addPermissionAutocomplete({
              id: nanoid(),
              propertyName: 'permissions',
              label: 'Permissions',
              labelAlign: 'right',
              parentId: 'fccb6b17-656d-43c0-8144-0b91c454da1d',
              hidden: false,
              validate: {},
            })
            .toJson(),
        ],
      },
    })
    .toJson();
