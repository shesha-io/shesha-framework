import type { FormDesignerComponentGetter } from '@/providers/form/hooks';
import { IComponentRelations, IFlatComponentsStructure, ROOT_COMPONENT_KEY } from '@/providers/form/models';
import type { IComponentMovePayload } from '@/providers/formDesigner/contexts';
import { IContainerOwnership } from '@/providers/formDesigner/structure/containers';
import { getMoveBlockReason } from '@/providers/formDesigner/structure/moveComponent';
import { isDefined } from '@/utils/nullables';
import { ILayerNode, ILayersIndex } from './types';
import { getAncestorAtDepth } from './visibleRows';

/** Mirrors the tree-item hitbox's Instruction, so the model doesn't depend on the drag library */
export type LayerDropInstruction =
  { type: 'reorder-above'; currentLevel: number } |
  { type: 'reorder-below'; currentLevel: number } |
  { type: 'make-child'; currentLevel: number } |
  { type: 'reparent'; currentLevel: number; desiredLevel: number } |
  { type: 'instruction-blocked'; desired: Exclude<LayerDropInstruction, { type: 'instruction-blocked' }> };

export type DropResolution = { kind: 'move'; payload: IComponentMovePayload } | { kind: 'blocked'; reason: string | undefined };

export const PANE_REORDER_REASON = "Tabs, steps and columns can't be reordered here.";
const HIDDEN_PANE_REASON = "This part isn't shown on the canvas, so nothing can be dropped into it.";

/**
 * Pane rows take any drop as "inside" (they can't have siblings). Leaf rows have no "inside", so their middle is
 * split in half: top half before, bottom half after.
 */
export const normalizeInstruction = (instruction: LayerDropInstruction, node: ILayerNode, pointerY: number, rect: { top: number; height: number }): LayerDropInstruction => {
  if (node.kind === 'pane' && (instruction.type === 'reorder-above' || instruction.type === 'reorder-below'))
    return { type: 'make-child', currentLevel: instruction.currentLevel };
  if (instruction.type === 'make-child' && node.kind === 'component' && !isDefined(node.dropContainerId) && !node.hasPanes)
    return pointerY < rect.top + rect.height / 2
      ? { type: 'reorder-above', currentLevel: instruction.currentLevel }
      : { type: 'reorder-below', currentLevel: instruction.currentLevel };
  return instruction;
};

const moveTo = (componentId: string, containerId: string, index: number): DropResolution => ({ kind: 'move', payload: { componentId, containerId, index } });

/** Position of `anchorId` in a container's list once the dragged component has been taken out of it */
const positionWithout = (relations: IComponentRelations, containerId: string, sourceId: string, anchorId: string): number =>
  (relations[containerId] ?? []).filter((id) => id !== sourceId).indexOf(anchorId);

export interface IResolveDropArgs {
  index: ILayersIndex;
  relations: IComponentRelations;
  sourceId: string;
  targetId: string;
  instruction: LayerDropInstruction;
}

/** Where a drop on a row would put the dragged component */
export const resolveDrop = ({ index, relations, sourceId, targetId, instruction }: IResolveDropArgs): DropResolution => {
  const target = index.nodes.get(targetId);
  if (!isDefined(target) || instruction.type === 'instruction-blocked')
    return { kind: 'blocked', reason: undefined };

  switch (instruction.type) {
    case 'reorder-above':
    case 'reorder-below': {
      if (target.kind === 'pane')
        return { kind: 'blocked', reason: PANE_REORDER_REASON };
      const position = positionWithout(relations, target.containerId, sourceId, target.id);
      if (position < 0)
        return { kind: 'blocked', reason: undefined };
      return moveTo(sourceId, target.containerId, instruction.type === 'reorder-above' ? position : position + 1);
    }
    case 'make-child': {
      if (isDefined(target.dropContainerId))
        return moveTo(sourceId, target.dropContainerId, (relations[target.dropContainerId] ?? []).filter((id) => id !== sourceId).length);
      if (target.kind === 'pane')
        return { kind: 'blocked', reason: HIDDEN_PANE_REASON };
      return { kind: 'blocked', reason: target.hasPanes ? `Drop it into one of the ${target.paneNoun ?? 'sections'}.` : undefined };
    }
    case 'reparent': {
      const anchor = getAncestorAtDepth(index, targetId, instruction.desiredLevel);
      if (!isDefined(anchor) || anchor.kind === 'pane')
        return { kind: 'blocked', reason: PANE_REORDER_REASON };
      const position = positionWithout(relations, anchor.containerId, sourceId, anchor.id);
      return position < 0 ? { kind: 'blocked', reason: undefined } : moveTo(sourceId, anchor.containerId, position + 1);
    }
  }
};

/** Dropping in the empty space under the last row: the end of the form */
export const resolveRootEndDrop = (relations: IComponentRelations, sourceId: string): DropResolution =>
  moveTo(sourceId, ROOT_COMPONENT_KEY, (relations[ROOT_COMPONENT_KEY] ?? []).filter((id) => id !== sourceId).length);

/** Applies the designer's own move rules (itself, item limits, missing containers) */
export const validateResolution = (
  resolution: DropResolution,
  markup: IFlatComponentsStructure,
  ownership: IContainerOwnership,
  getDefinition: FormDesignerComponentGetter,
): DropResolution => {
  if (resolution.kind !== 'move')
    return resolution;
  const reason = getMoveBlockReason(markup, ownership, resolution.payload, getDefinition);
  return isDefined(reason) ? { kind: 'blocked', reason } : resolution;
};
