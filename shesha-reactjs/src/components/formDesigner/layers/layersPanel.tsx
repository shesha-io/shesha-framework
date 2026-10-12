import { FC, KeyboardEvent, useCallback, useDeferredValue, useMemo, useRef, useState } from 'react';
import { Button, theme, Tooltip } from 'antd';
import { MinusSquareOutlined, PlusSquareOutlined } from '@ant-design/icons';
import { List, useListRef } from 'react-window';
import { CustomErrorBoundary } from '@/components/customErrorBoundary';
import { useFormDesigner } from '@/providers/formDesigner';
import { useFormPersisterIfAvailable } from '@/providers/formPersisterProvider';
import { isDefined } from '@/utils/nullables';
import { SearchBox } from '../toolboxSearchBox';
import { useAvailableHeight } from './hooks/useAvailableHeight';
import { useCanvasScroll } from './hooks/useCanvasScroll';
import { useSelectedComponentId } from './hooks/useDesignerSelection';
import { useExpandedState } from './hooks/useExpandedState';
import { useFollowSelection } from './hooks/useFollowSelection';
import { useLayersData } from './hooks/useLayersData';
import { useLayersKeyboard } from './hooks/useLayersKeyboard';
import { getLayerRowDomId, ILayerRowSharedProps, LayerRow } from './layerRow';
import { getExpandedStorageKey } from './model/expanded';
import { getLayerLabel } from './model/labels';
import { searchLayers } from './model/search';
import { getVisibleRows } from './model/visibleRows';
import { LAYER_OVERSCAN, LAYER_ROW_HEIGHT, useStyles } from './styles/styles';

const LayersPanelContent: FC = () => {
  const { styles } = useStyles();
  const { token } = theme.useToken();
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
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useListRef(null);
  const height = useAvailableHeight(rootRef);
  const scrollCanvasWhenDrawn = useCanvasScroll();
  useFollowSelection(rows, listRef, selectedId);

  /** Click or Enter: select the component (a pane row selects its owner) and open whatever hides it on the canvas */
  const selectRow = useCallback((rowId: string): void => {
    const node = layers.index.nodes.get(rowId);
    const componentId = node?.kind === 'pane' ? node.ownerId : node?.id;
    if (!isDefined(componentId))
      return;
    designer.setSelectedComponent(componentId);
    designer.reveal(rowId);
    setActiveId(rowId);
    scrollCanvasWhenDrawn(componentId);
  }, [designer, layers.index, scrollCanvasWhenDrawn]);

  const getLabel = useCallback((rowId: string): string => {
    const node = layers.index.nodes.get(rowId);
    return isDefined(node) ? getLayerLabel(node, designer.state.formFlatMarkup, designer.getComponentDefinition) : '';
  }, [designer, layers.index]);

  const scrollToRow = useCallback((rowIndex: number): void => {
    listRef.current?.scrollToRow({ index: rowIndex, align: 'auto' });
  }, [listRef]);

  const onTreeKeyDown = useLayersKeyboard({
    rows,
    activeId,
    setActiveId,
    getLabel,
    onSelect: selectRow,
    setExpanded: expandedState.setRowExpanded,
    scrollToRow,
  });

  /** Focus lands on the selected row, or the first row */
  const onTreeFocus = useCallback((): void => {
    if (isDefined(activeId) && rows.some((row) => row.id === activeId))
      return;
    setActiveId(rows.find((row) => row.id === selectedId)?.id ?? rows[0]?.id);
  }, [activeId, rows, selectedId]);

  const onSearchKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'Escape')
      return;
    event.stopPropagation();
    setQuery('');
  }, []);

  const rowProps = useMemo<ILayerRowSharedProps>(() => ({
    rows,
    layers: layers.index,
    activeId,
    hoverColor: token.colorPrimary,
    highlightText: deferredQuery,
    onRowClick: selectRow,
    onToggle: expandedState.toggle,
  }), [rows, layers.index, activeId, token.colorPrimary, deferredQuery, selectRow, expandedState.toggle]);

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
        listRef={listRef}
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
