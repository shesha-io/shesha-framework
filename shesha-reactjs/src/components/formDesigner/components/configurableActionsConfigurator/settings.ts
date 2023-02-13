import { DesignerToolbarSettings } from '../../../../interfaces/toolbarSettings';

export const configurableActionsConfiguratorSettingsForm = new DesignerToolbarSettings()
  .addTextField({
    id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
    name: 'name',
    parentId: 'root',
    label: 'Name',
    validate: { required: true },
  })
  .addTextArea({
    id: '8340f638-c466-448e-99cd-fb8c544fe02a',
    name: 'description',
    parentId: 'root',
    hidden: false,
    customVisibility: null,
    label: 'Description',
    autoSize: false,
    showCount: false,
    allowClear: true,
  })
  .addSectionSeparator({
    id: 'bc67960e-77e3-40f2-89cc-f18f94678cce',
    name: 'separatorVisibility',
    parentId: 'root',
    label: 'Visibility',
    title: 'Visibility',
  })
  .addTextArea({
    id: '03959ffd-cadb-496c-bf6d-b742f7f6edc6',
    name: 'customVisibility',
    parentId: 'root',
    label: 'Custom Visibility',
    autoSize: false,
    showCount: false,
    allowClear: false,
    description:
      'Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key.',
  })
  .toJson();
