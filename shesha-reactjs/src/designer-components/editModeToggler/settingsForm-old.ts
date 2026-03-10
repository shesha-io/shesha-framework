import { SettingsFormMarkupFactory } from '@/interfaces';
import { nanoid } from '@/utils/uuid';

export const getSettings: SettingsFormMarkupFactory = ({ fbf }) => {
  return fbf()
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
          ...fbf()
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
          ...fbf()
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
};
