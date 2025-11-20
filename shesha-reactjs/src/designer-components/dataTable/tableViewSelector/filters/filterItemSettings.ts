import { FormMarkupFactory } from '@/interfaces/configurableAction';

export const getFiltersSettingsForm: FormMarkupFactory = ({ fbf }) => {
  return fbf().addSettingsInput({
    id: 's4gmBg31azZC0UjZjpfTm',
    inputType: 'textField',
    propertyName: 'name',
    label: 'Title',
    layout: 'horizontal',
  })
    .addSettingsInput({
      id: '03959ffd-cadb-496c-bf6d-b742f7f6edc6',
      propertyName: 'tooltip',
      inputType: 'textArea',
      label: 'Tooltip',
      layout: 'horizontal',
      allowClear: true,
    })
    .addSettingsInput({
      id: '1adea529-1f0c-4def-bd41-ee166a5dfcd7',
      inputType: 'permissions',
      propertyName: 'permissions',
      label: 'Permissions',
      jsSetting: true,
      size: 'small',
    })
    .toJson();
};
