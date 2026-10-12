import { RefObject, useEffect, useState } from 'react';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { isDefined } from '@/utils/nullables';
import { getDropData, getLayerSourceId, ILayersDndContext, IRowDropState, isLayerSource, isSameDropState, LAYER_SOURCE_KEY } from './dndData';

const HOVER_EXPAND_DELAY_MS = 500;

/** Makes a row draggable and a drop target; returns what to draw while something is dragged over it */
export const useLayerRowDnd = (elementRef: RefObject<HTMLDivElement | null>, rowId: string, context: ILayersDndContext): IRowDropState | null => {
  const [dropState, setDropState] = useState<IRowDropState | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (element === null || rowId === '')
      return undefined;

    let expandTimer: number | undefined;
    const clearExpandTimer = (): void => {
      if (isDefined(expandTimer)) {
        window.clearTimeout(expandTimer);
        expandTimer = undefined;
      }
    };

    const cleanup = combine(
      draggable({
        element,
        canDrag: () => context.canDrag(rowId),
        getInitialData: () => ({ [LAYER_SOURCE_KEY]: rowId }),
      }),
      dropTargetForElements({
        element,
        canDrop: ({ source }) => isLayerSource(source.data),
        getData: ({ input, element: target, source }) => context.getRowDropData(rowId, input, target, getLayerSourceId(source.data)),
        onDrag: ({ self }) => {
          const drop = getDropData(self.data);
          setDropState((current) => (isSameDropState(current, drop) ? current : drop));
          // hovering "inside" a collapsed row opens it, so its children can be targeted
          if (drop?.instruction.type === 'make-child' && context.isCollapsedParent(rowId)) {
            expandTimer ??= window.setTimeout(() => {
              expandTimer = undefined;
              context.expandRow(rowId);
            }, HOVER_EXPAND_DELAY_MS);
          } else {
            clearExpandTimer();
          }
        },
        onDragLeave: () => {
          clearExpandTimer();
          setDropState(null);
        },
        onDrop: () => {
          clearExpandTimer();
          setDropState(null);
        },
      }),
    );
    return () => {
      clearExpandTimer();
      cleanup();
    };
  }, [elementRef, rowId, context]);

  return dropState;
};
