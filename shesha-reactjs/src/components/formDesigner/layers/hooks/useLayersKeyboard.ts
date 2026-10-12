import { KeyboardEvent, useCallback, useLayoutEffect, useRef } from 'react';
import { isDefined } from '@/utils/nullables';
import { ILayerRow } from '../model/types';

const TYPE_AHEAD_RESET_MS = 500;
const NAVIGATION_KEYS = ['ArrowDown', 'ArrowUp', 'Home', 'End', 'ArrowRight', 'ArrowLeft'];

export interface ILayersKeyboardArgs {
  rows: readonly ILayerRow[];
  activeId: string | undefined;
  setActiveId: (id: string) => void;
  getLabel: (id: string) => string;
  onSelect: (id: string) => void;
  setExpanded: (id: string, value: boolean) => void;
  scrollToRow: (index: number) => void;
  onOpenMenu?: ((id: string) => void) | undefined;
  onMoveSelected?: ((direction: 'up' | 'down') => void) | undefined;
}

const findParentRowIndex = (rows: readonly ILayerRow[], index: number): number => {
  const depth = rows[index]?.depth ?? 0;
  for (let i = index - 1; i >= 0; i--) {
    if ((rows[i]?.depth ?? 0) < depth)
      return i;
  }
  return -1;
};

/**
 * WAI-ARIA tree keys. The arrow keys move a cursor (the active row) and Enter or Space selects it; moving the cursor
 * doesn't select, because selecting re-renders the canvas and properties panel. Delete is left to the designer's own shortcut.
 */
export const useLayersKeyboard = (args: ILayersKeyboardArgs): ((event: KeyboardEvent<HTMLElement>) => void) => {
  const latest = useRef(args);
  useLayoutEffect(() => {
    latest.current = args;
  });
  const typeAhead = useRef({ text: '', time: 0 });

  return useCallback((event: KeyboardEvent<HTMLElement>) => {
    // keys pressed inside a row (its button, its menu) belong to that control
    if (event.target !== event.currentTarget)
      return;
    const { rows, activeId, setActiveId, getLabel, onSelect, setExpanded, scrollToRow, onOpenMenu, onMoveSelected } = latest.current;
    if (rows.length === 0)
      return;
    const handled = (): void => {
      event.preventDefault();
      event.stopPropagation();
    };
    // moves the selected component, so it works wherever the cursor is
    if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      if (isDefined(onMoveSelected)) {
        handled();
        onMoveSelected(event.key === 'ArrowUp' ? 'up' : 'down');
      }
      return;
    }
    const focusRow = (rowIndex: number): void => {
      const clamped = Math.min(Math.max(rowIndex, 0), rows.length - 1);
      const target = rows[clamped];
      if (!isDefined(target))
        return;
      setActiveId(target.id);
      scrollToRow(clamped);
    };

    const found = rows.findIndex((row) => row.id === activeId);
    if (found < 0 && NAVIGATION_KEYS.includes(event.key)) {
      handled();
      focusRow(0);
      return;
    }
    const currentIndex = Math.max(found, 0);
    const current = rows[currentIndex];
    if (!isDefined(current))
      return;

    if ((event.shiftKey && event.key === 'F10') || event.key === 'ContextMenu') {
      if (isDefined(onOpenMenu)) {
        handled();
        onOpenMenu(current.id);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        handled();
        focusRow(currentIndex + 1);
        return;
      case 'ArrowUp':
        handled();
        focusRow(currentIndex - 1);
        return;
      case 'Home':
        handled();
        focusRow(0);
        return;
      case 'End':
        handled();
        focusRow(rows.length - 1);
        return;
      case 'ArrowRight':
        handled();
        if (current.hasChildren && !current.isExpanded)
          setExpanded(current.id, true);
        else if (current.isExpanded)
          focusRow(currentIndex + 1);
        return;
      case 'ArrowLeft': {
        handled();
        if (current.isExpanded) {
          setExpanded(current.id, false);
          return;
        }
        const parentIndex = findParentRowIndex(rows, currentIndex);
        if (parentIndex >= 0)
          focusRow(parentIndex);
        return;
      }
      case 'Enter':
      case ' ':
        handled();
        onSelect(current.id);
        return;
      default:
        break;
    }

    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      handled();
      const now = Date.now();
      const typed = event.key.toLowerCase();
      const text = now - typeAhead.current.time < TYPE_AHEAD_RESET_MS ? typeAhead.current.text + typed : typed;
      typeAhead.current = { text, time: now };
      const start = text.length === 1 ? currentIndex + 1 : currentIndex;
      for (let offset = 0; offset < rows.length; offset++) {
        const candidateIndex = (start + offset) % rows.length;
        const candidate = rows[candidateIndex];
        if (isDefined(candidate) && getLabel(candidate.id).toLowerCase().startsWith(text)) {
          focusRow(candidateIndex);
          return;
        }
      }
    }
  }, []);
};
