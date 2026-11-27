import type { FormDesignerComponentGetter } from '@/providers/form/hooks';
import { IComponentRelations, IConfigurableFormComponent, IFlatComponentsStructure, isConfigurableFormComponent } from '@/providers/form/models';
import { getComponentContainers } from '@/providers/form/utils';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';

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

/**
 * True when a component's panes were added, removed or reordered. Some components (Sizable Columns) keep their panes
 * only in their settings, so removing an empty column leaves the child lists as they were
 */
export const havePanesChanged = (prev: IFlatComponentsStructure, next: IFlatComponentsStructure, getDefinition: FormDesignerComponentGetter): boolean => {
  if (prev.allComponents === next.allComponents)
    return false;

  const paneIds = (component: IConfigurableFormComponent): string[] =>
    getComponentContainers(component, getDefinition(component.type)).map((container) => container.id);

  return Object.entries(next.allComponents).some(([id, after]) => {
    const before = prev.allComponents[id];
    // added and removed components change the child lists anyway; pane entries have no type
    if (before === after || !isConfigurableFormComponent(before) || !isConfigurableFormComponent(after) || isNullOrWhiteSpace(after.type))
      return false;
    const beforeIds = paneIds(before);
    const afterIds = paneIds(after);
    return beforeIds.length !== afterIds.length || beforeIds.some((paneId, index) => paneId !== afterIds[index]);
  });
};
