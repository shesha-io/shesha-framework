import { useCallback, useEffect, useRef, useState } from 'react';
import { ListImperativeAPI } from 'react-window';
import { isDefined } from '@/utils/nullables';
import { ILayerRow } from '../model/types';

export interface IFollowSelection {
  /** Scroll to this row once it's in the list (after a move, after clearing a search) */
  follow: (rowId: string) => void;
  /** The next selection change comes from a click in the tree, where the row is already in view */
  skipNextSelection: () => void;
}

/**
 * Scrolls the list, only as far as needed, to rows that should come into view: the selection when the panel opens or
 * when it changes outside the tree (on the canvas), and rows the panel asks for. Waits for the list's element:
 * react-window only has it after its first render.
 */
export const useFollowSelection = (rows: readonly ILayerRow[], list: ListImperativeAPI | null, selectedId: string | undefined): IFollowSelection => {
  const [request, setRequest] = useState<{ id: string; count: number } | undefined>(() => (isDefined(selectedId) ? { id: selectedId, count: 0 } : undefined));
  const handledCount = useRef(-1);
  const skipSelection = useRef(false);

  const follow = useCallback((rowId: string): void => {
    setRequest((current) => ({ id: rowId, count: (current?.count ?? 0) + 1 }));
  }, []);

  const skipNextSelection = useCallback((): void => {
    skipSelection.current = true;
  }, []);

  const previousSelectedId = useRef(selectedId);
  useEffect(() => {
    if (selectedId === previousSelectedId.current)
      return;
    previousSelectedId.current = selectedId;
    if (skipSelection.current)
      skipSelection.current = false;
    else if (isDefined(selectedId))
      follow(selectedId);
  }, [selectedId, follow]);

  useEffect(() => {
    if (!isDefined(request) || handledCount.current === request.count || !isDefined(list?.element))
      return;
    const rowIndex = rows.findIndex((row) => row.id === request.id);
    if (rowIndex < 0)
      return;
    handledCount.current = request.count;
    list.scrollToRow({ index: rowIndex, align: 'auto' });
  }, [request, rows, list]);

  return { follow, skipNextSelection };
};
