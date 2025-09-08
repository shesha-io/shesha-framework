import { DesignerToolbarSettings } from "@/interfaces/toolbarSettings";

export const genericItemActionArgumentsForm = new DesignerToolbarSettings()
  .addSettingsInput({
    id: '12C40CB0-4C60-4171-9380-01D51FDF6212',
    propertyName: 'itemId',
    label: 'Item Id',
    validate: { required: true },
  })
  .toJson();
