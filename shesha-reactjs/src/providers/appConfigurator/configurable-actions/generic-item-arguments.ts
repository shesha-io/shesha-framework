import { FormMarkupFactory } from "@/interfaces/configurableAction";

export const genericItemActionArgumentsForm: FormMarkupFactory = ({ fbf }) => {
  return fbf().addSettingsInput({
    id: '12C40CB0-4C60-4171-9380-01D51FDF6212',
    inputType: 'textField',
    propertyName: 'itemId',
    label: 'Item Id',
    validate: { required: true },
  })
    .toJson();
};
