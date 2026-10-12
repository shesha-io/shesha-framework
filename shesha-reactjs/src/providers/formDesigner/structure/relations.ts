import { IComponentRelations } from '@/providers/form/models';
import { isDefined } from '@/utils/nullables';

/** True when any container's list of child ids differs between the two snapshots */
export const haveRelationsChanged = (prev: IComponentRelations, next: IComponentRelations): boolean => {
  if (prev === next)
    return false;

  const prevKeys = Object.keys(prev);
  const nextKeys = Object.keys(next);
  if (prevKeys.length !== nextKeys.length)
    return true;

  return nextKeys.some((key) => {
    const before = prev[key];
    const after = next[key];
    if (before === after)
      return false;
    if (!isDefined(before) || !isDefined(after))
      return true;
    return before.length !== after.length || before.some((id, index) => id !== after[index]);
  });
};
