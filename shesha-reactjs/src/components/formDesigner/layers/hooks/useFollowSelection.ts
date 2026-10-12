import { RefObject, useEffect, useRef } from 'react';
import { ListImperativeAPI } from 'react-window';
import { isDefined } from '@/utils/nullables';
import { ILayerRow } from '../model/types';

/**
 * After a selection (on the canvas or in the tree), scrolls the list to the selected row once it's visible,
 * only as far as needed. Runs once per selection, so it never fights the user's own scrolling.
 */
export const useFollowSelection = (rows: readonly ILayerRow[], listRef: RefObject<ListImperativeAPI | null>, selectedId: string | undefined): void => {
  const scrolledFor = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!isDefined(selectedId) || scrolledFor.current === selectedId)
      return;
    const rowIndex = rows.findIndex((row) => row.id === selectedId);
    if (rowIndex < 0)
      return;
    scrolledFor.current = selectedId;
    listRef.current?.scrollToRow({ index: rowIndex, align: 'auto' });
  }, [rows, selectedId, listRef]);
};
