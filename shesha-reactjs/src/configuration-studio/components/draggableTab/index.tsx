import React, { useRef, useEffect, FC } from 'react';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';

export type TabsDragState = {
  isDragging: boolean;
  sourceIndex: number | null;
  placeholderIndex: number | null;
};

export type TabPosition = {
  left: number;
  right: number;
  width: number;
};

type ReactElementWithStyle = React.ReactElement<{ style: React.CSSProperties }>;

type DraggableTabWithGapPlaceholderProps = {
  node: React.ReactElement;
  tabKey: string;
  index: number;
  onReorder: (fromIndex: number, toIndex: number) => void;
  dragState: TabsDragState;
  updateDragState: (dragState: Partial<TabsDragState>) => void;
  totalTabs: number;
  tabPositions: TabPosition[];
};

type DraggableData = {
  index: number;
  tabKey: string;
};

export const DraggableTabWithGapPlaceholder: FC<DraggableTabWithGapPlaceholderProps> = ({
  node,
  tabKey,
  index,
  onReorder,
  dragState,
  updateDragState,
  totalTabs,
}) => {
  const tabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = tabRef.current;
    if (!element) return undefined;

    return combine(
      draggable({
        element,
        getInitialData: () => ({ index, tabKey } satisfies DraggableData),
        onDragStart: () => {
          updateDragState({
            isDragging: true,
            sourceIndex: index,
            placeholderIndex: index,
          });
        },
        onDrop: () => {
          updateDragState({
            isDragging: false,
            sourceIndex: null,
            placeholderIndex: null,
          });
        },
      }),
      dropTargetForElements({
        element,
        getData: () => ({ index, tabKey }),
        onDrag: ({ location }) => {
          const elementRect = element.getBoundingClientRect();
          const cursorX = location.current.input.clientX;
          const elementCenterX = elementRect.left + elementRect.width / 2;

          // Determine placeholder position based on cursor
          const isLeftHalf = cursorX < elementCenterX;
          let placeholderIndex = isLeftHalf ? index : index + 1;

          // Ensure placeholder index is within valid range
          placeholderIndex = Math.max(0, Math.min(placeholderIndex, totalTabs));

          updateDragState({
            placeholderIndex,
          });
        },
        onDrop: ({ source }) => {
          const sourceData = source.data as DraggableData;
          const sourceIndex = sourceData.index;
          const targetIndex = dragState.placeholderIndex ?? -1;

          // Only reorder if the position actually changed
          if (sourceIndex !== targetIndex && sourceIndex !== targetIndex - 1) {
            const adjustedTargetIndex = targetIndex > sourceIndex ? targetIndex - 1 : targetIndex;
            onReorder(sourceIndex, adjustedTargetIndex);
          }

          updateDragState({
            isDragging: false,
            sourceIndex: null,
            placeholderIndex: null,
          });
        },
      }),
    );
  }, [index, tabKey, onReorder, updateDragState, totalTabs, dragState.placeholderIndex]);

  const enhancedNode = React.cloneElement(node, {
    style: {
      ...(node as ReactElementWithStyle).props.style,
      cursor: dragState.isDragging && dragState.sourceIndex === index ? 'grabbing' : 'grab',
      opacity: dragState.isDragging && dragState.sourceIndex === index ? 0.5 : 1,
      position: 'relative',
      transition: 'all 0.2s ease',
      zIndex: dragState.sourceIndex === index ? 1000 : 1,
    },
  });

  return (
    <div ref={tabRef} style={{ position: 'relative', display: 'inline-block' }}>
      {enhancedNode}
    </div>
  );
};
