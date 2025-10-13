import { nanoid } from '@/utils/uuid';
import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';

export const configurableActionsConfiguratorSettingsForm = new DesignerToolbarSettings()
  .addTextField({
    id: nanoid(),
    propertyName: 'label',
    parentId: 'root',
    label: 'Label',
  })
  .addTextField({
    id: nanoid(),
    propertyName: 'propertyName',
    parentId: 'root',
    label: 'Property name',
    validate: { required: true },
  })
  .addTextArea({
    id: nanoid(),
    propertyName: 'description',
    parentId: 'root',
    hidden: false,
    label: 'Description',
    autoSize: false,
    showCount: false,
    allowClear: true,
  })
  .addSectionSeparator({
    id: nanoid(),
    propertyName: 'separatorVisibility',
    parentId: 'root',
    label: 'Visibility',
  })
  .addCheckbox({
    id: 'bf1823d6-dca4-408a-b7d8-5b42eacb076d',
    propertyName: 'hidden',
    parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
    label: 'hide',
  })
  .addPermissionAutocomplete({
    id: '4d81ae9d-d222-4fc1-85b2-4dc3ee6a3721',
    propertyName: 'permissions',
    label: 'Permissions',
    labelAlign: 'right',
    parentId: 'root',
    hidden: false,
    validate: {},
    jsSetting: true,
  })
  .toJson();
