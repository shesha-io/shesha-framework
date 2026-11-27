import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { App } from 'antd';
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import { attachInstruction, extractInstruction, ItemMode } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { dropTargetForElements, monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import type { IComponentMovePayload } from '@/providers/formDesigner/contexts';
import { useFormDesigner } from '@/providers/formDesigner';
import { isDefined } from '@/utils/nullables';
import { highlightComponentOnCanvas } from '../canvasBridge';
import { normalizeInstruction, resolveDrop, resolveRootEndDrop, validateResolution } from '../model/dropTarget';
import { ILayerRow } from '../model/types';
import { LAYER_INDENT } from '../styles/styles';
import { getDropData, getLayerSourceId, ILayersDndContext, isLayerSource, makeDropData } from './dndData';
import { IExpandedState } from './useExpandedState';
import { ILayersData } from './useLayersData';

export interface ILayersDragAndDropArgs {
  /** The list's own element; null until react-window has rendered it */
  listElement: HTMLElement | null;
  layers: ILayersData;
  rows: readonly ILayerRow[];
  expandedState: IExpandedState;
  dragEnabled: boolean;
  performMove: (payload: IComponentMovePayload) => void;
}

/**
 * Wires Pragmatic drag and drop for the Layers list: the list itself is a drop target (dropping under the last row
 * adds to the end of the form), a monitor performs the move, and the list auto-scrolls near its edges. Returns the
 * stable callbacks rows use.
 */
export const useLayersDragAndDrop = (args: ILayersDragAndDropArgs): ILayersDndContext => {
  const designer = useFormDesigner();
  const { message } = App.useApp();
  const latest = useRef(args);
  useLayoutEffect(() => {
    latest.current = args;
  });

  const collapsedForDrag = useRef<string | undefined>(undefined);
  const [context] = useState<ILayersDndContext>(() => {
    const findRow = (rowId: string): ILayerRow | undefined => latest.current.rows.find((row) => row.id === rowId);

    return {
      canDrag: (rowId) => latest.current.dragEnabled && latest.current.layers.index.nodes.get(rowId)?.kind === 'component',
      getRowDropData: (rowId, input, element, sourceId) => {
        const { layers } = latest.current;
        const row = findRow(rowId);
        const node = layers.index.nodes.get(rowId);
        // the dragged row itself is neutral: releasing a drag where it started cancels it
        if (!isDefined(row) || !isDefined(node) || !isDefined(sourceId) || sourceId === rowId)
          return {};
        const mode: ItemMode = row.isExpanded ? 'expanded' : row.isLastInGroup ? 'last-in-group' : 'standard';
        const raw = extractInstruction(attachInstruction({}, { input, element, currentLevel: row.depth, indentPerLevel: LAYER_INDENT, mode }));
        if (raw === null)
          return {};
        const instruction = normalizeInstruction(raw, node, input.clientY, element.getBoundingClientRect());
        const markup = designer.state.formFlatMarkup;
        const resolution = validateResolution(
          resolveDrop({ index: layers.index, relations: markup.componentRelations, sourceId, targetId: rowId, instruction }),
          markup,
          layers.ownership,
          designer.getComponentDefinition,
        );
        return makeDropData({ instruction, resolution });
      },
      isCollapsedParent: (rowId) => {
        const row = findRow(rowId);
        return isDefined(row) && row.hasChildren && !row.isExpanded;
      },
      expandRow: (rowId) => latest.current.expandedState.setRowExpanded(rowId, true),
    };
  });

  const { listElement } = args;
  useEffect(() => {
    if (!isDefined(listElement))
      return undefined;

    return combine(
      monitorForElements({
        canMonitor: ({ source }) => isLayerSource(source.data),
        onDragStart: ({ source }) => {
          highlightComponentOnCanvas(null, '');
          // a dragged container folds up so its own children aren't in the way
          const rowId = getLayerSourceId(source.data);
          if (isDefined(rowId) && latest.current.expandedState.expanded.has(rowId)) {
            collapsedForDrag.current = rowId;
            latest.current.expandedState.setRowExpanded(rowId, false);
          }
        },
        onDrop: ({ location }) => {
          if (isDefined(collapsedForDrag.current))
            latest.current.expandedState.setRowExpanded(collapsedForDrag.current, true);
          collapsedForDrag.current = undefined;

          const target = location.current.dropTargets[0];
          const drop = isDefined(target) ? getDropData(target.data) : null;
          if (drop === null)
            return;
          if (drop.resolution.kind === 'move')
            latest.current.performMove(drop.resolution.payload);
          else if (isDefined(drop.resolution.reason))
            void message.warning(drop.resolution.reason);
        },
      }),
      dropTargetForElements({
        element: listElement,
        canDrop: ({ source }) => isLayerSource(source.data),
        getData: ({ source }) => {
          const sourceId = getLayerSourceId(source.data);
          if (!isDefined(sourceId))
            return {};
          const markup = designer.state.formFlatMarkup;
          const resolution = validateResolution(resolveRootEndDrop(markup.componentRelations, sourceId), markup, latest.current.layers.ownership, designer.getComponentDefinition);
          return makeDropData({ instruction: { type: 'reorder-below', currentLevel: 0 }, resolution });
        },
      }),
      autoScrollForElements({
        element: listElement,
        canScroll: ({ source }) => isLayerSource(source.data),
      }),
    );
  }, [listElement, designer, message]);

  return context;
};
