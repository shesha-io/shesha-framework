import { IConfigurableFormComponent } from "@/interfaces/formDesigner";

export const migrateVisibility = <T extends IConfigurableFormComponent>(prev: T): T => {
  const visibilityName = 'visibility';

  if (!Object.hasOwn(prev, visibilityName))
    return prev;

  const visibility = prev[visibilityName]?.toLowerCase();
  // note: `no` and `removed` values had a higher priority, so we can rewrite any value of `hidden` property to keep old behaviour
  const newHidden = visibility === 'no' || visibility === 'removed'
    ? true
    : prev.hidden;

  const result: T = { ...prev, hidden: newHidden };
  delete result[visibilityName];

  return result;
};
