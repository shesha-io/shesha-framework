import { IConfigurableFormComponent } from "@/interfaces/formDesigner";
import { getStringPropertyOrUndefined } from "@/utils/object";

export const migrateVisibility = <T extends IConfigurableFormComponent>(prev: T): T => {
  const visibilityName = 'visibility';

  if (!Object.hasOwn(prev, visibilityName))
    return prev;

  const visibility = getStringPropertyOrUndefined(prev, visibilityName)?.toLowerCase();
  // note: `no` and `removed` values had a higher priority, so we can rewrite any value of `hidden` property to keep old behaviour
  const newHidden = visibility === 'no' || visibility === 'removed'
    ? true
    : prev.hidden;

  const result: T = { ...prev, hidden: newHidden };
  if (visibilityName in result)
    delete result[visibilityName];

  return result;
};
