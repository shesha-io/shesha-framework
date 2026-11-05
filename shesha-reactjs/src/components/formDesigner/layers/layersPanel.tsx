import { FC, KeyboardEvent, MouseEvent, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { App, Button, theme, Tooltip } from 'antd';
import { MinusSquareOutlined, PlusSquareOutlined } from '@ant-design/icons';
import { announce, cleanup as cleanupAnnouncements } from '@atlaskit/pragmatic-drag-and-drop-live-region';
import { List, useListCallbackRef } from 'react-window';
import { CustomErrorBoundary } from '@/components/customErrorBoundary';
import { useFormDesigner } from '@/providers/formDesigner';
import type { IComponentMovePayload } from '@/providers/formDesigner/contexts';
import { useFormPersisterIfAvailable } from '@/providers/formPersisterProvider';
import { isDefined } from '@/utils/nullables';
import { SearchBox } from '../toolboxSearchBox';
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
import { buildRowMenuItems, LayerMenuAction } from './layerRowMenu';
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
  const layers = useLayersData();
  const persister = useFormPersisterIfAvailable();
  const expandedState = useExpandedState(layers.index, getExpandedStorageKey(persister?.formId));
  const selectedId = useSelectedComponentId();

  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const search = useMemo(
    () => searchLayers(layers.index, designer.state.formFlatMarkup, designer.getComponentDefinition, deferredQuery),
    [layers.index, designer, deferredQuery],
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

  const runMenuAction = useCallback((rowId: string, action: LayerMenuAction): void => {
    changeMenu(undefined);
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
  }, [changeMenu, designer, performMove]);

  const moveSelected = useCallback((direction: 'up' | 'down'): void => {
    const componentId = designer.selectedComponentId;
    if (!isDefined(componentId))
      return;
    const markup = designer.state.formFlatMarkup;
    const state = direction === 'up' ? getMoveUpAction(markup, componentId) : getMoveDownAction(markup, componentId);
    if (state.enabled)
      performMove(state.payload);
  }, [designer, performMove]);

  const getMenuItems = useCallback(
    (rowId: string) => buildRowMenuItems(designer.state.formFlatMarkup, designer.getContainerOwnership(), rowId),
    [designer],
  );

  const openMenu = useCallback((rowId: string): void => {
    if (layers.index.nodes.get(rowId)?.kind === 'component')
      setMenuOpenId(rowId);
  }, [layers.index]);

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

  /** Focus lands on the selected row, or the first row, scrolled into view so the list draws it */
  const onTreeFocus = useCallback((): void => {
    if (isDefined(activeId) && rows.some((row) => row.id === activeId))
      return;
    const selectedIndex = rows.findIndex((row) => row.id === selectedId);
    const index = selectedIndex >= 0 ? selectedIndex : 0;
    const row = rows[index];
    if (!isDefined(row))
      return;
    setActiveId(row.id);
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
        onKeyDown={onTreeKeyDown}
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
