import { DesignerToolbarSettings } from '@/index';
import { nanoid } from '@/utils/uuid';
import { IEntityReferenceControlProps } from '../entityReference';

export const getReferenceTypeSettings = (data: IEntityReferenceControlProps, parentId: string): any[] => {
  return new DesignerToolbarSettings(data)
    .addDropdown({
      id: nanoid(),
      propertyName: 'entityReferenceType',
      label: 'Entity Reference Type',
      parentId,
      allowClear: true,
      jsSetting: true,
      values: [
        { value: 'Quickview', label: 'Quickview', id: nanoid() },
        { value: 'NavigateLink', label: 'Navigate link', id: nanoid() },
        { value: 'Dialog', label: 'Dialog', id: nanoid() },
      ],
      dataSourceType: 'values',
      defaultValue: 'Quickview',
    })
    .addDropdown({
      id: nanoid(),
      propertyName: 'formSelectionMode',
      label: 'Form Selection Mode',
      parentId,
      allowClear: true,
      jsSetting: true,
      values: [
        { value: 'name', label: 'Name', id: nanoid() },
        { value: 'dynamic', label: 'Dynamic', id: nanoid() },
      ],
      dataSourceType: 'values',
      defaultValue: 'name',
    })
    .addFormAutocomplete({
      id: nanoid(),
      propertyName: 'formIdentifier',
      label: 'Form Identifier',
      parentId,
      jsSetting: true,
      readOnly: {
        _code: 'return getSettingValue(data?.readOnly);',
        _mode: 'code',
        _value: false,
      } as any,
      hidden: {
        _code: 'return getSettingValue(data?.formSelectionMode) !== "name";',
        _mode: 'code',
        _value: false,
      } as any,
    })
    .toJson();
};
