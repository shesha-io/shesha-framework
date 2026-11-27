import type { FormDesignerComponentGetter } from '@/providers/form/hooks';
import { IFlatComponentsStructure, isConfigurableFormComponent, ROOT_COMPONENT_KEY } from '@/providers/form/models';
import { getComponentContainers } from '@/providers/form/utils';
import type { IComponentMovePayload } from '@/providers/formDesigner/contexts';
import { getParentContainerId, IContainerOwnership } from '@/providers/formDesigner/structure/containers';
import { getComponentDisplayText, getPaneLabel } from '@/providers/formDesigner/structure/displayText';
import { isDefined } from '@/utils/nullables';

export type RowActionState = { enabled: true; payload: IComponentMovePayload } | { enabled: false; reason: string };

const siblingsOf = (markup: IFlatComponentsStructure, componentId: string): { containerId: string; siblings: string[] } => {
  const containerId = getParentContainerId(markup, componentId) ?? ROOT_COMPONENT_KEY;
  return { containerId, siblings: markup.componentRelations[containerId] ?? [] };
};

export const getMoveUpAction = (markup: IFlatComponentsStructure, componentId: string): RowActionState => {
  const { containerId, siblings } = siblingsOf(markup, componentId);
  const position = siblings.indexOf(componentId);
  return position > 0
    ? { enabled: true, payload: { componentId, containerId, index: position - 1 } }
    : { enabled: false, reason: 'Already at the top' };
};

export const getMoveDownAction = (markup: IFlatComponentsStructure, componentId: string): RowActionState => {
  const { containerId, siblings } = siblingsOf(markup, componentId);
  const position = siblings.indexOf(componentId);
  return position >= 0 && position < siblings.length - 1
    ? { enabled: true, payload: { componentId, containerId, index: position + 1 } }
    : { enabled: false, reason: 'Already at the bottom' };
};

/** Places the component right after the component that owns its container */
export const getMoveOutAction = (markup: IFlatComponentsStructure, ownership: IContainerOwnership, componentId: string): RowActionState => {
  const containerId = getParentContainerId(markup, componentId);
  const ownerId = isDefined(containerId) ? ownership.ownerOf.get(containerId) : undefined;
  if (!isDefined(ownerId))
    return { enabled: false, reason: 'Already at the top level' };
  const ownerContainerId = getParentContainerId(markup, ownerId) ?? ROOT_COMPONENT_KEY;
  const ownerPosition = (markup.componentRelations[ownerContainerId] ?? []).indexOf(ownerId);
  return { enabled: true, payload: { componentId, containerId: ownerContainerId, index: ownerPosition + 1 } };
};

const describeContainer = (markup: IFlatComponentsStructure, ownership: IContainerOwnership, getDefinition: FormDesignerComponentGetter, containerId: string): string => {
  if (containerId === ROOT_COMPONENT_KEY)
    return 'the form';
  const ownerId = ownership.ownerOf.get(containerId);
  const owner = isDefined(ownerId) ? markup.allComponents[ownerId] : undefined;
  if (!isConfigurableFormComponent(owner))
    return 'the form';
  if (containerId === owner.id)
    return getComponentDisplayText(owner);
  const pane = getComponentContainers(owner, getDefinition(owner.type)).find((container) => container.id === containerId);
  return isDefined(pane) ? getPaneLabel(pane) : getComponentDisplayText(owner);
};

/** e.g. "Moved Email into Address, position 2 of 5." Pass the markup from before the move */
export const describeMove = (markup: IFlatComponentsStructure, ownership: IContainerOwnership, getDefinition: FormDesignerComponentGetter, payload: IComponentMovePayload): string => {
  const component = markup.allComponents[payload.componentId];
  const name = isConfigurableFormComponent(component) ? getComponentDisplayText(component) : payload.componentId;
  const count = (markup.componentRelations[payload.containerId] ?? []).filter((id) => id !== payload.componentId).length + 1;
  const position = Math.min(Math.max(payload.index, 0), count - 1) + 1;
  return `Moved ${name} into ${describeContainer(markup, ownership, getDefinition, payload.containerId)}, position ${position} of ${count}.`;
};
