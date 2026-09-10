import React from 'react';
import { canMoveTo } from '../model/reducer';
import { DropPlacement, QueryTree } from '../model/types';
import { QueryAction } from '../model/reducer';

export interface IDropHint {
  id: string;
  placement: DropPlacement;
}

export interface IDragHandlers {
  dragId: string | null;
  dropHint: IDropHint | null;
  onStartDrag: (id: string) => React.DragEventHandler<HTMLButtonElement>;
  onFinishDrag: React.DragEventHandler<HTMLButtonElement>;
  onDragOverItem: (id: string) => React.DragEventHandler<HTMLDivElement>;
  onDropOnItem: (id: string) => React.DragEventHandler<HTMLDivElement>;
  onDragLeaveItem: React.DragEventHandler<HTMLDivElement>;
  onDragOverAppend: (id: string) => React.DragEventHandler<HTMLDivElement>;
  onDropAppend: (id: string) => React.DragEventHandler<HTMLDivElement>;
}

const placementFor = (event: React.DragEvent<HTMLDivElement>): DropPlacement => {
  const bounds = event.currentTarget.getBoundingClientRect();
  return event.clientY < bounds.top + (bounds.height / 2) ? 'before' : 'after';
};

/** Native drag and drop over the tree. The drop hint is only replaced when the target or placement actually changes. */
export const useDragHandlers = (tree: QueryTree, dispatch: (action: QueryAction) => void, readOnly: boolean): IDragHandlers => {
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [dropHint, setDropHint] = React.useState<IDropHint | null>(null);

  const reset = React.useCallback((): void => {
    setDragId(null);
    setDropHint(null);
  }, []);

  const setHint = React.useCallback((id: string, placement: DropPlacement): void => {
    setDropHint((prev) => prev?.id === id && prev.placement === placement ? prev : { id, placement });
  }, []);

  const canAccept = React.useCallback((targetId: string, placement: DropPlacement): boolean =>
    dragId !== null && canMoveTo(tree, dragId, targetId, placement), [dragId, tree]);

  const onStartDrag = React.useCallback((id: string) => (event: React.DragEvent<HTMLButtonElement>): void => {
    if (readOnly) return;
    setDragId(id);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', id);
  }, [readOnly]);

  const onFinishDrag = React.useCallback((event: React.DragEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    reset();
  }, [reset]);

  const onDragOverItem = React.useCallback((id: string) => (event: React.DragEvent<HTMLDivElement>): void => {
    const placement = placementFor(event);
    if (!canAccept(id, placement)) return;
    event.preventDefault();
    event.stopPropagation();
    setHint(id, placement);
    event.dataTransfer.dropEffect = 'move';
  }, [canAccept, setHint]);

  const onDropOnItem = React.useCallback((id: string) => (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    const placement = placementFor(event);
    if (dragId !== null && canAccept(id, placement))
      dispatch({ type: 'move', id: dragId, targetId: id, placement });
    reset();
  }, [canAccept, dispatch, dragId, reset]);

  const onDragOverAppend = React.useCallback((id: string) => (event: React.DragEvent<HTMLDivElement>): void => {
    if (!canAccept(id, 'append')) return;
    event.preventDefault();
    setHint(id, 'append');
    event.dataTransfer.dropEffect = 'move';
  }, [canAccept, setHint]);

  const onDropAppend = React.useCallback((id: string) => (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    if (dragId !== null && canAccept(id, 'append'))
      dispatch({ type: 'move', id: dragId, targetId: id, placement: 'append' });
    reset();
  }, [canAccept, dispatch, dragId, reset]);

  const onDragLeaveItem = React.useCallback((event: React.DragEvent<HTMLDivElement>): void => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null))
      setDropHint(null);
  }, []);

  return { dragId, dropHint, onStartDrag, onFinishDrag, onDragOverItem, onDropOnItem, onDragLeaveItem, onDragOverAppend, onDropAppend };
};
