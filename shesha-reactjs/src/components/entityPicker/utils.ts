import { IEntityReferenceDto } from '@/interfaces';
import { getValueByPropertyName } from '@/utils/object';
import { isDefined } from '@/utils/nullables';

type EntityPickerItem = string | IEntityReferenceDto | null | undefined;

export const isPropertyLoaded = (value: EntityPickerItem, displayEntityKey: string): boolean => {
  return typeof (value) === "object" && value !== null && typeof (getValueByPropertyName(value, displayEntityKey as keyof IEntityReferenceDto)) !== 'undefined';
};

/**
 * Returns true when the value already carries the display property, so it can be rendered as is.
 * For a multiple selection every item must carry it: items picked in the dialog are stored without
 * a custom display property (e.g. `name`), and if any item lacks it the whole selection is fetched.
 */
export const isValueLoaded = (value: EntityPickerItem | EntityPickerItem[], displayEntityKey: string): boolean => {
  if (!isDefined(value) || value === '') return false;
  return Array.isArray(value)
    ? value.every((x) => isPropertyLoaded(x, displayEntityKey))
    : isPropertyLoaded(value, displayEntityKey);
};
