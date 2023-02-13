import { DesignerToolbarSettings } from "../../../interfaces/toolbarSettings";

export const genericItemActionArgumentsForm = new DesignerToolbarSettings()
  .addTextField({
    id: '12C40CB0-4C60-4171-9380-01D51FDF6212',
    name: 'itemId',
    label: 'Item Id',
    validate: { required: true },
  })
  .toJson();