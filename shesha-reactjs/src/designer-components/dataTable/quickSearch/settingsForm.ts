import { SettingsFormMarkupFactory } from '@/index';
import { nanoid } from '@/utils/uuid';

export const getSettings: SettingsFormMarkupFactory = ({ fbf }) => {
  return fbf()
    .addCollapsiblePanel({
      id: nanoid(),
      propertyName: 'separatorDisplay',
      parentId: 'root',
      label: 'Display',
      labelAlign: 'right',
      expandIconPosition: 'start',
      ghost: true,
      hideWhenEmpty: true,
      header: {
        id: nanoid(),
        components: [],
      },
      content: {
        id: nanoid(),
        components: fbf()
          .addCheckbox({
            id: nanoid(),
            propertyName: 'block',
            parentId: 'root',
            label: 'Block',
          })
          .toJson(),
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
        components: [...fbf()
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
};
