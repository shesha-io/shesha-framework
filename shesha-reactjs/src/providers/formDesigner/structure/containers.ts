import type { IToolboxComponent } from '@/interfaces';
import type { FormDesignerComponentGetter } from '@/providers/form/hooks';
import { IConfigurableFormComponent, IFlatComponentsStructure, isConfigurableFormComponent, ROOT_COMPONENT_KEY } from '@/providers/form/models';
import { getComponentContainers, IComponentContainerInfo } from '@/providers/form/utils';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';

/**
 * The container a component keeps its non-pane children in: its own id, or undefined when it has none.
 * Components whose children live in panes (Tabs, Wizard, Columns, Collapsible Panel...) only get one when their
 * definition says `acceptsChildren`, because once they've been edited the designer lists their panes under their own id.
 */
export const getOwnContainerId = (
  component: IConfigurableFormComponent,
  definition: IToolboxComponent | undefined,
  markup: IFlatComponentsStructure,
  containers: readonly IComponentContainerInfo[],
): string | undefined => {
  if (definition?.acceptsChildren === true)
    return component.id;
  if (containers.some((container) => container.id !== component.id))
    return undefined;
  return containers.some((container) => container.id === component.id) || isDefined(markup.componentRelations[component.id])
    ? component.id
    : undefined;
};

export interface IContainerOwnership {
  /** Container id -> id of the component that owns it (panes, and components' own containers) */
  ownerOf: ReadonlyMap<string, string>;
  /** Ids of pane containers: tab panes, wizard steps, columns, panel header/content, step footers */
  paneIds: ReadonlySet<string>;
  /** Nested pane id -> id of the pane holding it (a step's footer is held by that step) */
  heldBy: ReadonlyMap<string, string>;
}

export const buildContainerOwnership = (markup: IFlatComponentsStructure, getDefinition: FormDesignerComponentGetter): IContainerOwnership => {
  const ownerOf = new Map<string, string>();
  const paneIds = new Set<string>();
  const heldBy = new Map<string, string>();

  Object.values(markup.allComponents).forEach((item) => {
    // pane entries that `updateComponent` adds to allComponents have an empty type
    if (!isConfigurableFormComponent(item) || isNullOrWhiteSpace(item.type))
      return;
    const definition = getDefinition(item.type);
    const containers = getComponentContainers(item, definition);
    containers.forEach((container) => {
      if (container.id === item.id)
        return;
      ownerOf.set(container.id, item.id);
      paneIds.add(container.id);
      if (isDefined(container.parentContainerId))
        heldBy.set(container.id, container.parentContainerId);
    });
    const ownContainerId = getOwnContainerId(item, definition, markup, containers);
    if (isDefined(ownContainerId))
      ownerOf.set(ownContainerId, item.id);
  });

  return { ownerOf, paneIds, heldBy };
};

/** The container a component sits in, or undefined at the top level */
export const getParentContainerId = (markup: IFlatComponentsStructure, componentId: string): string | undefined => {
  const component = markup.allComponents[componentId];
  if (!isConfigurableFormComponent(component))
    return undefined;
  const { parentId } = component;
  return isNullOrWhiteSpace(parentId) || parentId === ROOT_COMPONENT_KEY ? undefined : parentId;
};

/** Is `candidateId` the component `ancestorId` itself, or anywhere inside it? */
export const isSameOrInside = (markup: IFlatComponentsStructure, ownership: IContainerOwnership, candidateId: string, ancestorId: string): boolean => {
  const visited = new Set<string>();
  let current: string | undefined = candidateId;
  while (isDefined(current) && !visited.has(current)) {
    if (current === ancestorId)
      return true;
    visited.add(current);
    const containerId = getParentContainerId(markup, current);
    current = isDefined(containerId) ? ownership.ownerOf.get(containerId) : undefined;
  }
  return false;
};
