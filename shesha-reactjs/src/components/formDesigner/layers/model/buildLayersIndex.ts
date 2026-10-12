import type { FormDesignerComponentGetter } from '@/providers/form/hooks';
import { IFlatComponentsStructure, isConfigurableFormComponent, ROOT_COMPONENT_KEY } from '@/providers/form/models';
import { getComponentContainers, IComponentContainerInfo } from '@/providers/form/utils';
import { getOwnContainerId } from '@/providers/formDesigner/structure/containers';
import { getPaneGroupNoun } from '@/providers/formDesigner/structure/displayText';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { ILayerNode, ILayersIndex } from './types';

/**
 * Builds the Layers tree from the designer's flat markup. Pane ids always come from the owner's own settings
 * (`tabs`, `steps`, `columns`...), never from `componentRelations[ownerId]`, so an edited Tabs reads the same as a
 * freshly loaded one. Ids that no longer exist are skipped, and a visited set stops loops in corrupt markup.
 */
export const buildLayersIndex = (markup: IFlatComponentsStructure, getDefinition: FormDesignerComponentGetter): ILayersIndex => {
  const nodes = new Map<string, ILayerNode>();
  const visited = new Set<string>();

  const addComponent = (componentId: string, parentId: string | null, containerId: string, depth: number): string | undefined => {
    if (visited.has(componentId))
      return undefined;
    const component = markup.allComponents[componentId];
    if (!isConfigurableFormComponent(component) || isNullOrWhiteSpace(component.type))
      return undefined;
    visited.add(componentId);

    const definition = getDefinition(component.type);
    const containers = getComponentContainers(component, definition);
    // panes that belong directly to the component; nested ones (a step's footer) hang under the pane holding them
    const panes = containers.filter((c) => c.id !== component.id && (!c.isNested || !isDefined(c.parentContainerId)));
    const ownContainerId = getOwnContainerId(component, definition, markup, containers);
    const node: ILayerNode = {
      id: componentId,
      kind: 'component',
      parentId,
      containerId,
      childIds: [],
      depth,
      dropContainerId: ownContainerId,
      hasPanes: panes.length > 0,
      paneNoun: panes.length > 0 ? getPaneGroupNoun(panes) : undefined,
    };
    nodes.set(componentId, node);

    // when a component lists its containers, the ones it leaves out aren't drawn (a step footer without a custom footer)
    const drawn = isDefined(definition?.getContainers) ? new Set(definition.getContainers(component).map((c) => c.id)) : undefined;
    panes.forEach((pane) => {
      const added = addPane(pane, componentId, componentId, depth + 1, containers, drawn);
      if (isDefined(added))
        node.childIds.push(added);
    });
    if (isDefined(ownContainerId)) {
      (markup.componentRelations[ownContainerId] ?? []).forEach((childId) => {
        const added = addComponent(childId, componentId, ownContainerId, depth + 1);
        if (isDefined(added))
          node.childIds.push(added);
      });
    }
    return componentId;
  };

  const addPane = (
    pane: IComponentContainerInfo,
    ownerId: string,
    parentId: string,
    depth: number,
    ownerContainers: readonly IComponentContainerInfo[],
    drawn: ReadonlySet<string> | undefined,
  ): string | undefined => {
    if (visited.has(pane.id))
      return undefined;
    // a pane the canvas doesn't draw is only listed while it holds components, so they can be found, and takes no drops
    const isDrawn = !isDefined(drawn) || drawn.has(pane.id);
    if (!isDrawn && (markup.componentRelations[pane.id] ?? []).length === 0)
      return undefined;
    visited.add(pane.id);

    const node: ILayerNode = { id: pane.id, kind: 'pane', parentId, ownerId, childIds: [], depth, dropContainerId: isDrawn ? pane.id : undefined, hasPanes: false };
    nodes.set(pane.id, node);

    (markup.componentRelations[pane.id] ?? []).forEach((childId) => {
      const added = addComponent(childId, pane.id, pane.id, depth + 1);
      if (isDefined(added))
        node.childIds.push(added);
    });
    ownerContainers
      .filter((c) => c.isNested && c.parentContainerId === pane.id)
      .forEach((nested) => {
        const added = addPane(nested, ownerId, pane.id, depth + 1, ownerContainers, drawn);
        if (isDefined(added))
          node.childIds.push(added);
      });
    return pane.id;
  };

  const rootIds: string[] = [];
  (markup.componentRelations[ROOT_COMPONENT_KEY] ?? []).forEach((id) => {
    const added = addComponent(id, null, ROOT_COMPONENT_KEY, 0);
    if (isDefined(added))
      rootIds.push(added);
  });

  return { rootIds, nodes };
};
