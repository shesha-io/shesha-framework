import { SettingsFormMarkupFactory } from '@/interfaces';

export const getSettings: SettingsFormMarkupFactory = ({ fbf }) => {
  return fbf()
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
          ...fbf()
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
            .addEditModeSelector({
              id: 'abc823d6-dca4-408a-b7d8-5b42eacb1234',
              propertyName: 'editMode',
              parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
              label: 'Edit mode',
            })
            .toJson(),
        ],
      },
    })
    .toJson();
};
