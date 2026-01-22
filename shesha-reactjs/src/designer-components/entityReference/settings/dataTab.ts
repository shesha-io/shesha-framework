import { DesignerToolbarSettings } from '@/index';
import { nanoid } from '@/utils/uuid';
import { IEntityReferenceControlProps } from '../entityReference';

export const getDataTabSettings = (data: IEntityReferenceControlProps, tabId: string): any[] => {
  return new DesignerToolbarSettings(data)
    .addAutocomplete({
      id: nanoid(),
      propertyName: 'entityType',
      label: 'Entity Type',
      parentId: tabId,
      dataSourceType: 'url',
      validate: { required: true },
      dataSourceUrl: '/api/services/app/Metadata/TypeAutocomplete',
      useRawValues: true,
      jsSetting: true,
    })
    .addAutocomplete({
      id: nanoid(),
      propertyName: 'getEntityUrl',
      label: 'Get Entity URL',
      parentId: tabId,
      dataSourceType: 'url',
      validate: {
        required: {
          _code: 'return !getSettingValue(data?.entityType);',
          _mode: 'code',
          _value: true,
        } as any,
      },
      dataSourceUrl: '/api/services/app/Api/Endpoints',
      useRawValues: true,
    })
    .toJson();
};
