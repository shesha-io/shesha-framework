import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';

export const getSettings = (data: any) =>
  new DesignerToolbarSettings(data)
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
        components: new DesignerToolbarSettings()
          .addCheckbox({
            id: nanoid(),
            propertyName: 'block',
            parentId: 'root',
            label: 'Block',
            defaultValue: false,
          })
          .toJson(),
      },
    })
    .toJson();
