import { nanoid } from '@/utils/uuid';
import { DesignerToolbarSettings } from '@/interfaces';

export const settingsFormMarkup = new DesignerToolbarSettings()
  .addCollapsiblePanel({
    id: nanoid(),
    propertyName: 'pnlDisplay',
    parentId: 'root',
    label: 'Display',
    labelAlign: 'left',
    expandIconPosition: 'start',
    ghost: true,
    collapsible: 'header',
    content: {
      id: nanoid(),
      components: [
        ...new DesignerToolbarSettings()
          .addContextPropertyAutocomplete({
            id: nanoid(),
            propertyName: 'propertyName',
            label: 'Property name',
            validate: { required: true },
          })
          .addTextField({
            id: nanoid(),
            propertyName: 'label',
            label: 'Label',
          })
          .addCheckbox({
            id: nanoid(),
            propertyName: 'hidden',
            label: 'hide',
          })
          .addCheckbox({
            id: nanoid(),
            propertyName: 'hideLabel',
            label: 'Hide Label',
          })
          .addEditMode({
            id: nanoid(),
            propertyName: 'editMode',
            label: 'Edit mode',
          })
          .toJson(),
      ],
    },
  })
  .addCollapsiblePanel({
    id: nanoid(),
    propertyName: 'pnlData',
    parentId: 'root',
    label: 'Data',
    labelAlign: 'left',
    expandIconPosition: 'start',
    ghost: true,
    collapsible: 'header',
    content: {
      id: nanoid(),
      components: [
        ...new DesignerToolbarSettings()
          .addNumberField({
            id: nanoid(),
            propertyName: 'min',
            label: 'Minimum',
          })
          .addNumberField({
            id: nanoid(),
            propertyName: 'max',
            label: 'Maximum',
          })
          .toJson(),
      ],
    },
  })
  .addCollapsiblePanel({
    id: nanoid(),
    propertyName: 'pnlStyle',
    parentId: 'root',
    label: 'Style',
    labelAlign: 'left',
    expandIconPosition: 'start',
    ghost: true,
    collapsible: 'header',
    content: {
      id: nanoid(),
      components: [
        ...new DesignerToolbarSettings()
          .addCodeEditor({
            id: nanoid(),
            propertyName: 'style',
            label: 'Style',
            parentId: 'root',
            mode: 'dialog',
          })
          .toJson(),
      ],
    },
  })
  .toJson();
