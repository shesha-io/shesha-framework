import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useFormDesigner } from '@/providers/formDesigner';
import { isDefined } from '@/utils/nullables';
import { getAllExpandable, getDefaultExpanded, getPathTo, readExpanded, toggleExpanded, withPathTo, writeExpanded } from '../model/expanded';
import { ILayersIndex } from '../model/types';

export interface IExpandedState {
  expanded: ReadonlySet<string>;
  toggle: (id: string, withSubtree: boolean) => void;
  setRowExpanded: (id: string, value: boolean) => void;
  expandAll: () => void;
  /** Collapses everything except the path to the selected component */
  collapseAll: () => void;
}

/** Which rows are open: remembered per form, and opened along the path whenever something gets selected */
export const useExpandedState = (index: ILayersIndex, storageKey: string | undefined): IExpandedState => {
  const designer = useFormDesigner();
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => {
    const stored = readExpanded(storageKey);
    const selectedId = designer.selectedComponentId;
    if (!isDefined(stored))
      return getDefaultExpanded(index, selectedId);
    const known = new Set([...stored].filter((id) => index.nodes.has(id)));
    return isDefined(selectedId) && index.nodes.has(selectedId) ? withPathTo(known, index, selectedId) : known;
  });
  const indexRef = useRef(index);
  useLayoutEffect(() => {
    indexRef.current = index;
  });

  useEffect(() => {
    writeExpanded(storageKey, expanded);
  }, [storageKey, expanded]);

  // 'selection' also fires on every markup update, so only a different selection opens a path
  const selectedRef = useRef(designer.selectedComponentId);
  useEffect(() => designer.subscribe('selection', () => {
    const id = designer.selectedComponentId;
    if (id === selectedRef.current)
      return;
    selectedRef.current = id;
    if (isDefined(id) && indexRef.current.nodes.has(id))
      setExpanded((current) => withPathTo(current, indexRef.current, id));
  }), [designer]);

  // when the selected component lands somewhere else (a drop, a row action, undo), open its new path
  const previousIndexRef = useRef(index);
  useEffect(() => {
    const previousIndex = previousIndexRef.current;
    previousIndexRef.current = index;
    const id = designer.selectedComponentId;
    if (previousIndex === index || !isDefined(id))
      return;
    const parentId = index.nodes.get(id)?.parentId;
    if (parentId !== undefined && previousIndex.nodes.get(id)?.parentId !== parentId)
      setExpanded((current) => withPathTo(current, index, id));
  }, [index, designer]);

  const toggle = useCallback((id: string, withSubtree: boolean) => {
    setExpanded((current) => toggleExpanded(current, indexRef.current, id, withSubtree));
  }, []);

  const setRowExpanded = useCallback((id: string, value: boolean) => {
    setExpanded((current) => {
      if (current.has(id) === value)
        return current;
      const next = new Set(current);
      if (value)
        next.add(id);
      else
        next.delete(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpanded(getAllExpandable(indexRef.current));
  }, []);

  const collapseAll = useCallback(() => {
    setExpanded(getPathTo(indexRef.current, designer.selectedComponentId));
  }, [designer]);

  return { expanded, toggle, setRowExpanded, expandAll, collapseAll };
};
