import { DesignerToolbarSettings } from '@/index';
import { nanoid } from '@/utils/uuid';
import { IEntityReferenceControlProps } from '../entityReference';

export const getDisplaySettings = (data: IEntityReferenceControlProps, parentId: string): any[] => {
  return new DesignerToolbarSettings(data)
    .addDropdown({
      id: nanoid(),
      parentId,
      propertyName: 'displayType',
      label: 'Display Type',
      allowClear: true,
      jsSetting: true,
      values: [
        { value: 'displayProperty', label: 'Display property', id: nanoid() },
        { value: 'icon', label: 'Icon', id: nanoid() },
        { value: 'textTitle', label: 'Text title', id: nanoid() },
      ],
      dataSourceType: 'values',
      readOnly: {
        _code: 'return getSettingValue(data?.readOnly);',
        _mode: 'code',
        _value: false,
      } as any,
    })
    .addIconPicker({
      id: nanoid(),
      propertyName: 'iconName',
      label: 'Icon',
      parentId,
      jsSetting: true,
      readOnly: {
        _code: 'return getSettingValue(data?.readOnly);',
        _mode: 'code',
        _value: false,
      } as any,
      hidden: {
        _code: 'return getSettingValue(data?.displayType) !== "icon";',
        _mode: 'code',
        _value: false,
      } as any,
    })
    .addTextField({
      id: nanoid(),
      propertyName: 'textTitle',
      label: 'Text Title',
      parentId,
      jsSetting: true,
      readOnly: {
        _code: 'return getSettingValue(data?.readOnly);',
        _mode: 'code',
        _value: false,
      } as any,
      hidden: {
        _code: 'return getSettingValue(data?.displayType) !== "textTitle";',
        _mode: 'code',
        _value: false,
      } as any,
    })
    .addPropertyAutocomplete({
      id: nanoid(),
      propertyName: 'displayProperty',
      label: 'Display Property',
      parentId,
      jsSetting: true,
      readOnly: {
        _code: 'return getSettingValue(data?.readOnly);',
        _mode: 'code',
        _value: false,
      } as any,
      hidden: {
        _code: 'return getSettingValue(data?.displayType) !== "displayProperty";',
        _mode: 'code',
        _value: false,
      } as any,
      modelType: {
        _code: 'return getSettingValue(data?.entityType);',
        _mode: 'code',
        _value: false,
      } as any,
      autoFillProps: false,
    })
    .toJson();
};
