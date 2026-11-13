import { ClipboardEvent, FC, FocusEvent, KeyboardEvent, MouseEvent, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { App, Button, theme, Tooltip } from 'antd';
import { MinusSquareOutlined, PlusSquareOutlined } from '@ant-design/icons';
import { announce, cleanup as cleanupAnnouncements } from '@atlaskit/pragmatic-drag-and-drop-live-region';
import { List, useListCallbackRef } from 'react-window';
import { CustomErrorBoundary } from '@/components/customErrorBoundary';
import { useFormDesigner } from '@/providers/formDesigner';
import type { IComponentMovePayload } from '@/providers/formDesigner/contexts';
import type { IPasteSelection } from '@/providers/formDesigner/clipboard';
import { useFormPersisterIfAvailable } from '@/providers/formPersisterProvider';
import { isDefined } from '@/utils/nullables';
import { SearchBox } from '../toolboxSearchBox';
import { useComponentClipboard } from '../clipboard/useComponentClipboard';
import { flashRow, LAYER_ROW_ID_ATTRIBUTE } from './canvasBridge';
import { useAvailableHeight } from './hooks/useAvailableHeight';
import { useCanvasScroll } from './hooks/useCanvasScroll';
import { useSelectedComponentId } from './hooks/useDesignerSelection';
import { useExpandedState } from './hooks/useExpandedState';
import { useFollowSelection } from './hooks/useFollowSelection';
import { useLayersData } from './hooks/useLayersData';
import { useLayersDragAndDrop } from './hooks/useLayersDragAndDrop';
import { useLayersKeyboard } from './hooks/useLayersKeyboard';
import { getLayerRowDomId, ILayerRowSharedProps, LayerRow } from './layerRow';
import { buildRowMenuItems, hasRowMenu, LayerMenuAction } from './layerRowMenu';
import { getExpandedStorageKey } from './model/expanded';
import { getLayerLabel } from './model/labels';
import { describeMove, getMoveDownAction, getMoveOutAction, getMoveUpAction } from './model/rowActions';
import { searchLayers } from './model/search';
import { getVisibleRows } from './model/visibleRows';
import { LAYER_OVERSCAN, LAYER_ROW_HEIGHT, useStyles } from './styles/styles';

const LayersPanelContent: FC = () => {
  const { styles } = useStyles();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const designer = useFormDesigner();
  const clipboard = useComponentClipboard();
  const layers = useLayersData();
  const persister = useFormPersisterIfAvailable();
  const expandedState = useExpandedState(layers.index, getExpandedStorageKey(persister?.formId));
  const selectedId = useSelectedComponentId();

  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  // The index follows structure changes only. While searching, editing a label or name can change what matches, so
  // the panel follows markup edits too; otherwise typing in the properties panel re-renders only the edited row
  const searching = deferredQuery.trim() !== '';
  const subscribeToMarkup = useCallback(
    (onChange: () => void) => (searching ? designer.subscribe('markup', onChange) : () => undefined),
    [designer, searching],
  );
  const getMarkup = useCallback(() => designer.state.formFlatMarkup, [designer]);
  const markup = useSyncExternalStore(subscribeToMarkup, getMarkup, getMarkup);
  const search = useMemo(
    () => searchLayers(layers.index, markup, designer.getComponentDefinition, deferredQuery),
    [layers.index, markup, designer, deferredQuery],
  );
  const rows = useMemo(
    () => getVisibleRows(layers.index, expandedState.expanded, search?.visible),
    [layers.index, expandedState.expanded, search],
  );

  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const [menuOpenId, setMenuOpenId] = useState<string | undefined>(undefined);
  const rootRef = useRef<HTMLDivElement>(null);
  // state, not a ref: react-window only has the list's element after its first render, and the hooks below need to know when it arrives
  const [list, setList] = useListCallbackRef(null);
  const height = useAvailableHeight(rootRef);
  const scrollCanvasWhenDrawn = useCanvasScroll();
  const { follow, skipNextSelection } = useFollowSelection(rows, list, selectedId);

  useEffect(() => () => cleanupAnnouncements(), []);

  /** A closed menu hands focus back to the tree, unless the user has already moved it elsewhere */
  const changeMenu = useCallback((rowId: string | undefined): void => {
    setMenuOpenId(rowId);
    if (!isDefined(rowId))
      window.setTimeout(() => {
        if (document.activeElement === document.body)
          list?.element?.focus();
      }, 0);
  }, [list]);

  /** Click or Enter: select the component (a pane row selects its owner) and open whatever hides it on the canvas */
  const selectRow = useCallback((rowId: string): void => {
    const node = layers.index.nodes.get(rowId);
    const componentId = node?.kind === 'pane' ? node.ownerId : node?.id;
    if (!isDefined(componentId))
      return;
    if (designer.selectedComponentId !== componentId)
      skipNextSelection();
    designer.setSelectedComponent(componentId);
    designer.reveal(rowId);
    setActiveId(rowId);
    scrollCanvasWhenDrawn(componentId);
  }, [designer, layers.index, scrollCanvasWhenDrawn, skipNextSelection]);

  /** Every move (drag and drop, menu, Alt+arrow): one undo step, then select, reveal, flash and announce */
  const performMove = useCallback((payload: IComponentMovePayload): void => {
    const before = designer.state.formFlatMarkup;
    const description = describeMove(before, designer.getContainerOwnership(), designer.getComponentDefinition, payload);
    const result = designer.moveComponent(payload);
    if (!result.ok) {
      void message.warning(result.reason);
      return;
    }
    if (designer.state.formFlatMarkup === before)
      return; // dropped where it already was
    selectRow(payload.componentId);
    follow(payload.componentId);
    flashRow(payload.componentId);
    announce(description);
  }, [designer, follow, message, selectRow]);

  /** A pane row pastes into that pane; a component row uses the component */
  const pasteSelectionFor = useCallback((rowId: string): IPasteSelection =>
    (layers.index.nodes.get(rowId)?.kind === 'pane' ? { containerId: rowId } : { componentId: rowId }), [layers.index]);

  const runMenuAction = useCallback((rowId: string, action: LayerMenuAction): void => {
    changeMenu(undefined);
    if (action === 'copy' || action === 'cut') {
      void clipboard.copyToClipboard(rowId, action === 'cut');
      return;
    }
    if (action === 'paste-after' || action === 'paste-inside') {
      void clipboard.pasteFromClipboard(pasteSelectionFor(rowId), action === 'paste-after' ? 'after' : 'inside');
      return;
    }
    if (action === 'copy-settings') {
      void clipboard.copySettings(rowId);
      return;
    }
    if (action === 'paste-settings') {
      void clipboard.pasteSettings(rowId);
      return;
    }
    if (action === 'duplicate') {
      designer.duplicateComponent({ componentId: rowId });
      return;
    }
    if (action === 'delete') {
      designer.deleteComponent({ componentId: rowId });
      return;
    }
    const markup = designer.state.formFlatMarkup;
    const state = action === 'move-up'
      ? getMoveUpAction(markup, rowId)
      : action === 'move-down'
        ? getMoveDownAction(markup, rowId)
        : getMoveOutAction(markup, designer.getContainerOwnership(), rowId);
    if (state.enabled)
      performMove(state.payload);
  }, [changeMenu, clipboard, designer, pasteSelectionFor, performMove]);

  const moveSelected = useCallback((direction: 'up' | 'down'): void => {
    const componentId = designer.selectedComponentId;
    if (!isDefined(componentId))
      return;
    const markup = designer.state.formFlatMarkup;
    const state = direction === 'up' ? getMoveUpAction(markup, componentId) : getMoveDownAction(markup, componentId);
    if (state.enabled)
      performMove(state.payload);
  }, [designer, performMove]);

  const getMenuItems = useCallback((rowId: string) => {
    const node = layers.index.nodes.get(rowId);
    return isDefined(node) ? buildRowMenuItems(designer.state.formFlatMarkup, designer.getContainerOwnership(), node) : [];
  }, [designer, layers.index]);

  const openMenu = useCallback((rowId: string): void => {
    const node = layers.index.nodes.get(rowId);
    if (isDefined(node) && hasRowMenu(node))
      setMenuOpenId(rowId);
  }, [layers.index]);

  // With the tree focused, Ctrl+C, X and V work on the row under the keyboard cursor, so a tab row can take a paste.
  // Copying a tab, step or column row copies the component it belongs to
  const onTreeCopy = useCallback((event: ClipboardEvent<HTMLElement>): void => {
    const node = isDefined(activeId) ? layers.index.nodes.get(activeId) : undefined;
    const componentId = node?.kind === 'pane' ? node.ownerId : node?.id;
    const text = isDefined(componentId) ? clipboard.getCopyText(componentId) : undefined;
    if (!isDefined(componentId) || !isDefined(text))
      return;
    event.preventDefault();
    event.stopPropagation();
    event.clipboardData.setData('text/plain', text);
    clipboard.finishCopy(componentId, event.type === 'cut');
  }, [activeId, clipboard, layers.index]);

  const pasteAfter = useRef(false);
  const onTreePaste = useCallback((event: ClipboardEvent<HTMLElement>): void => {
    const mode = pasteAfter.current ? 'after' : 'auto';
    pasteAfter.current = false;
    if (!isDefined(activeId))
      return;
    if (clipboard.paste(event.clipboardData.getData('text/plain'), pasteSelectionFor(activeId), mode)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, [activeId, clipboard, pasteSelectionFor]);

  const dnd = useLayersDragAndDrop({ listElement: list?.element ?? null, layers, rows, expandedState, dragEnabled: !isDefined(search), performMove });

  const getLabel = useCallback((rowId: string): string => {
    const node = layers.index.nodes.get(rowId);
    return isDefined(node) ? getLayerLabel(node, designer.state.formFlatMarkup, designer.getComponentDefinition) : '';
  }, [designer, layers.index]);

  const scrollToRow = useCallback((rowIndex: number): void => {
    list?.scrollToRow({ index: rowIndex, align: 'auto' });
  }, [list]);

  const onTreeKeyDown = useLayersKeyboard({
    rows,
    activeId,
    setActiveId,
    getLabel,
    onSelect: selectRow,
    setExpanded: expandedState.setRowExpanded,
    scrollToRow,
    onOpenMenu: openMenu,
    onMoveSelected: moveSelected,
  });

  const onTreeKeyDownWithPaste = useCallback((event: KeyboardEvent<HTMLElement>): void => {
    // the paste event doesn't say whether Shift was held
    if ((event.ctrlKey || event.metaKey) && event.code === 'KeyV')
      pasteAfter.current = event.shiftKey;
    onTreeKeyDown(event);
  }, [onTreeKeyDown]);

  /**
   * Focus lands on the row the keyboard cursor was on, else the selected row, else the first row. Keyboard focus also
   * scrolls that row into view so the list draws it; a mouse press (on a row, or on the scrollbar, which focuses the
   * tree too) leaves the scroll where the user put it
   */
  const onTreeFocus = useCallback((event: FocusEvent<HTMLElement>): void => {
    const activeIndex = rows.findIndex((row) => row.id === activeId);
    const index = activeIndex >= 0 ? activeIndex : Math.max(rows.findIndex((row) => row.id === selectedId), 0);
    const row = rows[index];
    if (!isDefined(row))
      return;
    setActiveId(row.id);
    if (event.currentTarget.matches(':focus-visible'))
      scrollToRow(index);
  }, [activeId, rows, selectedId, scrollToRow]);

  /** Pressing a row (to click or drag it) puts the keyboard cursor there rather than on the first row */
  const onTreeMouseDown = useCallback((event: MouseEvent<HTMLElement>): void => {
    const rowId = event.target instanceof Element ? event.target.closest(`[${LAYER_ROW_ID_ATTRIBUTE}]`)?.getAttribute(LAYER_ROW_ID_ATTRIBUTE) : undefined;
    if (isDefined(rowId))
      setActiveId(rowId);
  }, []);

  const onSearchKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'Escape')
      return;
    event.stopPropagation();
    setQuery('');
    if (isDefined(designer.selectedComponentId))
      follow(designer.selectedComponentId);
  }, [designer, follow]);

  const rowProps = useMemo<ILayerRowSharedProps>(() => ({
    rows,
    layers: layers.index,
    activeId,
    hoverColor: token.colorPrimary,
    highlightText: deferredQuery,
    menuOpenId,
    dnd,
    onRowClick: selectRow,
    onToggle: expandedState.toggle,
    onMenuOpenChange: changeMenu,
    onMenuAction: runMenuAction,
    getMenuItems,
  }), [rows, layers.index, activeId, token.colorPrimary, deferredQuery, menuOpenId, dnd, selectRow, expandedState.toggle, changeMenu, runMenuAction, getMenuItems]);

  const matchCount = search?.matches.size;

  return (
    <div ref={rootRef} className={styles.panel}>
      <div onKeyDown={onSearchKeyDown}>
        <SearchBox value={query} onChange={setQuery} placeholder="Search layers" />
      </div>
      <div className={styles.toolbar}>
        {isDefined(matchCount) && (
          <span className={styles.matchCount}>{matchCount === 1 ? '1 match' : `${matchCount} matches`}</span>
        )}
        <span className={styles.toolbarSpacer} />
        <Tooltip title="Expand all">
          <Button type="text" size="small" aria-label="Expand all" icon={<PlusSquareOutlined />} onClick={expandedState.expandAll} />
        </Tooltip>
        <Tooltip title="Collapse all">
          <Button type="text" size="small" aria-label="Collapse all" icon={<MinusSquareOutlined />} onClick={expandedState.collapseAll} />
        </Tooltip>
      </div>
      <List
        className={styles.tree}
        role="tree"
        aria-label="Form layers"
        aria-activedescendant={isDefined(activeId) ? getLayerRowDomId(activeId) : undefined}
        tabIndex={0}
        onKeyDown={onTreeKeyDownWithPaste}
        onCopy={onTreeCopy}
        onCut={onTreeCopy}
        onPaste={onTreePaste}
        onFocus={onTreeFocus}
        onMouseDown={onTreeMouseDown}
        listRef={setList}
        rowComponent={LayerRow}
        rowCount={rows.length}
        rowHeight={LAYER_ROW_HEIGHT}
        rowProps={rowProps}
        overscanCount={LAYER_OVERSCAN}
        defaultHeight={height}
        style={{ height }}
      />
    </div>
  );
};

export const LayersPanel: FC = () => (
  <CustomErrorBoundary componentName="Layers" componentType="panel">
    <LayersPanelContent />
  </CustomErrorBoundary>
);
