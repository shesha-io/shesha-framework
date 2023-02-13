import { DesignerToolbarSettings } from "../../../interfaces/toolbarSettings";

export const navigateArgumentsForm = new DesignerToolbarSettings()
  .addTextField({
    id: '12C40CB0-4C60-4171-9380-01D51FDF6212',
    name: 'target',
    parentId: 'root',
    label: 'Target Url',
    validate: { required: true },
  })
  .toJson();
