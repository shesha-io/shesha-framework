import type { FormDesignerComponentGetter } from '@/providers/form/hooks';
import { IFlatComponentsStructure, isConfigurableFormComponent, ROOT_COMPONENT_KEY } from '@/providers/form/models';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { capitalizeFirstLetter } from '@/utils/string';
import type { IComponentMovePayload } from '../contexts';
import { getParentContainerId, IContainerOwnership, isSameOrInside } from './containers';

export const MOVE_INTO_ITSELF_REASON = "Can't move a component inside itself.";
export const MISSING_COMPONENT_REASON = 'This component no longer exists.';
export const MISSING_CONTAINER_REASON = 'That container no longer exists.';

export type MoveComputation = { ok: true; markup: IFlatComponentsStructure } | { ok: false; reason: string };

/** Why the move isn't allowed, or undefined when it is */
export const getMoveBlockReason = (
  markup: IFlatComponentsStructure,
  ownership: IContainerOwnership,
  payload: IComponentMovePayload,
  getDefinition: FormDesignerComponentGetter,
): string | undefined => {
  const { componentId, containerId } = payload;
  const component = markup.allComponents[componentId];
  if (!isConfigurableFormComponent(component) || isNullOrWhiteSpace(component.type))
    return MISSING_COMPONENT_REASON;
  if (containerId === ROOT_COMPONENT_KEY)
    return undefined;

  const ownerId = ownership.ownerOf.get(containerId);
  if (!isDefined(ownerId))
    return MISSING_CONTAINER_REASON;
  if (isSameOrInside(markup, ownership, ownerId, componentId))
    return MOVE_INTO_ITSELF_REASON;

  if (containerId === ownerId) {
    const owner = markup.allComponents[ownerId];
    const definition = isConfigurableFormComponent(owner) ? getDefinition(owner.type) : undefined;
    const limit = definition?.itemsLimit;
    const isAlreadyThere = (getParentContainerId(markup, componentId) ?? ROOT_COMPONENT_KEY) === containerId;
    if (isDefined(definition) && isDefined(limit) && !isAlreadyThere && (markup.componentRelations[containerId] ?? []).length >= limit) {
      const name = capitalizeFirstLetter(definition.name);
      return limit === 1 ? `${name} can only hold one component.` : `${name} can only hold ${limit} components.`;
    }
  }
  return undefined;
};

/** The markup after the move. Returns the same object when nothing would change */
export const computeMove = (
  markup: IFlatComponentsStructure,
  ownership: IContainerOwnership,
  payload: IComponentMovePayload,
  getDefinition: FormDesignerComponentGetter,
): MoveComputation => {
  const reason = getMoveBlockReason(markup, ownership, payload, getDefinition);
  if (isDefined(reason))
    return { ok: false, reason };

  const { componentId, containerId, index } = payload;
  const component = markup.allComponents[componentId];
  if (!isConfigurableFormComponent(component))
    return { ok: false, reason: MISSING_COMPONENT_REASON };

  const sourceContainerId = getParentContainerId(markup, componentId) ?? ROOT_COMPONENT_KEY;
  const sourceIds = markup.componentRelations[sourceContainerId] ?? [];
  const remainingIds = sourceIds.filter((id) => id !== componentId);
  const isSameContainer = sourceContainerId === containerId;
  const targetIds = isSameContainer
    ? [...remainingIds]
    : (markup.componentRelations[containerId] ?? []).filter((id) => id !== componentId);
  const position = Number.isFinite(index) ? Math.min(Math.max(Math.trunc(index), 0), targetIds.length) : targetIds.length;
  targetIds.splice(position, 0, componentId);

  if (isSameContainer && targetIds.length === sourceIds.length && targetIds.every((id, i) => id === sourceIds[i]))
    return { ok: true, markup };

  return {
    ok: true,
    markup: {
      allComponents: { ...markup.allComponents, [componentId]: { ...component, parentId: containerId } },
      componentRelations: isSameContainer
        ? { ...markup.componentRelations, [containerId]: targetIds }
        : { ...markup.componentRelations, [sourceContainerId]: remainingIds, [containerId]: targetIds },
      parents: { ...markup.parents, [componentId]: containerId },
    },
  };
};
