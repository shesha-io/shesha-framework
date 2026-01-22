import { DesignerToolbarSettings } from '@/index';
import { nanoid } from '@/utils/uuid';
import { IEntityReferenceControlProps } from '../entityReference';

export const getCommonTabSettings = (data: IEntityReferenceControlProps, tabId: string): any[] => {
  const propertyNameId = nanoid();
  const hiddenId = nanoid();

  return new DesignerToolbarSettings(data)
    .addContextPropertyAutocomplete({
      id: propertyNameId,
      propertyName: 'propertyName',
      parentId: tabId,
      label: 'Property Name',
      size: 'small',
      validate: {
        required: true,
      },
      jsSetting: true,
    })
    .addCheckbox({
      id: nanoid(),
      propertyName: 'hideLabel',
      label: 'Hide Label',
      parentId: tabId,
    })
    .addTextField({
      id: `placeholder-${tabId}`,
      propertyName: 'placeholder',
      label: 'Placeholder',
      size: 'small',
      parentId: tabId,
      jsSetting: true,
    })
    .addTextArea({
      id: `tooltip-${tabId}`,
      propertyName: 'description',
      label: 'Tooltip',
      parentId: tabId,
      jsSetting: true,
    })
    .addSwitch({
      id: hiddenId,
      propertyName: 'hidden',
      parentId: tabId,
      label: 'Hide',
      jsSetting: true,
    })
    .toJson();
};
