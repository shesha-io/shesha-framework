import { IFlatComponentsStructure } from '@/providers/form/models';
import { isDefined } from '@/utils/nullables';
import { getParentContainerId, IContainerOwnership } from './containers';

/**
 * Pane ids (tab panes, wizard steps, panel sections, step footers) that must be open for `id` to be drawn on
 * the canvas, outermost first. `id` is a component id, or a pane id when a pane row was clicked.
 */
export const getRevealPath = (markup: IFlatComponentsStructure, ownership: IContainerOwnership, id: string): string[] => {
  const path: string[] = [];
  const visited = new Set<string>();
  let containerId: string | undefined = ownership.paneIds.has(id) ? id : getParentContainerId(markup, id);

  while (isDefined(containerId) && !visited.has(containerId)) {
    visited.add(containerId);
    if (ownership.paneIds.has(containerId)) {
      path.unshift(containerId);
      const holderId = ownership.heldBy.get(containerId);
      if (isDefined(holderId) && !path.includes(holderId))
        path.unshift(holderId);
    }
    const ownerId = ownership.ownerOf.get(containerId);
    containerId = isDefined(ownerId) ? getParentContainerId(markup, ownerId) : undefined;
  }
  return path;
};
